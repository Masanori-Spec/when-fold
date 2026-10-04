import http from 'node:http';
import fs from 'node:fs';
const port=Number(process.env.PORT??4173),base=(process.env.BASE_PATH??'/').replace(/\/$/,'');
http.createServer((req,res)=>{const url=new URL(req.url,'http://127.0.0.1');if(url.pathname===base||url.pathname===base+'/'||url.pathname===base+'/index.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync('dist/index.html'));}else{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`WhenFold http://127.0.0.1:${port}${base}/`));
