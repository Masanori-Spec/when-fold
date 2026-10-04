import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PIN = 'cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba';
export const VERSION = '1.96.4';
export const canonical = value => JSON.stringify(value, (_, v) => v && !Array.isArray(v) && typeof v === 'object' ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const readJSON = async path => JSON.parse(await readFile(path, 'utf8'));
let loading;
export function loadOracle() { return loading ??= buildOracle(); }
async function buildOracle() {
  const lock = await readJSON(resolve(ROOT, 'oracle/upstream-lock.json'));
  assert.equal(lock.commit, PIN, 'Unexpected VS Code commit');
  assert.equal(lock.version, VERSION);
  const expected = new Set(lock.files.map(f => f.path));
  for (const file of lock.files) {
    const bytes = await readFile(resolve(ROOT, 'oracle/upstream', file.path));
    assert.equal(hash(bytes), file.sha256, `Upstream source integrity mismatch: ${file.path}`);
  }
  async function inspect(dir, prefix = '') {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const name = prefix + entry.name;
      if (entry.isDirectory()) await inspect(resolve(dir, entry.name), name + '/');
      else assert(expected.has(name), `Unpinned file in upstream directory: ${name}`);
    }
  }
  await inspect(resolve(ROOT, 'oracle/upstream'));
  const output = resolve(ROOT, 'generated/oracle-runtime.mjs');
  await mkdir(dirname(output), { recursive: true });
  await build({ entryPoints: [resolve(ROOT, 'oracle/entry.ts')], outfile: output,
    bundle: true, platform: 'node', format: 'esm', target: 'node22', logLevel: 'silent',
    legalComments: 'inline', treeShaking: true, tsconfigRaw: { compilerOptions: { experimentalDecorators: true } } });
  return { ...(await import(pathToFileURL(output).href)), lock };
}
export function contextAdapter(values) {
  return { getValue(key) { return Object.hasOwn(values, key) ? values[key] : undefined; } };
}
export function parseWhen(oracle, when) {
  if (when === undefined) return undefined;
  assert.equal(typeof when, 'string');
  const parser = new oracle.Parser({ regexParsingWithErrorRecovery: false });
  const expression = parser.parse(when);
  assert.equal(parser.lexingErrors.length, 0, `Upstream lexer rejected ${JSON.stringify(when)}`);
  assert.equal(parser.parsingErrors.length, 0, `Upstream parser rejected ${JSON.stringify(when)}`);
  assert(expression, `Upstream parser did not return an expression: ${when}`);
  // Explicitly use the production ContextKeyExpr entry point as well as diagnostic Parser.
  const production = oracle.ContextKeyExpr.deserialize(when);
  assert(production);
  return production;
}
export function resolvedKey(oracle, key, platform = 'linux') {
  const os = { linux: oracle.OperatingSystem.Linux, windows: oracle.OperatingSystem.Windows, mac: oracle.OperatingSystem.Macintosh, macos: oracle.OperatingSystem.Macintosh }[platform];
  assert(os, `Unsupported platform ${platform}`);
  const parsed = oracle.KeybindingParser.parseKeybinding(key);
  assert(parsed, `Upstream rejected key: ${key}`);
  const variants = oracle.USLayoutResolvedKeybinding.resolveKeybinding(parsed, os);
  assert.equal(variants.length, 1, `Ambiguous US-layout key: ${key}`);
  const result = variants[0];
  assert(result.getDispatchChords().every(Boolean), `Unresolved key: ${key}`);
  return result;
}
export function makeResolver(oracle, bindings, platform = 'linux') {
  assert(Array.isArray(bindings));
  const items = bindings.map(binding => new oracle.ResolvedKeybindingItem(
    resolvedKey(oracle, binding.key, platform), binding.command,
    Object.hasOwn(binding, 'args') ? binding.args : undefined,
    parseWhen(oracle, binding.when), false, null, false));
  return { resolver: new oracle.KeybindingResolver([], items, () => {}), items };
}
export function resolveBehavior(oracle, built, values, key, platform = 'linux') {
  const chords = resolvedKey(oracle, key, platform).getDispatchChords();
  assert.equal(chords.length, 1, 'WhenFold supported subset is one chord');
  const result = built.resolver.resolve(contextAdapter(values), [], chords[0]);
  if (result.kind === oracle.ResultKind.NoMatchingKb) return null;
  assert.equal(result.kind, oracle.ResultKind.KbFound, 'Unexpected chord continuation');
  const behavior = { command: result.commandId };
  if (result.commandArgs !== undefined) behavior.args = result.commandArgs;
  return behavior;
}
export function expectedBehavior(expected) {
  if (expected === null) return null;
  assert(expected && typeof expected.command === 'string', 'Scenario expectation must carry a command or null');
  return Object.hasOwn(expected, 'args') ? { command: expected.command, args: expected.args } : { command: expected.command };
}
