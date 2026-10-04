# Third-party notices

No new license is selected for original WhenFold application code.

## VS Code test oracle

`oracle/upstream/` contains unmodified Microsoft VS Code sources pinned to commit `cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba` (version 1.96.4). Those files retain their original copyright headers and Microsoft MIT License in `oracle/upstream/LICENSE.txt`. `oracle/upstream-lock.json` records each source URL and SHA-256. The sources are test-only and are not bundled into the standalone application.

The optional native harness downloads Microsoft's official VS Code 1.96.4 Linux x64 binary. It is a separately distributed product subject to its existing terms, not the application's license. The harness does not redistribute the binary.

## Development dependencies

`@playwright/test` 1.56.0 and its locked Playwright dependencies are used for browser tests (Apache-2.0 upstream). `esbuild` 0.25.11 is used for the independent upstream-source oracle build (MIT upstream). Their package-lock versions and integrity hashes are preserved. Dependencies are not included as runtime application code.
