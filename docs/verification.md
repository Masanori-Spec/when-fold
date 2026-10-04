# Verification status

Source and hosted verification: 2026-10-04. Local checks and actual hosted execution are recorded separately.

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
- 15 browser acceptance checks collected without launching Chromium
- Synthetic 100-rule / 4,096-context / one-shortcut benchmark; local timing in evidence is observational, not a product guarantee

Logs and JSON reports are in `docs/evidence/`. The source archive and SHA-256 manifest are produced by `npm run package` outside the repository directory.

## Passed on the published source

[GitHub Actions run 37209599757](https://github.com/Masanori-Spec/when-fold/actions/runs/37209599757) completed successfully for source commit `4eecbc7652084eb7aac3e0bc93aab759eded3422`. All three jobs passed:

- Node 22 and Node 24: 146 tests each, mandatory upstream oracle, expanded differential review, synthetic benchmark and fixture safety validation
- Sandbox-enabled Chromium: 15/15 real browser checks, zero failures and zero uncaught page errors, including keyboard priority changes, reset/reimport, stale async imports, args-only differences, safe rendering, offline standalone operation, JA/EN desktop and 390px mobile screenshots, and 320px overflow checks
- Actual browser-downloaded ZIP: its six members were independently compared with the extracted files, then verified by the pinned VS Code resolver for every modeled context, exact args, source mapping, disjointness and reversed output order
- Official hash-pinned VS Code 1.96.4: 12 original and 12 exported keypresses in separate disposable profiles. Every observed command/args array matches the scenario result. Exactly one context changes from selection to Python; six contexts fall through and four omit the language key in each mode
- Actual browser-downloaded report: rendered offline, content/row/bounds checks passed, and printed to three A4 landscape pages. All three pages were visually inspected with no clipping or overlap; the continuation page repeats table headers
- JA/EN desktop/mobile and both native-editor screenshots were inspected. Only the harmless synthetic fixture appears

Durable summaries, actual screenshots, PDF and page renders are in [`evidence/hosted/`](evidence/hosted/). [`run.json`](evidence/hosted/run.json) identifies the exact source commit and workflow artifact hash; [`visual-review.json`](evidence/hosted/visual-review.json) records the post-run inspection. The automatically generated print report retains its original visual-review-pending note; the separate visual review records the completed inspection.

The dot cloud build environment did not launch local Chromium or native VS Code. Those executions occurred on the non-root `ubuntu-22.04` hosted runner with sandboxes enabled. Local fixture-only `generated/native-report.json` remains explicitly marked not-run; the executed consumer report is `evidence/hosted/native-report.json` and consumes the actual browser download. No local editor-profile access is implied.

Repository publication and tests establish this bounded synthetic workflow. They do not validate arbitrary installed extensions, real user context reachability, all keyboard layouts, or commercial demand.

## Acceptance boundaries

The exact fixture change is focus=true, selection=true, lang=python: selection→Python. The other 11 contexts retain command/args or fall-through. A same-key Python-vs-JavaScript fixture is disjoint. Imported command IDs remain inert data; only demo.generic, demo.python and demo.selection are runnable in the isolated native fixture. The harness never opens the user's editor profile.

Finite model results do not imply real editor-state reachability, undisclosed built-in/extension coverage, or every keyboard layout. The oracle is pinned to 1.96.4, not a claim about the current or every VS Code release. Output comments/formatting are normalized. The guard operation is standard Boolean logic and is not claimed as novel.
