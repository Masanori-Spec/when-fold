#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, PIN, VERSION, canonical, hash, readJSON, loadOracle, contextAdapter,
  makeResolver, resolveBehavior, expectedBehavior, resolvedKey, parseWhen } from './oracle-lib.mjs';

// No import from src/, no app parser, compiler, evaluator, or scenario generator.
function enumerateModel(model) {
  let contexts = [{}];
  for (const [key, definition] of Object.entries(model)) {
    assert(['boolean', 'string'].includes(definition.type));
    assert(Array.isArray(definition.values) && definition.values.length);
    assert.equal(new Set(definition.values.map(canonical)).size, definition.values.length);
    contexts = contexts.flatMap(context => definition.values.map(value => {
      assert(value === null || typeof value === definition.type, `Wrong modeled type for ${key}`);
      return value === null ? { ...context } : { ...context, [key]: value };
    }));
  }
  return contexts;
}
// Standalone RFC-4180 reader for the downloadable behavior witness.
function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && c === ',') { row.push(field); field = ''; }
    else if (!quoted && (c === '\r' || c === '\n')) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  assert(!quoted, 'Unclosed CSV quoted field');
  if (row.length || field.length) { row.push(field); rows.push(row); }
  return rows;
}
export async function auditArtifacts(directory = resolve(ROOT, 'generated')) {
  const oracle = await loadOracle();
  const names = ['keybindings.json', 'original-keybindings.json', 'source-map.json', 'scenarios.json', 'project.json'];
  const files = Object.fromEntries(await Promise.all(names.map(async name => [name, await readJSON(resolve(directory, name))])));
  const compiled = files['keybindings.json'], original = files['original-keybindings.json'];
  const sourceMap = files['source-map.json'], matrix = files['scenarios.json'], project = files['project.json'];
  const platform = project.platform;
  assert.equal(matrix.platform, platform); assert.equal(sourceMap.platform, platform);
  const contexts = enumerateModel(project.model);
  assert.deepEqual(new Set(matrix.contexts.map(canonical)), new Set(contexts.map(canonical)), 'Scenario context list must exhaust the independent Cartesian product');
  assert.equal(matrix.contexts.length, contexts.length, 'Duplicate context in matrix');
  const flattened = project.sources.flatMap(source => source.rules);
  assert.equal(original.length, flattened.length);
  original.forEach((binding, i) => {
    const input = flattened[i];
    assert.deepEqual(expectedBehavior(binding), expectedBehavior(input), `Original artifact rule ${i} command or args differs from project input`);
    assert.deepEqual(resolvedKey(oracle, binding.key, platform).getDispatchChords(), resolvedKey(oracle, input.key, platform).getDispatchChords());
    const a = parseWhen(oracle, binding.when), b = parseWhen(oracle, input.when);
    for (const context of contexts) assert.equal(a ? a.evaluate(contextAdapter(context)) : true, b ? b.evaluate(contextAdapter(context)) : true, 'Original artifact changed a when condition');
  });
  const before = makeResolver(oracle, original, platform), after = makeResolver(oracle, compiled, platform), reversed = makeResolver(oracle, [...compiled].reverse(), platform);
  assert.equal(compiled.length, original.length, 'Every original rule must appear exactly once');
  assert.equal(compiled.length, sourceMap.entries.length);
  const ids = project.sources.flatMap((source, si) => source.rules.map((_, ri) => `s${si + 1}:r${ri + 1}`));
  assert.deepEqual(new Set(sourceMap.entries.map(entry => entry.id)), new Set(ids));
  for (let index = 0; index < compiled.length; index++) {
    const entry = sourceMap.entries[index];
    assert.equal(entry.outputIndex, index);
    assert.equal(entry.guard, compiled[index].when);
    const originalIndex = ids.indexOf(entry.id);
    assert.equal(entry.originalWhen, original[originalIndex].when ?? 'true');
    assert.equal(compiled[index].key, original[originalIndex].key, 'Compiled shortcut differs from its source');
    const sourceIndex=Number(entry.id.split(':')[0].slice(1))-1;
    const ruleIndex=Number(entry.id.split(':r')[1])-1;
    assert.equal(entry.sourceIndex,sourceIndex); assert.equal(entry.ruleIndex,ruleIndex);
    assert.equal(entry.source,project.sources[sourceIndex].name);
    assert.deepEqual(expectedBehavior(compiled[index]), expectedBehavior(original[originalIndex]), 'Compiler changed command or args');
  }
  const keys = [...new Set(original.map(binding => binding.key))];
  assert.deepEqual(Object.keys(matrix.priority).sort(), [...keys].sort(), 'Priority shortcut groups differ');
  for(const key of keys){const members=original.flatMap((binding,index)=>binding.key===key?[ids[index]]:[]);assert.deepEqual([...matrix.priority[key]].sort(),[...members].sort(),'Priority must be a permutation of source IDs');assert.equal(new Set(matrix.priority[key]).size,members.length);}
  for(const entry of sourceMap.entries)assert.equal(entry.priorityRank,matrix.priority[compiled[entry.outputIndex].key].indexOf(entry.id));
  const expectedPairs = new Set(contexts.flatMap(context => keys.map(key => canonical({ context, key }))));
  assert.equal(matrix.scenarios.length, expectedPairs.size, 'Missing or duplicated scenarios');
  const results = []; let changes = 0, fallThrough = 0, absentContexts = 0;
  for (const scenario of matrix.scenarios) {
    const { context, key } = scenario;
    const token = canonical({ context, key });
    assert(expectedPairs.delete(token), `Unknown or repeated scenario: ${token}`);
    const beforeActual = resolveBehavior(oracle, before, context, key, platform);
    const afterActual = resolveBehavior(oracle, after, context, key, platform);
    assert.deepEqual(resolveBehavior(oracle,reversed,context,key,platform),afterActual,'Reversing exported order changed behavior');
    const chosenId=matrix.priority[key].find(id=>{const item=before.items[ids.indexOf(id)];return !item.when||item.when.evaluate(contextAdapter(context));});
    const chosenBehavior=chosenId===undefined?null:expectedBehavior(original[ids.indexOf(chosenId)]);
    assert.deepEqual(afterActual,chosenBehavior,'Export did not implement the declared explicit priority');
    assert.equal(scenario.after?.id??null,chosenId??null,'Scenario source ID did not implement declared priority');
    assert.deepEqual(beforeActual, expectedBehavior(scenario.before), `Original resolver mismatch: ${token}`);
    assert.deepEqual(afterActual, expectedBehavior(scenario.after), `Exported resolver mismatch: ${token}`);
    const matched = after.items.flatMap((item, index) => compiled[index].key === key && (!item.when || item.when.evaluate(contextAdapter(context))) ? [sourceMap.entries[index].id] : []);
    assert(matched.length <= 1, `Exported guards overlap: ${token}`);
    assert.deepEqual([...matched].sort(), [...scenario.matchedExportIds].sort(), 'Matched source-map IDs differ');
    assert.equal(matched[0] ?? null, scenario.after?.id ?? null, 'Winning source-map ID differs');
    const originalMatches = before.items.flatMap((item, index) => original[index].key === key && (!item.when || item.when.evaluate(contextAdapter(context))) ? [ids[index]] : []);
    assert.equal(originalMatches.at(-1) ?? null, scenario.before?.id ?? null, 'Original winning source ID differs');
    const changed = canonical(beforeActual) !== canonical(afterActual);
    if (changed) changes++;
    if (afterActual === null) fallThrough++;
    if (Object.keys(context).length < Object.keys(project.model).length) absentContexts++;
    results.push({ context, key, before: beforeActual, after: afterActual, matchedExportIds: matched, changed });
  }
  assert.equal(expectedPairs.size, 0);
  const csv = (await readFile(resolve(directory, 'behavior-delta.csv'), 'utf8')).replace(/^\uFEFF/, '');
  const csvRows = parseCSV(csv);
  assert.deepEqual(csvRows.shift(), ['key','context_json','before_rule','before_command','before_args_present','before_args_json','after_rule','after_command','after_args_present','after_args_json']);
  const csvSafe = value => /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
  const expectedDeltaRows = matrix.scenarios.filter((scenario, index) => results[index].changed).map(scenario => {
    const cells = [scenario.key, JSON.stringify(scenario.context)];
    for (const outcome of [scenario.before, scenario.after]) cells.push(outcome?.id ?? '', outcome?.command ?? '',
      String(outcome !== null && Object.hasOwn(outcome, 'args')), outcome !== null && Object.hasOwn(outcome, 'args') ? JSON.stringify(outcome.args) : '');
    return cells.map(csvSafe);
  });
  assert.deepEqual(csvRows, expectedDeltaRows, 'Behavior delta CSV differs from independent upstream outcomes');
  const artifactHashes = Object.fromEntries(await Promise.all([...names, 'behavior-delta.csv'].map(async name => [name, hash(await readFile(resolve(directory, name)))])));
  return { status: 'passed', oracle: { repository: 'https://github.com/microsoft/vscode', version: VERSION, commit: PIN,
    sourceFiles: oracle.lock.files.length, sourceIntegrity: 'All vendored source hashes verified',
    runtime: 'Unmodified ContextKeyExpr + KeybindingResolver + KeybindingParser + USLayoutResolvedKeybinding',
    platform, keyboardLayout: 'US reference layout' },
    checks: { contexts: contexts.length, scenarios: results.length, originalResolution: results.length, exportedResolution: results.length, reversedExportResolution: results.length, declaredPriorityResolution: results.length,
      disjointGuards: results.length, deltaCsvRows: csvRows.length, changedScenarios: changes, fallThroughScenarios: fallThrough, scenariosWithAbsentKeys: absentContexts },
    artifactHashes, limitations: ['Finite declared model only', 'Only supplied ordered keybindings; no undisclosed default or extension rules',
      'Model enumeration is not proof of editor-state reachability', 'Native editor keystrokes are a separate test'], results };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const directory = resolve(process.argv[2] || resolve(ROOT, 'generated'));
  try {
    const report = await auditArtifacts(directory);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'oracle-report.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(`VS Code ${VERSION} upstream oracle passed: ${report.checks.scenarios} scenarios, ${report.checks.changedScenarios} behavior delta(s), ${report.checks.fallThroughScenarios} fall-through cases`);
  } catch (error) {
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'oracle-report.json'), JSON.stringify({ status: 'failed', commit: PIN, error: error.stack }, null, 2) + '\n');
    throw error;
  }
}
