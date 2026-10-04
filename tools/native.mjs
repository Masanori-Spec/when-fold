#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, PIN, VERSION, readJSON, expectedBehavior, hash } from './oracle-lib.mjs';
import { auditArtifacts } from './oracle.mjs';

const artifactsIndex = process.argv.indexOf('--artifacts');
if (artifactsIndex >= 0) assert(process.argv[artifactsIndex + 1] && !process.argv[artifactsIndex + 1].startsWith('--'), '--artifacts requires a directory');
// A browser-downloaded/extracted artifact set can be consumed without regeneration.
const generated = resolve(artifactsIndex >= 0 ? process.argv[artifactsIndex + 1] : process.env.WHENFOLD_ARTIFACT_DIR || resolve(ROOT, 'generated'));
const reportPath = resolve(generated, 'native-report.json');
const commands = new Set(['demo.generic', 'demo.python', 'demo.selection']);
const contextKeys = ['whenfold.focus', 'whenfold.selection', 'whenfold.lang'];
async function validateFixture() {
  const report = await auditArtifacts(generated);
  assert.equal(report.checks.contexts, 12); assert.equal(report.checks.scenarios, 12);
  assert.equal(report.checks.changedScenarios, 1);
  const matrix = await readJSON(resolve(generated, 'scenarios.json'));
  for (const name of ['keybindings.json', 'original-keybindings.json']) {
    const bindings = await readJSON(resolve(generated, name));
    assert.equal(bindings.length, 3, 'Native test runs only the three-command harmless fixture');
    assert.deepEqual(new Set(bindings.map(b => b.command)), commands);
    for (const binding of bindings) {
      assert.equal(binding.key, 'ctrl+alt+k');
      assert.equal(typeof binding.when, 'string');
      // No arbitrary imported command IDs, shell execution, or user configuration accepted.
      assert(commands.has(binding.command));
    }
  }
  assert.deepEqual(Object.keys((await readJSON(resolve(generated, 'project.json'))).model).sort(), [...contextKeys].sort());
  for (const scenario of matrix.scenarios) {
    assert.equal(scenario.key, 'ctrl+alt+k');
    for (const key of Object.keys(scenario.context)) assert(contextKeys.includes(key));
    for (const result of [scenario.before, scenario.after]) assert(result === null || commands.has(result.command));
  }
  return { report, matrix };
}
async function sha256File(path) {
  const sha = createHash('sha256'); for await (const chunk of createReadStream(path)) sha.update(chunk); return sha.digest('hex');
}
async function run(command, args, options = {}) {
  return await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error('Native editor fixture exceeded 180 seconds')); }, 180000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('exit', (code, signal) => { clearTimeout(timer); code === 0 ? resolvePromise() : reject(new Error(`Native editor exited ${code ?? signal}`)); });
  });
}
let temp;
try {
  await mkdir(generated, { recursive: true });
  const { report: oracle, matrix } = await validateFixture();
  if (process.argv.includes('--validate')) {
    await writeFile(reportPath, JSON.stringify({ status: 'not-run', reason: 'Fixture safety and upstream oracle validated; native Electron launch has not run', oracle: oracle.checks }, null, 2) + '\n');
    console.log('Native fixture safety validation passed; native editor NOT RUN');
  } else {
    assert.equal(process.platform, 'linux'); assert.equal(process.arch, 'x64');
    assert(process.getuid?.() !== 0, 'Native test requires a non-root sandbox-capable runner; never disable the Electron sandbox');
    assert(process.env.DISPLAY, 'Run under xvfb-run -a on ubuntu-22.04');
    execFileSync('xdotool', ['version'], { stdio: 'ignore' });
    const distribution = await readJSON(resolve(ROOT, 'oracle/native-distribution.json'));
    assert.equal(distribution.commit, PIN); assert.equal(distribution.version, VERSION);
    temp = await mkdtemp(join(tmpdir(), 'whenfold-native-'));
    const archive = join(temp, 'vscode.tar.gz');
    execFileSync('curl', ['--fail', '--location', '--retry', '2', '--max-time', '180', '--output', archive, distribution.url], { stdio: 'inherit' });
    assert.equal(await sha256File(archive), distribution.sha256, 'Official distribution SHA-256 mismatch');
    execFileSync('tar', ['-xzf', archive, '-C', temp], { stdio: 'inherit' });
    const code = join(temp, 'VSCode-linux-x64', 'code');
    const product = await readJSON(join(temp, 'VSCode-linux-x64/resources/app/product.json'));
    assert.equal(product.commit, PIN, 'Official installed editor commit mismatch');
    const modeReports = [];
    for (const mode of ['original', 'exported']) {
      const profile = join(temp, `profile-${mode}`), extensions = join(temp, `extensions-${mode}`);
      await mkdir(join(profile, 'User'), { recursive: true }); await mkdir(extensions);
      const bindingName = mode === 'original' ? 'original-keybindings.json' : 'keybindings.json';
      const bytes = await readFile(join(generated, bindingName));
      // Load the actual fixture artifact byte-for-byte into its disposable profile.
      await writeFile(join(profile, 'User', 'keybindings.json'), bytes);
      await writeFile(join(profile, 'User', 'settings.json'), JSON.stringify({
        'telemetry.telemetryLevel': 'off', 'update.mode': 'none', 'extensions.autoCheckUpdates': false,
        'extensions.autoUpdate': false, 'workbench.startupEditor': 'none',
        'window.title': 'WhenFold native fixture', 'keyboard.dispatch': 'keyCode', 'workbench.enableExperiments': false,
      }));
      const input = { version: VERSION, commit: PIN, mode, contextKeys,
        scenarios: matrix.scenarios.map(scenario => ({ context: scenario.context, key: scenario.key,
          expected: expectedBehavior(mode === 'original' ? scenario.before : scenario.after) })) };
      await writeFile(join(generated, 'native-input.json'), JSON.stringify(input, null, 2) + '\n');
      await run(code, [
        '--user-data-dir', profile, '--extensions-dir', extensions,
        '--extensionDevelopmentPath', resolve(ROOT, 'tools/native-extension'),
        '--extensionTestsPath', resolve(ROOT, 'tools/native-extension/test.cjs'),
        '--skip-welcome', '--skip-release-notes', '--disable-updates',
        '--disable-telemetry', '--disable-extensions', '--disable-gpu', '--new-window',
      ], { env: { ...process.env, WHENFOLD_NATIVE_ARTIFACTS: generated } });
      const modeReport = await readJSON(join(generated, `native-${mode}-report.json`));
      assert.equal(modeReport.status, 'passed'); assert.equal(modeReport.results.length, 12);
      modeReports.push({ ...modeReport, keybindingsSha256: hash(bytes) });
    }
    await writeFile(reportPath, JSON.stringify({ status: 'passed', distribution, runs: modeReports,
      checks: { originalKeypresses: 12, exportedKeypresses: 12, changedScenarios: 1, userProfilesModified: 0 },
      limitations: ['Synthetic custom context keys on a US/X11 keyboard layout', 'Does not prove real editor reachability or other installed extension compatibility'] }, null, 2) + '\n');
    console.log('Native VS Code passed: 24 real keypresses, original + exported, 12 typed contexts each');
  }
} catch (error) {
  await writeFile(reportPath, JSON.stringify({ status: 'failed', commit: PIN, error: error.stack }, null, 2) + '\n');
  throw error;
} finally { if (temp) await rm(temp, { recursive: true, force: true }); }
