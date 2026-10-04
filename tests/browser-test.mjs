import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { analyzeProject } from '../src/core.mjs';

// The same inline production build is exercised over HTTP and from file://.
// Chromium always retains its sandbox. Delayed File.text is used only in the
// explicitly named import-race cases; analysis/compiler/downloads remain real.
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173/';
const artifactDir = path.resolve(process.env.BROWSER_ARTIFACT_DIR || 'test-results/browser');
const appFile = path.resolve(process.env.APP_FILE || 'dist/index.html');
const fixture = JSON.parse(await readFile(new URL('../fixtures/twelve-contexts.json', import.meta.url),'utf8'));
const cases = [];
const add = (name,run,options = {}) => cases.push({name,run,...options});
let browser;
const results = [], pageErrors = [];
const sourceFile = (project,name='project.json') => ({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
async function open(page,language='en',url=baseURL) {
  await page.goto(url);
  await page.locator('#analyze').waitFor({state:'visible'});
  if (await page.locator('html').getAttribute('lang') !== language) await page.locator('#language').click();
  assert.equal(await page.locator('html').getAttribute('lang'),language);
}
async function empty(page) {
  assert.equal(await page.locator('#download').isDisabled(),true,'Stale export unavailable');
  assert.equal(await page.locator('#report').isDisabled(),true,'Stale report unavailable');
  assert.equal(await page.locator('#inspection-panel').isVisible(),false);
  assert.equal(await page.locator('#review-section').isVisible(),false);
  assert.equal(await page.locator('#stat-rules').innerText(),'—');
}
async function analyze(page) {
  await page.locator('#analyze').click();
  await page.locator('#priority-content').waitFor({state:'visible'});
  assert.equal(await page.locator('#download').isDisabled(),false);
  assert.equal(await page.locator('#state-pill').innerText(),await page.locator('html').getAttribute('lang') === 'en' ? 'ANALYZED' : '解析済み');
}
async function setProject(page,project) { await page.locator('#project-input').fill(JSON.stringify(project,null,2)); }
async function importProject(page,project,name='project.json') {
  await page.locator('#project-file').setInputFiles(sourceFile(project,name));
  await page.waitForFunction(expected => document.querySelector('#project-input').value === expected, JSON.stringify(project));
}
async function moveBottomUp(page) { await page.locator('#priority-list .rule-card').last().locator('[data-direction="up"]').click(); }
async function choosePython(page) { await page.locator('[data-rule-id="s1:r2"] [data-direction="up"]').click(); }
async function noOverflow(page) {
  const bounds = await page.evaluate(() => ({viewport:innerWidth, document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
  assert.ok(bounds.document <= bounds.viewport + 1,JSON.stringify(bounds));
  assert.ok(bounds.body <= bounds.viewport + 1,JSON.stringify(bounds));
}
async function screenshot(page,name) { await noOverflow(page); await page.screenshot({path:path.join(artifactDir,name+'.png'),fullPage:true}); }
async function download(page,name) {
  const promise = page.waitForEvent('download'); await page.locator('#download').click(); const item = await promise;
  const file = path.join(artifactDir,name); await item.saveAs(file); assert.equal(await item.failure(),null); assert.ok((await stat(file)).size > 50); return {file,filename:item.suggestedFilename()};
}
async function delayFiles(page) {
  await page.addInitScript(() => {
    const original = File.prototype.text;
    window.__delayedFiles = {};
    File.prototype.text = function () {
      if (!this.name.startsWith('slow-')) return original.call(this);
      const file = this;
      return new Promise((resolve,reject) => { window.__delayedFiles[file.name] = () => original.call(file).then(resolve,reject); });
    };
  });
}
async function release(page,name) { await page.evaluate(async name => { await window.__delayedFiles[name](); await new Promise(resolve=>setTimeout(resolve,0)); },name); }

add('initial-state-and-keyboard-navigation',async page => {
  await open(page,'ja'); await empty(page);
  await page.keyboard.press('Tab'); assert.equal(await page.locator('.skip-link').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Enter'); assert.equal(await page.locator('#workspace').evaluate(el=>el===document.activeElement),true);
  await page.locator('#analyze').focus(); await page.keyboard.press('Enter');
  await page.locator('#priority-content').waitFor({state:'visible'});
  assert.equal(await page.locator('#stat-contexts').innerText(),'12');
  assert.equal(await page.locator('#status').getAttribute('aria-live'),'polite');
  await noOverflow(page);
});
add('actual-compiler-reorder-keyboard-and-zip',async page => {
  await open(page); await setProject(page,fixture); await analyze(page);
  assert.equal(await page.locator('#stat-rules').innerText(),'3'); assert.equal(await page.locator('#stat-overlaps').innerText(),'3'); assert.equal(await page.locator('#stat-changes').innerText(),'0');
  const original = await page.locator('#priority-list .rule-card').evaluateAll(rows=>rows.map(row=>row.dataset.ruleId));
  const control = page.locator('[data-rule-id="s1:r2"] [data-direction="up"]');
  await control.focus(); await page.keyboard.press('Enter');
  const changed = await page.locator('#priority-list .rule-card').evaluateAll(rows=>rows.map(row=>row.dataset.ruleId));
  assert.notDeepEqual(changed,original); assert.deepEqual(changed,['s1:r2','s2:r1','s1:r1']);
  assert.equal(await page.locator('#priority-list .rule-card').first().evaluate(el=>el.contains(document.activeElement)),true,'Focus follows moved rule');
  assert.equal(Number(await page.locator('#stat-changes').innerText()),1);
  assert.match(await page.locator('#delta-list').innerText(),/demo.selection/); assert.match(await page.locator('#delta-list').innerText(),/demo.python/);
  const expected = analyzeProject(fixture,{[fixture.sources[0].rules[0].key]:changed});
  assert.equal(Number(await page.locator('#stat-changes').innerText()),expected.stats.changedCount);
  const item = await download(page,'browser-review.zip'); assert.equal(item.filename,'whenfold-review.zip');
  const actual = path.join(artifactDir,'actual-artifacts'); await mkdir(actual,{recursive:true});
  execFileSync('python3',['-c',`import json,pathlib,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 assert set(z.namelist())=={'keybindings.json','original-keybindings.json','source-map.json','scenarios.json','behavior-delta.csv','report.html'}
 data=json.loads(z.read('scenarios.json')); assert len(data['scenarios'])==12
 assert data['priority']['ctrl+alt+k']==['s1:r2','s2:r1','s1:r1']
 changed=[s for s in data['scenarios'] if s['before']!=s['after']]; assert len(changed)==1
 assert changed[0]['before']['command']=='demo.selection' and changed[0]['after']['command']=='demo.python'
 assert all(len(s['matchedExportIds'])<=1 for s in data['scenarios'])
 assert len(json.loads(z.read('keybindings.json')))==3
 assert len(json.loads(z.read('source-map.json'))['entries'])==3
 assert b'<html' in z.read('report.html')
 for name in z.namelist(): (pathlib.Path(sys.argv[2])/name).write_bytes(z.read(name))
`,item.file,actual]);
  await copyFile(new URL('../fixtures/twelve-contexts.json',import.meta.url),path.join(actual,'project.json'));
  execFileSync(process.execPath,['tools/oracle.mjs',actual],{stdio:'inherit'});
  const oracle=JSON.parse(await readFile(path.join(actual,'oracle-report.json'),'utf8')); assert.equal(oracle.status,'passed'); assert.equal(oracle.checks.changedScenarios,1);
});
add('actual-downloaded-report-offline-a4-print',async (page,context) => {
  // The previous case extracted this exact report from the browser download.
  // Never regenerate it from core objects: this is a real exported-file consumer.
  const reportFile=path.join(artifactDir,'actual-artifacts','report.html');
  const reportBytes=await readFile(reportFile);
  const external=[]; page.on('request',request=>{if(!/^(file:|blob:|data:)/.test(request.url()))external.push(request.url());});
  await context.setOffline(true);
  await page.goto(pathToFileURL(reportFile).href);
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').innerText(),'WhenFold');
  const headings=await page.locator('h2').allTextContents();
  for(const heading of ['Priority','Behavior delta','Export source map','Files'])assert.ok(headings.some(text=>text.includes(heading)),`Missing report heading: ${heading}`);
  const visible=await page.locator('body').innerText();
  for(const text of ['3 rules','12 logical contexts','1 behavior changes','platform linux','demo.selection','demo.python','whenfold.focus','whenfold.selection','whenfold.lang','Everyday + Python','Selection pack'])assert.ok(visible.includes(text),`Missing report content: ${text}`);
  assert.equal(await page.locator('table').count(),2);
  assert.equal(await page.locator('table').nth(0).locator('tbody tr').count(),1,'Exactly one printed behavior delta');
  assert.equal(await page.locator('table').nth(1).locator('tbody tr').count(),3,'All three mapped source rules are printed');
  for(const id of ['s1:r1','s1:r2','s2:r1'])assert.ok((await page.locator('table').nth(1).innerText()).includes(id));
  assert.deepEqual(external,[],'Report renders offline without external requests');
  await noOverflow(page);
  await page.screenshot({path:path.join(artifactDir,'downloaded-report-screen.png'),fullPage:true});
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.fonts.ready);
  await noOverflow(page);
  const bounds=await page.evaluate(()=>({
    viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
    overflow:Array.from(document.querySelectorAll('table,td,pre')).flatMap(el=>{
      const box=el.getBoundingClientRect();
      return box.left < -1 || box.right > innerWidth+1 || el.scrollWidth > el.clientWidth+1 ? [{tag:el.tagName,left:box.left,right:box.right,scroll:el.scrollWidth,client:el.clientWidth}] : [];
    })
  }));
  assert.deepEqual(bounds.overflow,[],'Print media content stays within horizontal bounds');
  const pdf=path.join(artifactDir,'downloaded-report-A4.pdf');
  await page.pdf({path:pdf,format:'A4',landscape:true,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  const pdfBytes=await readFile(pdf);assert.ok(pdfBytes.length>1000);
  const info=execFileSync('pdfinfo',[pdf],{encoding:'utf8'});
  const pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
  assert.ok(pages>=1&&pages<=4,`Unexpected fixture page count: ${pages}`);
  const sizes=execFileSync('pdfinfo',['-f','1','-l',String(pages),pdf],{encoding:'utf8'});
  const measured=[...sizes.matchAll(/^Page\s+\d+ size:\s+([\d.]+) x ([\d.]+) pts/mg)].map(m=>({width:Number(m[1]),height:Number(m[2])}));
  assert.equal(measured.length,pages,'Every PDF page size was measured');
  assert.ok(measured.every(size=>Math.abs(size.width-841.89)<2&&Math.abs(size.height-595.28)<2),'Every page uses A4 landscape');
  const text=execFileSync('pdftotext',['-layout',pdf,'-'],{encoding:'utf8'});
  for(const expected of ['WhenFold','3 rules','12 logical contexts','1 behavior changes','Priority','Behavior delta','Export source map','demo.selection','demo.python','s1:r1','s1:r2','s2:r1'])assert.ok(text.includes(expected),`Printed PDF lost content: ${expected}`);
  const renders=path.join(artifactDir,'report-print-pages');await mkdir(renders,{recursive:true});
  execFileSync('pdftoppm',['-scale-to','1400','-png',pdf,path.join(renders,'page')]);
  await writeFile(path.join(renders,'pdfinfo.txt'),sizes);
  await writeFile(path.join(renders,'text.txt'),text);
  await writeFile(path.join(artifactDir,'report-print.json'),JSON.stringify({
    status:'passed',source:'Actual report.html from browser-downloaded ZIP',offline:true,
    sourceSha256:createHash('sha256').update(reportBytes).digest('hex'),pdfSha256:createHash('sha256').update(pdfBytes).digest('hex'),
    pages,pageSizes:measured,bounds,externalRequests:external,
    screenScreenshot:'downloaded-report-screen.png',pdf:'downloaded-report-A4.pdf',renderedPages:'report-print-pages/page-*.png',
    note:'Automated content and size assertions passed. Rendered pages still require visual inspection.'
  },null,2)+'\n');
},{viewport:{width:1123,height:794}});
add('generic-priority-move-and-reverse',async page => {
  await open(page); await analyze(page); const order=await page.locator('#priority-list .rule-card').evaluateAll(rows=>rows.map(row=>row.dataset.ruleId));
  await moveBottomUp(page); assert.equal(Number(await page.locator('#stat-changes').innerText()),1);
  await page.locator('[data-rule-id="s1:r1"] [data-direction="down"]').click();
  assert.deepEqual(await page.locator('#priority-list .rule-card').evaluateAll(rows=>rows.map(row=>row.dataset.ruleId)),order); assert.equal(await page.locator('#stat-changes').innerText(),'0');
});
add('invalid-edit-clears-every-result-and-reset',async page => {
  await open(page); await analyze(page); await page.locator('#project-input').fill('{broken'); await empty(page);
  await page.locator('#analyze').click(); await empty(page); assert.match(await page.locator('#status').innerText(),/Could not analyze/);
  assert.equal(await page.locator('#state-pill').innerText(),'INPUT ERROR');
  await page.locator('#example').click(); await empty(page); assert.equal(await page.locator('#state-pill').innerText(),'NOT ANALYZED');
  await analyze(page); assert.equal(await page.locator('#stat-contexts').innerText(),'12');
  await page.locator('#analyze').click(); assert.equal(await page.locator('#priority-list .rule-card').count(),3,'Repeated analysis replaces the result');
});
add('file-import-invalid-import-and-reimport',async page => {
  await open(page); await analyze(page);
  const changed = structuredClone(fixture); changed.sources[0].name='Imported source';
  await importProject(page,changed); await empty(page); await analyze(page);
  assert.ok((await page.locator('#priority-list').innerText()).includes('Imported source'));
  await page.locator('#project-file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{')});
  await page.waitForFunction(()=>document.querySelector('#status').classList.contains('error'));
  await empty(page);
  await importProject(page,changed); await analyze(page); assert.equal(await page.locator('#stat-rules').innerText(),'3');
});
add('jsonc-snippet-append-and-draft-invalidation',async page => {
  await open(page); await analyze(page); await page.locator('.snippet-details summary').click();
  await page.locator('#source-name').fill('Extra source'); await empty(page);
  await page.locator('#snippet-input').fill('// comment\n[{"key":"ctrl+x","command":"extra.command",},]');
  await page.locator('#append').click(); await empty(page);
  const project = JSON.parse(await page.locator('#project-input').inputValue()); assert.equal(project.sources.at(-1).name,'Extra source');
  assert.equal(project.sources.at(-1).rules[0].command,'extra.command');
  await analyze(page); assert.equal(await page.locator('#stat-rules').innerText(),'4');
  await page.locator('#group-select').selectOption('ctrl+x'); assert.match(await page.locator('#priority-list').innerText(),/extra.command/);
  await page.locator('#source-name').fill('Another draft'); await empty(page);
});
add('slow-file-cannot-overwrite-reset',async page => {
  await delayFiles(page); await open(page); await analyze(page);
  const changed = structuredClone(fixture); changed.sources[0].name='Must never appear';
  await page.locator('#project-file').setInputFiles(sourceFile(changed,'slow-reset.json')); await empty(page);
  await page.locator('#example').click(); const reset = await page.locator('#project-input').inputValue();
  await release(page,'slow-reset.json'); assert.equal(await page.locator('#project-input').inputValue(),reset); await empty(page);
});
add('slow-file-cannot-overwrite-newer-import',async page => {
  await delayFiles(page); await open(page);
  const old = structuredClone(fixture); old.sources[0].name='Older file'; const latest = structuredClone(fixture); latest.sources[0].name='Latest file';
  await page.locator('#project-file').setInputFiles(sourceFile(old,'slow-old.json'));
  await importProject(page,latest,'latest.json'); await release(page,'slow-old.json');
  assert.deepEqual(JSON.parse(await page.locator('#project-input').inputValue()),latest); await empty(page); await analyze(page);
});
add('slow-file-cannot-overwrite-edit-or-analysis',async page => {
  await delayFiles(page); await open(page);
  const old = structuredClone(fixture); old.sources[0].name='Older file'; const latest = structuredClone(fixture); latest.sources[0].name='Latest edit';
  await page.locator('#project-file').setInputFiles(sourceFile(old,'slow-edit.json')); await setProject(page,latest); await analyze(page);
  await release(page,'slow-edit.json'); assert.deepEqual(JSON.parse(await page.locator('#project-input').inputValue()),latest); assert.equal(await page.locator('#download').isDisabled(),false);
});
add('safe-text-rendering-report-and-single-file-export',async page => {
  await open(page); const hostile = structuredClone(fixture);
  hostile.sources[0].name='<img src=x onerror="window.__xss=1">';
  hostile.sources[0].rules[0].command='cmd.<svg/onload=window.__xss=2>';
  hostile.sources[0].rules[0].args={html:'</script><script>window.__xss=3</script>'};
  await setProject(page,hostile); await analyze(page);
  assert.equal(await page.locator('.priority-list img, .priority-list svg').count(),0);
  assert.equal(await page.evaluate(()=>window.__xss),undefined);
  await page.locator('#priority-list .rule-card').last().locator('.rule-select').click();
  assert.match(await page.locator('#rule-detail').innerText(),/<svg\/onload/);
  assert.match(await page.locator('#rule-detail').innerText(),/<\/script>/);
  await page.locator('#report').click(); assert.equal(await page.locator('#report-dialog').isVisible(),true);
  assert.equal(await page.locator('#report-frame').getAttribute('sandbox'),'');
  assert.match(await page.locator('#report-frame').getAttribute('src'),/^blob:/);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#report-dialog').isVisible(),false);
  await page.locator('#export-format').selectOption('keybindings.json'); const item=await download(page,'browser-keybindings.json');
  assert.equal(item.filename,'keybindings.json'); const rules=JSON.parse(await readFile(item.file,'utf8'));
  assert.ok(rules.some(rule=>rule.command.includes('<svg'))); assert.equal(await page.evaluate(()=>window.__xss),undefined);
});
add('args-only-delta-and-absent-context-visible',async page => {
  await open(page); const project={version:1,platform:'linux',sources:[{name:'Args',rules:[{key:'ctrl+a',command:'same',args:null},{key:'ctrl+a',command:'same',args:{mode:'new'}}]}],model:{'whenfold.optional':{type:'string',values:['yes',null]}}};
  await setProject(page,project); await analyze(page); await moveBottomUp(page);
  assert.equal(await page.locator('#stat-changes').innerText(),'2');
  assert.match(await page.locator('#delta-list').innerText(),/args: null/); assert.match(await page.locator('#delta-list').innerText(),/"mode":"new"/); assert.match(await page.locator('#delta-list').innerText(),/absent/);
});
add('language-persistence-and-desktop-screenshots',async page => {
  await open(page,'ja'); await analyze(page); await choosePython(page); await screenshot(page,'desktop-ja');
  await page.locator('#language').click(); assert.equal(await page.locator('html').getAttribute('lang'),'en'); await screenshot(page,'desktop-en');
  await page.reload(); assert.equal(await page.locator('html').getAttribute('lang'),'en'); await empty(page);
});
add('japanese-and-english-mobile-layout',async page => {
  await open(page,'ja'); await analyze(page); await choosePython(page); await screenshot(page,'mobile-ja');
  await page.locator('#language').click(); await screenshot(page,'mobile-en');
  await page.locator('.snippet-details summary').click(); await noOverflow(page);
  await page.setViewportSize({width:320,height:740}); await noOverflow(page);
},{viewport:{width:390,height:844}});
add('offline-file-build-and-no-external-requests',async (page,context) => {
  const external=[]; page.on('request',request=>{if(!/^(file:|blob:|data:)/.test(request.url()))external.push(request.url());});
  await context.setOffline(true); await open(page,'en',pathToFileURL(appFile).href); await analyze(page); await moveBottomUp(page);
  const item=await download(page,'offline-review.zip'); assert.match(item.filename,/\.zip$/); assert.deepEqual(external,[]);
});

if(process.argv.includes('--list')) { for(const item of cases) console.log(item.name); console.log(`${cases.length} browser checks collected; Chromium was not launched.`); process.exit(0); }
await mkdir(artifactDir,{recursive:true});
async function report(status,extra={}) { await writeFile(path.join(artifactDir,'results.json'),JSON.stringify({status,sandbox:true,playwright:'1.56.0',baseURL,testsRun:results.length,passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,results,pageErrors,...extra},null,2)+'\n'); }
try { browser=await chromium.launch({headless:true,chromiumSandbox:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})}); }
catch(error) { await report('blocked',{stage:'launch',error:error.stack}); console.error('Browser launch blocked; no checks ran. Chromium sandbox remains enabled.'); throw error; }
try {
  for(const item of cases) {
    const context=await browser.newContext({viewport:item.viewport||{width:1440,height:1080},acceptDownloads:true,reducedMotion:'reduce'});
    const page=await context.newPage(); page.setDefaultTimeout(15000); const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    try { await item.run(page,context); assert.deepEqual(errors,[],'No uncaught page errors'); results.push({name:item.name,status:'passed'}); console.log('PASS '+item.name); }
    catch(error) { results.push({name:item.name,status:'failed',error:error.stack}); console.error('FAIL '+item.name+'\n'+error.stack); await page.screenshot({path:path.join(artifactDir,item.name+'-failure.png'),fullPage:true}).catch(()=>{}); }
    finally { pageErrors.push(...errors.map(error=>({test:item.name,error}))); await context.close(); await report('running'); }
  }
} finally { await browser.close(); }
await report(results.some(r=>r.status==='failed')?'failed':'passed');
if(results.some(r=>r.status==='failed'))process.exitCode=1;
