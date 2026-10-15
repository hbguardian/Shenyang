import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root='/home/user/Shenyang/docs';let swBody=null;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';
 if(u==='/sw.js'&&swBody){r.setHeader('content-type','text/javascript');return r.end(swBody);}
 fs.readFile(path.join(root,u),(e,d)=>{if(e){r.writeHead(404);return r.end();}r.setHeader('content-type',u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':'application/octet-stream');r.end(d);});}).listen(8766);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const U='http://localhost:8766/';const ok=(n,v)=>console.log((v?'PASS':'FAIL')+'  '+n);
await p.goto(U);await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();
ok('first visit: offline copy installed and in control',await p.evaluate(()=>!!navigator.serviceWorker.controller));
// mark progress, then go fully offline
await p.click('.tab[data-v=fun]');await p.click('.fun-h');await p.click('.fun.open [data-fd]');
await ctx.setOffline(true);let t=Date.now();await p.reload();
ok('no internet: app opens ('+(Date.now()-t)+' ms)',await p.evaluate(()=>!!document.querySelector('.tabs')&&typeof TM!=='undefined'&&TM.length>0));
ok('no internet: progress kept',(await p.textContent('#fDone')).startsWith('1 of'));
await p.click('.tab[data-v=buy]');await p.click('[data-item=red]');ok('no internet: buttons work',await p.evaluate(()=>document.getElementById('buyDlg').open));await p.click('#bClose');
await ctx.setOffline(false);
// China-style hang: requests to the server never answer
await ctx.route('**/*',()=>{});t=Date.now();await p.reload({timeout:15000});const ms=Date.now()-t;
ok('hanging connection: app still opens instantly ('+ms+' ms)',ms<3000);await ctx.unrouteAll();
// new version published -> prompt appears
swBody=fs.readFileSync(root+'/sw.js','utf8').replace(/pulse-[0-9a-f]+/,'pulse-test2');
await p.reload();await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r.update()));
await p.waitForSelector('#upd:not([hidden])',{timeout:10000}).then(()=>ok('new version: "Tap to update" shows',true),()=>ok('new version: "Tap to update" shows',false));
console.log('page errors:',errs.length?errs:'none');await b.close();srv.close();
