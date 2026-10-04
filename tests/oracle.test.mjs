import test from 'node:test';
import assert from 'node:assert/strict';
import { loadOracle, parseWhen, contextAdapter, makeResolver, resolveBehavior } from '../tools/oracle-lib.mjs';
const oracle = await loadOracle();
const when = (text, context) => parseWhen(oracle, text).evaluate(contextAdapter(context));
test('pinned upstream handles omitted boolean and string context keys', () => {
  assert.equal(when('whenfold.focus', {}), false);
  assert.equal(when('!whenfold.focus', {}), true);
  assert.equal(when('whenfold.focus == false', {}), true);
  assert.equal(when('whenfold.focus != false', {}), false);
  assert.equal(when('whenfold.lang == python', {}), false);
  assert.equal(when('whenfold.lang != python', {}), true);
  assert.equal(when("whenfold.lang == 'python'", {'whenfold.lang':'python'}), true);
});
test('quoted boolean-like strings retain their type and literal backslash', () => {
  assert.equal(when("whenfold.lang == 'false'", {'whenfold.lang':'false'}), true);
  assert.equal(when("whenfold.lang == 'false'", {'whenfold.lang':false}), false);
  assert.equal(when("whenfold.lang == 'a\\b'", {'whenfold.lang':'a\\b'}), true);
  assert.throws(() => parseWhen(oracle, "whenfold.lang == 'a\\'b'"));
});
test('pinned resolver checks last matching precedence, fall-through and args', () => {
  const original = [
    {key:'ctrl+alt+k',command:'demo.generic',when:'whenfold.focus',args:{nested:[1,false,null]}},
    {key:'ctrl+alt+k',command:'demo.python',when:'whenfold.focus && whenfold.lang == python',args:null},
    {key:'ctrl+alt+k',command:'demo.selection',when:'whenfold.focus && whenfold.selection'},
  ];
  const built = makeResolver(oracle, original);
  assert.deepEqual(resolveBehavior(oracle,built,{'whenfold.focus':true},'ctrl+alt+k'),{command:'demo.generic',args:{nested:[1,false,null]}});
  assert.deepEqual(resolveBehavior(oracle,built,{'whenfold.focus':true,'whenfold.lang':'python'},'ctrl+alt+k'),{command:'demo.python',args:null});
  assert.deepEqual(resolveBehavior(oracle,built,{'whenfold.focus':true,'whenfold.lang':'python','whenfold.selection':true},'ctrl+alt+k'),{command:'demo.selection'});
  assert.equal(resolveBehavior(oracle,built,{},'ctrl+alt+k'),null);
  assert.equal(resolveBehavior(oracle,built,{'whenfold.focus':true},'ctrl+alt+j'),null);
});
test('same-key guarded fixture changes exactly one of 12 typed contexts', () => {
  const original = [
    {key:'ctrl+alt+k',command:'demo.generic',when:'whenfold.focus'},
    {key:'ctrl+alt+k',command:'demo.python',when:'whenfold.focus && whenfold.lang == python',args:{mode:'safe'}},
    {key:'ctrl+alt+k',command:'demo.selection',when:'whenfold.focus && whenfold.selection'},
  ];
  const exported = [
    {...original[0],when:'whenfold.focus && !(whenfold.focus && whenfold.lang == python) && !(whenfold.focus && whenfold.selection)'},
    {...original[2],when:'whenfold.focus && whenfold.selection && !(whenfold.focus && whenfold.lang == python)'},
    original[1],
  ];
  const before = makeResolver(oracle,original), after = makeResolver(oracle,exported);
  let changed = 0, checked = 0, fallsThrough = 0;
  for (const focus of [false,true]) for (const selection of [false,true]) for (const lang of [undefined,'python','javascript']) {
    const context = {'whenfold.focus':focus,'whenfold.selection':selection};
    if(lang !== undefined) context['whenfold.lang'] = lang;
    const a=resolveBehavior(oracle,before,context,'ctrl+alt+k'), b=resolveBehavior(oracle,after,context,'ctrl+alt+k');
    if(JSON.stringify(a)!==JSON.stringify(b)) { changed++; assert.equal(lang,'python'); assert(focus && selection); }
    const matched = after.items.filter(i => !i.when || i.when.evaluate(contextAdapter(context)));
    assert(matched.length <= 1);
    if(b === null) fallsThrough++;
    checked++;
  }
  assert.equal(checked,12); assert.equal(changed,1); assert.equal(fallsThrough,6);
});

