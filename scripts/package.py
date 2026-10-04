from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
out=root.parent/'when-fold-output'
out.mkdir(exist_ok=True)
exclude={'node_modules','test-results','.git','.upstream-build','.vscode-test','__pycache__'}
files=sorted(p for p in root.rglob('*') if p.is_file() and not any(part in exclude for part in p.relative_to(root).parts))
manifest={'name':'WhenFold','version':'0.1.0','files':[]}
zip_path=out/'when-fold-source.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:
        rel=p.relative_to(root).as_posix(); data=p.read_bytes()
        zi=zipfile.ZipInfo('when-fold/'+rel,(2026,10,4,0,0,0));zi.compress_type=zipfile.ZIP_DEFLATED;zi.external_attr=0o644<<16
        z.writestr(zi,data)
        manifest['files'].append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
manifest['archive']={'name':zip_path.name,'bytes':zip_path.stat().st_size,'sha256':hashlib.sha256(zip_path.read_bytes()).hexdigest()}
(out/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
with zipfile.ZipFile(zip_path) as z:
    assert z.testzip() is None
    for item in manifest['files']:
        assert hashlib.sha256(z.read('when-fold/'+item['path'])).hexdigest()==item['sha256']
print(json.dumps({'archive':manifest['archive'],'files':len(files)},indent=2))
