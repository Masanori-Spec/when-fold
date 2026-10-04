# Research and differentiated workflow

Reviewed 2026-10-04. This is a bounded product comparison, not a universal prior-art search, novelty claim, patent opinion, market validation or measured time-saving claim.

## Consumer semantics

[VS Code keyboard shortcuts](https://code.visualstudio.com/docs/configure/keybindings) defines ordered resolution: the last matching rule wins, stopping further rule processing. It also documents args, removal and suppression, platform modifiers, layout considerations, and built-in conflict/troubleshooting tools. WhenFold uses this supplied-order meaning and rejects unsupported rule types instead of translating them speculatively.

[VS Code when-clause reference](https://code.visualstudio.com/api/references/when-clause-contexts) documents Boolean operators, equality literals and parentheses, alongside richer syntax deliberately excluded here. The application's finite type contract is narrower than the editor grammar. The supported guard transformation is standard Boolean logic.

## Closest documented alternatives

[Keybinding Conflict Scanner repository](https://github.com/rhslvkf/keybinding-conflict-scanner) describes collision detection and source/context filtering. Its priority-detection limitation says it cannot establish the winner. It also excludes dynamic bindings and documents limits on built-in coverage. Treat those as the project's documented claims, not an independent audit of the extension internals.

[Shortcut Sensei marketplace documentation](https://marketplace.visualstudio.com/items?itemName=AnandShah.ShortcutSensei) describes exact duplicates versus potential overrides, with a stated inability to resolve actual when-clause precedence. It has other coaching and optimization features beyond this workbench. Its listing includes publication/development notes; no install or production-maturity claim is made here.

## The difference worth testing

WhenFold accepts explicit ordered snippets and a typed finite model, distinguishes disjoint conditions from witnessed overlaps, preserves default behavior, records user priority choices, and produces a disjoint guarded pack with source map, context scenarios and command/args delta. It does not scan installed extensions or promise every conflict in an editor is covered.

The executable claim is intentionally small: given supplied supported rules and the declared contexts, exported semantics agree with the chosen priority. The pinned upstream resolver is an independent consumer, and the disposable editor fixture exercises real keypress dispatch. Neither establishes demand, deployment safety for arbitrary extensions, keyboard layouts, or reachability of the declared logical contexts.

## Verification source

[Microsoft VS Code at pinned commit cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba](https://github.com/microsoft/vscode/tree/cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba) is the 1.96.4 source used for the independent test oracle. Exact file hashes and original notices are in `oracle/upstream-lock.json` and the vendored dependency closure. See `docs/oracle-method.md` for scope and integrity details.
