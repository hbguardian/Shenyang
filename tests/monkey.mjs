import { chromium } from 'playwright';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
let total=0;const errs=[];
for(const w of [320,390,430]){
const p=await b.newPage({viewport:{width:w,height:800},reducedMotion:'reduce'});p.on('pageerror',e=>errs.push(w+': '+e.message));
await p.addInitScript(()=>{window.open=()=>null;});
await p.route(/amap|https?:\/\/(?!localhost)/,r=>r.abort());
await p.goto('file:///home/user/Shenyang/docs/index.html');
const views=['trip','buy','fun','ask','more','home','machines','spa','shenyang'];
for(const v of views){await p.evaluate(v=>go(v,false),v);
 // click every visible button in this view (re-query each time; UI re-renders)
 for(let i=0;i<120;i++){const btns=await p.$$('#v-'+v+' button:visible');if(i>=btns.length)break;
  try{await btns[i].click({timeout:800});total++;}catch(e){}
  // close any dialog that opened, after poking its buttons once
  for(const d of ['buyDlg','mDlg','askDlg','upDlg']){if(await p.evaluate(d=>document.getElementById(d).open,d)){
    const inner=await p.$$('#'+d+' button:visible');for(const x of inner.slice(0,6)){try{await x.click({timeout:500});total++;}catch(e){}}
    await p.evaluate(d=>{const x=document.getElementById(d);if(x.open)x.close();},d);}}
  await p.evaluate(v=>{if(document.getElementById('v-'+v).hidden)go(v,false);},v);}
 const over=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(over)errs.push(w+': page scrolls sideways on '+v);}
// every buy item & every maker's full check, every mission flow
for(const it of await p.evaluate(()=>BUY.map(x=>x.id))){await p.evaluate(i=>openItem(i),it);
 for(const s of await p.$$eval('[data-check]',x=>x.map(y=>y.dataset.check))){await p.click(`[data-check="${s}"]`);
  for(let k=0;k<10&&await p.$('[data-ans]');k++){await p.click('[data-ans="'+'ynu'[k%3]+'"]');total++;}
  await p.click('[data-cdone]');}
 await p.evaluate(()=>bDlg.close());}
await p.close();}
console.log('buttons tapped:',total);console.log('problems:',errs.length?errs:'none');await b.close();