// The application is used only to GENERATE real exported files. Assertions above and
// auditArtifacts below use the pinned upstream parser/evaluator/resolver, not app logic.
import { analyzeProject } from '../src/core.mjs';
import { makeArtifacts } from '../src/exports.mjs';
import { auditArtifacts } from '../tools/oracle.mjs';
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
async function generatedCase(project, priority, mutate) {
  const directory = await mkdtemp(join(tmpdir(), 'whenfold-oracle-case-'));
  try {
    const result = analyzeProject(project, priority);
    const artifacts = makeArtifacts(result);
    artifacts['project.json'] = JSON.stringify(project);
    for (const [name, text] of Object.entries(artifacts)) await writeFile(join(directory, name), text);
    if (mutate) await mutate(directory);
    return await auditArtifacts(directory);
  } finally { await rm(directory, { recursive: true, force: true }); }
}
const richModel = {
  'wf.focus': { type: 'boolean', values: [false, true, null] },
  'wf.selection': { type: 'boolean', values: [false, true, null] },
  'wf.lang': { type: 'string', values: ['python', 'javascript', 'false', 'two words', '', null] },
};
const projectFor = (rules, platform = 'linux') => ({ version: 1, platform, model: structuredClone(richModel), sources: [{ name: 'Differential fixtures', rules }] });
const kb = (command, when, args = undefined) => {
  const out = { key: 'ctrl+alt+k', command };
  if (when !== undefined) out.when = when;
  if (args !== undefined) out.args = args;
  return out;
};

test('actual exports agree upstream across absent booleans, negation and typed literals', async () => {
  const conditions = [undefined, 'wf.focus == false', 'wf.focus != false', 'wf.focus == true', 'wf.focus != true',
    '!(wf.focus && wf.selection)', '!(wf.focus || !wf.selection)',
    "wf.lang == 'false'", "wf.lang == 'two words'", "wf.lang == ''", 'wf.lang != python',
    '(wf.focus || wf.selection) && wf.lang != javascript'];
  for (const condition of conditions) {
    const project = projectFor([kb('demo.first', condition, null), kb('demo.second', 'wf.focus && wf.selection', ['preserve', false, null])]);
    const report = await generatedCase(project, {'ctrl+alt+k':['s1:r1','s1:r2']});
    assert.equal(report.checks.scenarios, 54);
  }
});
test('actual exports preserve null/absent/array args, same command identity, and complete shadowing', async () => {
  const project = projectFor([
    kb('demo.same', undefined), kb('demo.same', 'wf.focus', null),
    kb('demo.same', 'wf.focus && wf.selection', []), kb('demo.same', 'wf.lang == python', {nested:[1,'two',false,null]}),
    kb('demo.shadowed', 'true', {ignored:true}),
  ]);
  const report = await generatedCase(project, {'ctrl+alt+k':['s1:r4','s1:r3','s1:r2','s1:r1','s1:r5']});
  assert.equal(report.checks.scenarios,54); assert.equal(report.checks.fallThroughScenarios,0);
  assert(report.results.some(r => r.after && !Object.hasOwn(r.after,'args')));
  assert(report.results.some(r => r.after?.args === null));
  assert(report.results.some(r => Array.isArray(r.after?.args)));
});
test('disjoint language rules and reversed exported order resolve identically upstream', async () => {
  const project = projectFor([kb('demo.python','wf.lang == python'),kb('demo.javascript','wf.lang == javascript'),kb('demo.other','wf.lang != python && wf.lang != javascript')]);
  const report = await generatedCase(project, undefined, async directory => {
    const bindings = JSON.parse(await readFile(join(directory,'keybindings.json'),'utf8')).reverse();
    const sourceMap = JSON.parse(await readFile(join(directory,'source-map.json'),'utf8'));
    sourceMap.entries.reverse().forEach((entry,index) => entry.outputIndex=index);
    await writeFile(join(directory,'keybindings.json'),JSON.stringify(bindings));
    await writeFile(join(directory,'source-map.json'),JSON.stringify(sourceMap));
  });
  assert.equal(report.checks.changedScenarios,0); assert.equal(report.checks.fallThroughScenarios,0);
});
test('actual exports use three platform-specific canonical modifiers', async () => {
  for (const [platform, modifier] of [['linux','meta'],['windows','win'],['mac','cmd']]) {
    const rules = [kb('demo.first','wf.focus'),kb('demo.second','wf.selection')].map(rule => ({...rule,key:`${modifier}+alt+k`}));
    const report = await generatedCase(projectFor(rules,platform));
    assert.equal(report.oracle.platform, platform); assert.equal(report.checks.scenarios,54);
  }
});
test('oracle rejects altered exported args, missing context, and overlapping guards', async () => {
  const project = projectFor([kb('demo.first','wf.focus',{mode:'one'}),kb('demo.second','wf.selection',{mode:'two'})]);
  for (const defect of ['args','context','guard']) {
    await assert.rejects(() => generatedCase(project,undefined,async directory => {
      const name = defect === 'context' ? 'scenarios.json' : 'keybindings.json';
      const data = JSON.parse(await readFile(join(directory,name),'utf8'));
      if(defect === 'args') data[0].args={mode:'corrupted'};
      if(defect === 'context') data.scenarios.pop();
      if(defect === 'guard') data[0].when='true';
      await writeFile(join(directory,name),JSON.stringify(data));
    }));
  }
});
test('unsupported ambiguous syntax fails before export, including upstream operator traps', () => {
  for (const condition of ['!!wf.focus', '!wf.focus == true', 'wf.lang == /regex/', 'wf.lang == not', "wf.lang == 'a\\'b'", 'wf.lang == "python"']) {
    assert.throws(() => analyzeProject(projectFor([kb('demo.nope',condition)])), undefined, condition);
  }
  for (const name of ['in','not','isMac','isLinux','isWindows','isWeb','isMacNative','isEdge','isFirefox','isChrome','isSafari']) {
    const project = projectFor([kb('demo.nope',name)]);
    project.model[name] = {type:'boolean',values:[true,false]};
    assert.throws(() => analyzeProject(project), undefined, name);
  }
});
test('seeded generated real artifacts agree with upstream over 5,184 modeled resolutions', async () => {
  let seed = 0x57464f4c;
  const rand = max => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed % max; };
  const leaves = ['wf.focus','wf.selection','wf.focus == false','wf.selection != true','true','false',
    'wf.lang == python','wf.lang != javascript',"wf.lang == 'false'","wf.lang == 'two words'", "wf.lang != ''"];
  const expression = depth => {
    if (depth === 0 || rand(3) === 0) return leaves[rand(leaves.length)];
    if(rand(3) === 0) return `!(${expression(depth-1)})`;
    return `(${expression(depth-1)} ${rand(2) ? '&&' : '||'} ${expression(depth-1)})`;
  };
  let resolutions=0;
  for (let iteration=0; iteration<48; iteration++) {
    const rules=Array.from({length:6},(_,index) => {
      const rule=kb(`demo.random${rand(3)}`,expression(2), [undefined,null,[],{nested:['x',false,null]}][rand(4)]);
      if(index%2) rule.key='ctrl+alt+j';
      return rule;
    });
    const priority={};
    for (const key of ['ctrl+alt+k','ctrl+alt+j']) {
      const ids=rules.flatMap((rule,index)=>rule.key===key?[`s1:r${index+1}`]:[]);
      for(let index=ids.length-1;index>0;index--) { const other=rand(index+1); [ids[index],ids[other]]=[ids[other],ids[index]]; }
      priority[key]=ids;
    }
    const result=await generatedCase(projectFor(rules),priority);
    resolutions+=result.checks.scenarios;
  }
  assert.equal(resolutions,5184);
});

