#!/usr/bin/env python3
"""Refresh the unmodified, pinned VS Code oracle dependency closure (network needed)."""
import concurrent.futures, hashlib, json, pathlib, posixpath, re, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
PIN = 'cd4ee3b1c348a13bafd8f9ad8060705f6d4b9cba'
BASE = f'https://raw.githubusercontent.com/microsoft/vscode/{PIN}/'
DEST = ROOT / 'oracle' / 'upstream'
START = ['src/vs/platform/contextkey/common/contextkey.ts', 'src/vs/platform/keybinding/common/keybindingResolver.ts', 'src/vs/platform/keybinding/common/resolvedKeybindingItem.ts', 'src/vs/base/common/keybindingParser.ts', 'src/vs/platform/keybinding/common/usLayoutResolvedKeybinding.ts', 'LICENSE.txt']
IMPORT = re.compile(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]')
seen = set(); pending = set(START); records = []
def retrieve(path):
    target = DEST / path
    # Always fetch from the immutable commit when refreshing; do not bless local edits.
    data = urllib.request.urlopen(BASE + path, timeout=60).read()
    target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(data)
    return path, data
while pending:
    batch = sorted(pending); pending.clear()
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for path, data in pool.map(retrieve, batch):
            seen.add(path)
            records.append({'path': path, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'url': BASE + path})
            if path.endswith('.ts'):
                for dependency in IMPORT.findall(data.decode()):
                    if dependency.startswith('.'):
                        next_path = posixpath.normpath(posixpath.join(posixpath.dirname(path), dependency))
                        if next_path.endswith('.js'): next_path = next_path[:-3] + '.ts'
                        elif not next_path.endswith('.ts'): next_path += '.ts'
                        if next_path not in seen and next_path not in batch: pending.add(next_path)
                    elif dependency.startswith('vs/'):
                        next_path = 'src/' + dependency + '.ts'
                        if next_path not in seen and next_path not in batch: pending.add(next_path)
            print(path)
(ROOT / 'oracle' / 'upstream-lock.json').write_text(json.dumps({'repository':'https://github.com/microsoft/vscode','version':'1.96.4','commit':PIN,'license':'MIT','files':sorted(records,key=lambda r:r['path'])}, indent=2)+'\n')
print(f'Vendored {len(records)} exact files')
