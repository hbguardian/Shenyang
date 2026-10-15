import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'});const e=[];p.on('pageerror',x=>e.push(x.message));
await p.goto('file:///home/user/Shenyang/docs/index.html');
const r=await p.evaluate(()=>({machines:BUY.length,makers:SUP.length,noMaker:BUY.filter(b=>!SUP.some(s=>s.items.includes(b.id))).map(b=>b.id),noImg:BUY.filter(b=>!IMG[b.id]).map(b=>b.id),noNeko:BUY.filter(b=>!b.neko).map(b=>b.id),badItemRefs:TM.flatMap(m=>(m.items||[]).filter(i=>!BUY.find(b=>b.id===i))),badChecks:BUY.flatMap(b=>b.checks.filter(k=>!CK[k])),orphanMakers:SUP.filter(s=>!s.items.some(i=>BUY.find(b=>b.id===i))).map(s=>s.id),days:DAYS.map(d=>d[0]+':'+TM.filter(m=>m.d===d[0]).length).join(' ')}));
console.log(JSON.stringify(r));
// plan -> machine link
await p.evaluate(()=>{go('trip',false);curDay=8;renderTrip();});
await p.click('[data-m=heart1]');for(let i=0;i<4&&!(await p.$('[data-openitem]'));i++)await p.click('#fNext');
await p.screenshot({path:'f-stop.png'});await p.click('[data-openitem=ecg]');await p.waitForTimeout(300);
console.log('stop -> machine opens:',await p.evaluate(()=>document.getElementById('buyDlg').open&&document.getElementById('bTitle').textContent),'| mission closed:',await p.evaluate(()=>!document.getElementById('mDlg').open));
await p.evaluate(()=>document.getElementById('bBody').scrollTop=330);await p.screenshot({path:'f-ecg.png'});await p.click('#bClose');
await p.evaluate(()=>document.querySelector('[data-item=grip]').scrollIntoView());await p.screenshot({path:'f-card.png'});
console.log('errors',e);await b.close();
