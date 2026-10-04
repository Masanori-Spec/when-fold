# Independent VS Code verification

## What is imported

The oracle imports official `microsoft/vscode` source at immutable commit
[`cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba`](https://github.com/microsoft/vscode/tree/cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba),
the official `1.96.4` tag. `upstream-lock.json` records each original path, source
URL, byte count and SHA-256. All 56 source/license files are unchanged. The upstream
[MIT license](upstream/LICENSE.txt) and every copyright header are retained. This
notice covers the vendored upstream files; it does not select the application's license.

`entry.ts` is a thin import boundary. `tools/oracle-lib.mjs` verifies the entire
source closure and uses pinned esbuild to build it locally. The oracle then uses:

- `ContextKeyExpr.deserialize` and the diagnostic `Parser`
- `KeybindingParser` and `USLayoutResolvedKeybinding`
- `ResolvedKeybindingItem` and `KeybindingResolver`

No app parser or evaluator is copied into the oracle. `tools/oracle.mjs` imports
no application code. Differential test generators import the app only to produce
real downloadable artifacts; upstream code supplies the independent result.

## Run offline

After the locked npm dependencies have been installed:

```sh
npm run fixture
npm run test:oracle
node --test tests/oracle.test.mjs
```

Oracle execution needs no network. It reads the actual generated
`keybindings.json`, `original-keybindings.json`, `source-map.json`,
`scenarios.json`, `project.json`, and `behavior-delta.csv`. It independently
re-enumerates typed model domains (JSON null in a model means an **absent key**),
checks that every context/shortcut pair occurs exactly once, and resolves both
original and exported order. It verifies commands, absent/present/null/nested
args, fall-through, guard disjointness, source identity, and the CSV behavior
witness. `generated/oracle-report.json` includes artifact hashes and all results.

The mandatory fixture checks 12 contexts, one behavior delta, six fall-through
contexts and four contexts with an absent language key. The edge suite also
checks absent booleans, boolean comparison normalization, negated parentheses,
quoted string values, omitted conditions, shadowed rules, identical command IDs
with different args, reversed disjoint export order, and Linux/Windows/macOS
canonical modifiers. A deterministic seed exercises 48 generated projects and
5,184 additional context/shortcut pairs, checking original and exported behavior
for each. Deliberately corrupted files must fail.

Refresh upstream sources only as a reviewed operation:

```sh
python3 tools/oracle-vendor.py
```

This fetches from the immutable official commit, preserving files byte-for-byte.
Changing the tested VS Code version also requires reviewing the supported syntax
and the native binary pin. We make no claim about other VS Code versions, layout
configurations, unknown built-in/extension rules, or actual reachability of every
logical modeled context. Platform checks use the US reference layout; the
physical native run below covers Linux only.

## Native editor fixture

`tools/native.mjs` is a separate native smoke test, not a simulated app parser.
It downloads the official Linux x64 VS Code 1.96.4 distribution using the exact
URL and SHA-256 recorded in `native-distribution.json`, checks the installed
commit, then creates two fresh disposable profiles. It loads the original and
exported keybindings artifacts **byte-for-byte**, runs a development-only test
extension, and sends 12 real X11 `ctrl+alt+k` keypresses to each profile.

The extension only registers `demo.generic`, `demo.python`, and `demo.selection`.
They append command/args observations in memory. Arbitrary imported command IDs
are rejected. Custom `whenfold.*` context keys are controlled through `setContext`;
no real user commands, profile, settings, workspace, extensions, or computer are
used. The test explicitly removes absent keys, checks zero dispatch for
fall-through, records command arguments, and rejects duplicate dispatch.

The upstream source is MIT; the official binary has the separate
[Microsoft Visual Studio Code product license](https://code.visualstudio.com/license).
The native runner is intended only for an authorized CI test of this fixture.

On a non-root GitHub-hosted Ubuntu 22.04 runner:

```sh
sudo apt-get update
sudo apt-get install -y xvfb xdotool imagemagick libasound2 libgbm1
npm ci
npm run fixture
xvfb-run -a npm run test:native
# Or consume the actual browser ZIP extraction, without regenerating it:
xvfb-run -a npm run test:native -- --artifacts test-results/browser/actual-artifacts
```

`WHENFOLD_ARTIFACT_DIR` is also supported. Reports and screenshots are written
inside the selected artifact directory; the exact input keybindings hashes are
recorded in the native report.

The Electron sandbox stays enabled. There is no `--no-sandbox` fallback.
Outputs include `generated/native-report.json`, per-profile reports and (if
ImageMagick is available) desktop screenshots. Upload these even on failure.
The report can say `passed` only after both actual native runs pass. A static
safety check is available with `node tools/native.mjs --validate`; it writes
`status: not-run`, never a native pass.

`native-status.json` explicitly records the local native stage as unrun because
the current cloud Electron sandbox is unavailable. A source oracle pass, fixture
validation or prepared CI harness does not establish a native editor pass.
