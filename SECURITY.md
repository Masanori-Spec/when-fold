# Safety boundary

WhenFold treats rule IDs, command IDs, conditions and args as data. It never calls VS Code commands, changes editor settings, installs extensions or uploads input. The standalone app has no external runtime dependencies. Its only persistence is optional language preference in browser local storage.

The parser is independent, bounded and does not use eval or dynamic Function. It rejects unsupported syntax, undeclared contexts, unknown fields, duplicate JSON properties, malformed Unicode, removal/suppression/bubbling rules and over-budget artifacts. Imported UI strings use textContent. Reports HTML-escape imported content, set a restrictive CSP and render in a sandboxed iframe. Downloaded CSV cells prefix formula-leading text with an apostrophe, so CSV is for human review; canonical data remains in JSON.

The optional native test uses an official hash-pinned editor in temporary profiles and only three inert fixture command IDs with custom contexts. It refuses arbitrary real command IDs and requires a non-root, sandbox-capable Linux runner. It does not disable the Electron sandbox or use the user's profile. Temporary telemetry/update preferences apply only to that disposable harness.

A finite witness is not an editor reachability proof. Missing built-in/extension rules, layout/OS shortcuts and real command effects remain outside coverage. Review exported rules and retain an existing settings backup before any manual installation. This repository does not auto-apply a pack.
