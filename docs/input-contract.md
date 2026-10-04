# Input contract

A project is strict JSON with exactly `version`, `platform`, `sources`, `model`. Snippet arrays may use JSONC line/block comments and trailing commas. Duplicate JSON properties, malformed Unicode, non-finite or negative-zero numbers and unsupported fields are rejected. Source order and array order together define the imported low-to-high priority.

```
{
  "version": 1,
  "platform": "linux",
  "sources": [{"name": "My keys", "rules": [
    {"key":"ctrl+k","command":"example.command","when":"focus && lang == 'python'","args":{"mode":"safe"}}
  ]}],
  "model": {
    "focus":{"type":"boolean","values":[false,true,null]},
    "lang":{"type":"string","values":["python","javascript",null]}
  }
}
```

There are nine modeled combinations in this example. Absent keys are omitted from scenario context objects. A boolean bare key evaluates true only for `true`; `!focus` is true for both false and absent. In VS Code, unquoted `focus == false` normalizes to `!focus`, so it also matches absence. String equality is against literal strings, never another key. A string comparison such as `lang != python` matches an absent key.

The declared context values do not establish editor reachability. Include every value relevant to the intended review; values outside the model have no enumerated behavior guarantee. The compiler preserves the supported Boolean expression rather than replacing it with a finite truth-table enumeration.

## Supported grammar

OR has lower precedence than AND; `!` applies to a boolean key, constant or parenthesized expression. Use `!(lang == python)` or `!(!focus)`, not `!lang == python` or `!!focus`. String keys require `==` or `!=`. Boolean equality requires unquoted `true` or `false`. Quoted `'true'`/`'false'` are string values. Unquoted simple values can contain letters, digits, `_`, `.`, `:`, `/`, `-`; quote values with spaces, the word `not`, or a leading slash. A single-quoted literal cannot contain a single quote, backslash, newline or control character in this v1. Escape syntax is deliberately unsupported. Double-quoted when literals are unsupported even though the enclosing JSON string uses double quotes.

Context key names must match `[A-Za-z_][A-Za-z0-9_.-]*`. Only space, tab, CR, LF and non-breaking space are accepted between when tokens, matching the pinned consumer scanner. Other Unicode whitespace is rejected.

The reserved keys include `true`, `false`, `in`, `not`, prototype-related names and platform/browser constants such as `isLinux`, `isMac`, `isWindows`, `isWeb`, `isMacNative`, `isEdge`, `isFirefox`, `isChrome`, `isSafari`. These are rejected instead of using the computer that happens to run the app as the target platform. Additional `isIOS`, `isMobile`, `isDevelopment`, `isAndroid`, `isNative` are conservatively reserved.

## Key names

Lowercase supported base keys: `a`–`z`, `0`–`9`, `f1`–`f19`, `left`, `up`, `right`, `down`, `pageup`, `pagedown`, `end`, `home`, `tab`, `enter`, `escape`, `space`, `backspace`, `delete`, `insert`, `pausebreak`, `capslock`.

Modifiers are `ctrl`, `shift`, `alt`, plus `meta` for Linux, `win` for Windows, or `cmd` for macOS. Reordering those modifiers is normalized. Casing, `control`, `option`, cross-platform aliases, scan codes, punctuation and multi-stroke chords are rejected. No keyboard-layout conversion is performed.

## Resource limits

100 rules; 1–100 nonempty named sources; 16 keys; 1–64 unique values per key; 4,096 total combinations. Domain values are typed booleans or strings up to 256 characters, plus `null` meaning absent. Whole input max 1 MiB UTF-8 and JSON depth 24; individual general strings max 65,536 characters. Source names max 100, command IDs max 256, key expressions max 100. Input when clause max 2,048 characters / nesting 64. Each generated guard max 32,768 and total guard text max 1 MiB. A conservative normalization preflight limits any input/output expression to 4,096 DNF terms and 65,536 literals, because VS Code normalizes Boolean expressions and short alternating conditions can otherwise expand exponentially. This preflight may reject some logically simpler expressions; rewrite them explicitly rather than relying on consumer simplification. Scenario rows have a 16 MiB aggregate serialized budget to prevent large args across many groups exhausting browser memory. A descriptive rejection asks for smaller groups/domains rather than silently truncating an export.

Args remain data. They may contain any valid bounded JSON value except negative zero (including underflowed negative-zero literals), which is rejected because JSON.stringify would silently turn it into positive zero. An absent args property remains absent; explicit null remains null. Source maps use zero-based source, rule and output indices, plus stable human-readable IDs `s1:r1`. Priority lists are complete permutations within one normalized key group, highest first.

## Command-prefix semantics

Leading `-` removal rules and leading `^` bubbling command prefixes are rejected. The upstream VS Code ResolvedKeybindingItem removes a leading caret and changes the bubble flag; `^` alone can become an empty command and `^-command` can become a removal. A v1 data-only rule cannot preserve these effects by merely copying the command text, so WhenFold rejects them before compilation rather than claiming they are ordinary command IDs.
