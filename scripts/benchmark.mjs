import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {analyzeProject} from '../src/core.mjs';
const model={};for(let i=0;i<12;i++)model['flag'+i]={type:'boolean',values:[false,true]};
const p={version:1,platform:'linux',model,sources:[{name:'100 rules / 4096 combinations',rules:Array.from({length:100},(_,i)=>({key:'ctrl+k',command:'data.'+i,when:'flag'+(i%12)}))}]};
const start=performance.now();const r=analyzeProject(p);const report={node:process.version,ruleCount:r.stats.ruleCount,contextCount:r.stats.contextCount,groupCount:r.stats.groupCount,scenarioCount:r.scenarios.length,elapsedMs:+(performance.now()-start).toFixed(2),note:'Local synthetic bounded workload; not a product performance guarantee'};
fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/benchmark.json',JSON.stringify(report,null,2));console.log(report);
