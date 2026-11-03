const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const root=process.argv[2], out=process.argv[3], views=JSON.parse(fs.readFileSync(process.argv[4]));
const W=process.argv[5]||1600,H=process.argv[6]||1000;
const srv=http.createServer((q,s)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,d)=>{if(e){s.statusCode=404;return s.end()}s.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.html')?'text/html':'application/octet-stream');s.end(d)})}).listen(8765,async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage({viewport:{width:+W,height:+H}});
 pg.on('console',m=>console.log('console',m.text()));pg.on('pageerror',e=>console.log('err',e.message));
 await pg.goto(`http://localhost:8765/index.html?w=${W}&h=${H}`);await pg.waitForFunction('window.ready',null,{timeout:600000});
 console.log('box',JSON.stringify(await pg.evaluate('window.box')));
 for(const v of views){const u=await pg.evaluate(v.js);fs.writeFileSync(path.join(out,v.name+'.png'),Buffer.from(u.split(',')[1],'base64'));console.log('wrote',v.name)}
 await b.close();srv.close();});
