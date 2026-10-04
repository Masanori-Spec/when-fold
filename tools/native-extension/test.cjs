'use strict';
const vscode = require('vscode');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const exec = promisify(execFile);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
exports.run = async function run() {
  const directory = process.env.WHENFOLD_NATIVE_ARTIFACTS;
  assert(directory, 'Missing isolated native artifact directory');
  const fixture = JSON.parse(await fs.readFile(path.join(directory, 'native-input.json'), 'utf8'));
  const extension = vscode.extensions.getExtension('whenfold-test.fixture');
  assert(extension, 'Disposable test extension not loaded');
  const capture = await extension.activate();
  const doc = await vscode.workspace.openTextDocument({ content: 'WhenFold native fixture. No user files or settings.\n', language: 'plaintext' });
  await vscode.window.showTextDocument(doc, { preview: false });
  await sleep(1000);
  const output = { status: 'running', version: vscode.version, commit: fixture.commit,
    mode: fixture.mode, sandbox: 'enabled; no --no-sandbox launch flag', profile: 'fresh disposable profile',
    keypress: 'X11 xdotool ctrl+alt+k', arbitraryImportedCommandsExecuted: false,
    allowedFixtureCommands: ['demo.generic', 'demo.python', 'demo.selection'], results: [] };
  try {
    assert.equal(vscode.version, fixture.version);
    const windows = (await exec('xdotool', ['search', '--onlyvisible', '--class', 'Code'])).stdout.trim().split(/\s+/).filter(Boolean);
    assert(windows.length > 0, 'No visible native VS Code window');
    const window = windows[0];
    for (const [index, scenario] of fixture.scenarios.entries()) {
      for (const key of fixture.contextKeys) {
        await vscode.commands.executeCommand('setContext', key, Object.hasOwn(scenario.context, key) ? scenario.context[key] : undefined);
      }
      await vscode.window.showTextDocument(doc, { preview: false });
      await exec('xdotool', ['windowfocus', '--sync', window]);
      await sleep(100);
      capture.reset();
      await exec('xdotool', ['key', '--clearmodifiers', '--delay', '60', 'ctrl+alt+k']);
      const expected = scenario.expected;
      if (expected !== null) {
        const deadline = Date.now() + 5000;
        while (capture.observed().length === 0 && Date.now() < deadline) await sleep(25);
      }
      // Check that the keypress invokes at most one fixture command, including late dispatch.
      await sleep(350);
      const calls = capture.observed();
      assert.deepEqual(calls, expected === null ? [] : [expected], `${fixture.mode} native scenario ${index}: ${JSON.stringify(scenario.context)}`);
      output.results.push({ context: scenario.context, key: scenario.key, expected, observed: calls });
    }
    output.status = 'passed';
    try {
      const screenshot = path.join(directory, `native-${fixture.mode}.png`);
      await exec('import', ['-window', 'root', screenshot]);
      output.screenshot = path.basename(screenshot);
    } catch (error) { output.screenshotUnavailable = error.message; }
  } catch (error) { output.status = 'failed'; output.error = error.stack; throw error; }
  finally { await fs.writeFile(path.join(directory, `native-${fixture.mode}-report.json`), JSON.stringify(output, null, 2) + '\n'); }
};
