// Thin import boundary only. All parsing, evaluation, key dispatch, and precedence
// semantics below come from unmodified, SHA-256-verified official VS Code sources.
export { ContextKeyExpr, Parser } from './upstream/src/vs/platform/contextkey/common/contextkey.js';
export { KeybindingResolver, ResultKind } from './upstream/src/vs/platform/keybinding/common/keybindingResolver.js';
export { ResolvedKeybindingItem } from './upstream/src/vs/platform/keybinding/common/resolvedKeybindingItem.js';
export { KeybindingParser } from './upstream/src/vs/base/common/keybindingParser.js';
export { USLayoutResolvedKeybinding } from './upstream/src/vs/platform/keybinding/common/usLayoutResolvedKeybinding.js';
export { OperatingSystem } from './upstream/src/vs/base/common/platform.js';
