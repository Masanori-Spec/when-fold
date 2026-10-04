# Verification status

Source freeze preparation: 2026-10-04. The stages below are intentionally separate.

## Passed locally

- Standalone HTML build and JavaScript syntax check; no runtime script/style network dependency and no eval/Function
- 146 Node test cases, zero failures, including 14 pinned-upstream oracle tests
- Independent Microsoft VS Code 1.96.4 ContextKeyExpr, key parser and KeybindingResolver on actual CLI fixture artifacts: 12 contexts, exactly one behavior delta, six fall-through outcomes and four absent-language contexts
- Original vs project artifact equivalence, chosen priorities, exact args/args-presence, source-map coverage, disjoint guards, reversed-export order and independent CSV review
- 48 seeded differential artifact projects with 5,184 modeled context/shortcut cases, each original and exported independently resolved upstream
- Additional independent review: 97,200 expression/context comparisons, 3,456 canonical key dispatches across three platforms and 120 priority packs covering 9,720 consumer resolutions (`npm run test:review`)
- Corrupted args, missing context, forged priority and overlapping-guard mutation detection; upstream leading-caret command semantics; negative-zero argument preservation rejection; pinned scanner-whitespace boundary regressions
- Independent Python ZIP, JSON and CSV structure checks against the generated handoff ZIP
- Disposable native fixture safety/identity checks; harness JavaScript syntax
- 14 browser acceptance checks collected without launching Chromium
- Synthetic 100-rule / 4,096-context / one-shortcut benchmark; local timing in evidence is observational, not a product guarantee

Logs and JSON reports are in `docs/evidence/`. The source archive and SHA-256 manifest are produced by `npm run package` outside the repository directory.

## Prepared, not run locally

- Genuine sandboxed Chromium browser execution
- Actual browser download's upstream oracle check
- JA/EN desktop, 390px mobile and 320px overflow checks plus screenshot review
- Official native VS Code execution and 24 real fixture keypresses

The assigned build environment has a known browser sandbox-launch limitation. The tests are prepared for a non-root `ubuntu-22.04` hosted runner without disabling the sandbox. No local launch is asserted, and test collection or fixture validation is not a pass for those stages.

`.github/workflows/verify.yml` prepares two Node versions and a sandbox-browser/native-editor job. It uses real downloaded browser artifacts for the upstream and native consumers. Native reports and screenshots are written into that artifact directory. **No hosted CI run, publication, deployment, or visual approval has been performed by this build task.** Their results must be checked against the exact published commit before a release claim.

## Acceptance boundaries

The exact fixture change is focus=true, selection=true, lang=python: selection→Python. The other 11 contexts retain command/args or fall-through. A same-key Python-vs-JavaScript fixture is disjoint. Imported command IDs remain inert data; only demo.generic, demo.python and demo.selection are runnable in the isolated native fixture. The harness never opens the user's editor profile.

Finite model results do not imply real editor-state reachability, undisclosed built-in/extension coverage, or every keyboard layout. The oracle is pinned to 1.96.4, not a claim about the current or every VS Code release. Output comments/formatting are normalized. The guard operation is standard Boolean logic and is not claimed as novel.