test('oracle audits default fixture preservation as well as chosen fixture change',async()=>{
  const fixture=JSON.parse(await readFile(new URL('../fixtures/twelve-contexts.json',import.meta.url),'utf8'));
  const unchanged=await generatedCase(fixture);
  assert.equal(unchanged.checks.changedScenarios,0);
  const changed=await generatedCase(fixture,{'ctrl+alt+k':['s1:r2','s2:r1','s1:r1']});
  assert.equal(changed.checks.changedScenarios,1);
  assert.equal(changed.checks.reversedExportResolution,12);
});
test('oracle independently detects forged priority despite internally consistent export/scenarios',async()=>{
  const project=projectFor([kb('demo.first','wf.focus'),kb('demo.second','wf.selection')]);
  await assert.rejects(()=>generatedCase(project,undefined,async directory=>{
    const path=join(directory,'scenarios.json');const matrix=JSON.parse(await readFile(path,'utf8'));
    matrix.priority['ctrl+alt+k'].reverse();
    await writeFile(path,JSON.stringify(matrix));
    const sourcePath=join(directory,'source-map.json');const sourceMap=JSON.parse(await readFile(sourcePath,'utf8'));
    for(const row of sourceMap.entries)row.priorityRank=matrix.priority['ctrl+alt+k'].indexOf(row.id);
    await writeFile(sourcePath,JSON.stringify(sourceMap));
  }),/priority/i);
});

test('upstream caret command changes dispatch semantics and v1 rejects bubbling inputs',()=>{
  const built=makeResolver(oracle,[{key:'ctrl+k',command:'^demo.foo'}]);
  assert.deepEqual(resolveBehavior(oracle,built,{},'ctrl+k'),{command:'demo.foo'});
  assert.equal(built.items[0].bubble,true);
  const removed=makeResolver(oracle,[{key:'ctrl+k',command:'^-demo.foo'}]);
  assert.equal(resolveBehavior(oracle,removed,{},'ctrl+k'),null);
  for(const command of ['^demo.foo','^','^-demo.foo']){
    const project={version:1,platform:'linux',model:{},sources:[{name:'Prefix regression',rules:[{key:'ctrl+k',command}]}]};
    assert.throws(()=>analyzeProject(project),/bubbling/);
  }
});
