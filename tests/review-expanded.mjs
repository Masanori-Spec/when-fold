import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=resolve(process.argv[2]||'.');
const app=await import(pathToFileURL(resolve(root,'src/core.mjs')));
const exp=await import(pathToFileURL(resolve(root,'src/exports.mjs')));
const consumer=await import(pathToFileURL(resolve(root,'tools/oracle-lib.mjs')));
const o=await consumer.loadOracle();
const m={a:{type:'boolean',values:[true,false,null]},b:{type:'boolean',values:[true,false,null]},s:{type:'string',values:['in','not','true','false','foo/bar','-.',':','',null]}};
const contexts=[];for(const a of [true,false,undefined])for(const b of [true,false,undefined])for(const s of m.s.values){const c={};if(a!==undefined)c.a=a;if(b!==undefined)c.b=b;if(s!==null)c.s=s;contexts.push(c)}
const leaves=['a','b','!a','!b','true','false','!true','!false','a == false','a != false','b == true','b != true',...m.s.values.filter(v=>v!==null).flatMap(v=>[`s == '${v}'`,`s != '${v}'`]),'s == in','s != in','s == foo/bar','s == -.', 's == :'];
let seed=947623;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
function expression(d){if(!d||rand(3)===0)return leaves[rand(leaves.length)];if(rand(4)===0)return `!(${expression(d-1)})`;return `(${expression(d-1)} ${rand(2)?'&&':'||'} ${expression(d-1)})`;}
let expressionContexts=0;for(let i=0;i<1200;i++){const text=expression(4),a=app.parseWhen(text,m),u=consumer.parseWhen(o,text),g=consumer.parseWhen(o,app.serializeWhen(a));for(const c of contexts){const want=app.evaluateWhen(a,c);assert.equal(u.evaluate(consumer.contextAdapter(c)),want,JSON.stringify({text,c}));assert.equal(g.evaluate(consumer.contextAdapter(c)),want,JSON.stringify({text,c,serialized:app.serializeWhen(a)}));expressionContexts++;}}
const bases=[...Array.from({length:26},(_,i)=>String.fromCharCode(97+i)),...Array.from({length:10},(_,i)=>String(i)),...Array.from({length:19},(_,i)=>`f${i+1}`),'left','up','right','down','pageup','pagedown','end','home','tab','enter','escape','space','backspace','delete','insert','pausebreak','capslock'];
let keyDispatches=0;for(const [platform,meta] of [['linux','meta'],['windows','win'],['mac','cmd']]){const dispatches=new Map();for(let mask=0;mask<16;mask++){const mods=['ctrl','shift','alt',meta].filter((_,i)=>mask&(1<<i));for(const base of bases){const key=app.validateKey([...mods,base].join('+'),platform),d=JSON.stringify(consumer.resolvedKey(o,key,platform).getDispatchChords());assert(!dispatches.has(d),JSON.stringify({platform,previous:dispatches.get(d),key,d}));dispatches.set(d,key);keyDispatches++;}}}
const project=(rules,model=m)=>({version:1,platform:'linux',model,sources:[{name:'Independent review',rules}]});
let guardResolutionContexts=0;
for(let i=0;i<120;i++){
 const rules=Array.from({length:4},(_,j)=>({key:'ctrl+k',command:`demo.${j%3}`,when:expression(2),...(j%2?{args:[null,false,{value:'same',zero:0}]}:{})}));
 const p=project(rules),priority=['s1:r1','s1:r2','s1:r3','s1:r4'];for(let j=priority.length-1;j>0;j--){const k=rand(j+1);[priority[j],priority[k]]=[priority[k],priority[j]];}
 const r=app.analyzeProject(p,{'ctrl+k':priority}),artifact=JSON.parse(exp.makeArtifacts(r)['keybindings.json']),built=consumer.makeResolver(o,artifact),reversed=consumer.makeResolver(o,artifact.slice().reverse());
 const parsed=rules.map(rule=>consumer.parseWhen(o,rule.when));
 for(const c of contexts){const selected=priority.map(id=>Number(id.split(':r')[1])-1).find(j=>parsed[j].evaluate(consumer.contextAdapter(c))),want=selected===undefined?null:consumer.expectedBehavior(rules[selected]);assert.deepEqual(consumer.resolveBehavior(o,built,c,'ctrl+k'),want);assert.deepEqual(consumer.resolveBehavior(o,reversed,c,'ctrl+k'),want);assert(built.items.filter(item=>!item.when||item.when.evaluate(consumer.contextAdapter(c))).length<=1);guardResolutionContexts++;}
}
for(const command of ['^demo.foo','^','^-demo.foo'])assert.throws(()=>app.analyzeProject(project([{key:'ctrl+k',command}],{})),/bubbling/);
for(const args of [-0,{nested:[-0]}])assert.throws(()=>app.analyzeProject(project([{key:'ctrl+k',command:'demo',args}],{})),/negative zero/i);
for(const json of ['-0','{"args":[-0]}','-1e-999'])assert.throws(()=>app.readJSON(json),/negative zero/i);
const result={status:'passed',date:'2026-10-04',sourceRoot:root,expressionContexts,keyDispatches,guardResolutionContexts,regressions:['leading caret commands rejected','negative zero JSON/programmatic args rejected'],notRun:['Chromium execution','native VS Code execution','screenshots/visual review'],note:'Independent source review with pinned upstream consumer. Finite synthetic tests; not editor reachability, installed extensions, or every later editor version.'};
await mkdir(resolve(root,'test-results'),{recursive:true});await writeFile(resolve(root,'test-results/independent-review-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
