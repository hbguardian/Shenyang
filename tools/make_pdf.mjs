// Build a phone-friendly PDF of the trip app from the same data the app uses.
// Usage (from repo root, after `python3 tools/build.py`): node tools/make_pdf.mjs
// Writes docs/Pulse-China-Trip.pdf
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = process.env.CHROMIUM_PATH || undefined;
const b = await chromium.launch(exe ? { executablePath: exe } : {});
const app = await b.newPage();
await app.goto('file://' + path.join(ROOT, 'docs/index.html'));
const D = await app.evaluate(() => ({ BUY, SUP, CK, USB, WORLD, FUN, IMG, PHOTO, TM, DAYS, Q, P }));

const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NK = ['Not part of Neko', 'A little like it', 'Partly like it', 'Close', 'Very close', 'Same thing'];
const bar = n => `<span class="bar">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span> <b class="sc">${n} of 5</b>`;
const pic = id => D.PHOTO[id] ? `<img src="${D.PHOTO[id]}">` : (D.IMG[id] || '');
const day = d => { const x = new Date(d[1] + 'T12:00:00'); return x.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
const sups = it => D.SUP.filter(s => s.items.includes(it.id));

const cmef = D.P[0];
let h = `
<section class="cover">
  <div class="mark">P</div>
  <div class="kick">Pulse · 510 Summit</div>
  <h1>Farrukh's China trip</h1>
  <p class="lede">Shenyang Oct 15–20 · CMEF Beijing Oct 21–24, 2026<br>What to buy, who makes it, and how to check it's OK for America.</p>
  <div class="rules">
    <div class="rule no"><b>🛑 No deposits.</b> Quotes only. Harris approves before any money moves.</div>
    <div class="rule"><b>📝 Get it in writing:</b> FDA number, UL or ETL number, US power (110V), price FOB Dalian with delivery time.</div>
    <div class="rule"><b>🇺🇸 Run the “OK for America?” check</b> at every supplier (page with the Chinese questions is in this guide).</div>
    <div class="rule"><b>📨 Every evening:</b> send Harris your quotes and photos on WeChat.</div>
  </div>
  <div class="box"><span class="kick">CMEF fair</span><b lang="zh">${esc(cmef.zh)}</b><span lang="zh">${esc(cmef.addr)}</span><span class="muted">${esc(cmef.addrEn)}</span></div>
  <div class="box"><span class="kick">Contents</span><ol class="toc"><li>Day-by-day plan</li><li>Machines to buy from China (with companies)</li><li>Questions to show suppliers, in Chinese</li><li>Buy these in the US</li><li>Best in the world vs Neko</li><li>Fun, food and mosques</li></ol>
  <p class="muted small">Neko match: 5 of 5 = the same as Neko's scan, 1 of 5 = a little like it. Research as of Oct 15, 2026; Harris re-checks every FDA number before buying. Not legal advice.</p></div>
</section>

<section><h2>1 · Day-by-day plan</h2>
${D.DAYS.map(d => { const ms = D.TM.filter(m => m.d === d[0]); return `<div class="day"><div class="day-h"><b>Day ${d[0]} · ${esc(d[4])}</b><span>${esc(day(d))} · ${esc(d[3])}</span></div>
${ms.map(m => `<div class="stop"><div class="stop-h"><span class="ic">${m.ic}</span><b>${esc(m.title)}</b><span class="tag ${m.t}">${m.t === 'biz' ? 'Business' : m.t === 'see' ? 'Free time' : 'Prep'} · ${esc(m.min)}</span></div>
 ${m.why ? `<p>${esc(m.why)}</p>` : ''}${m.say ? `<p>${m.say.map(esc).join(' ')}</p>` : ''}
 ${m.zh ? `<p class="where"><span lang="zh"><b>${esc(m.zh)}</b> ${esc(m.addr || '')}</span>${m.addrEn ? `<br><span class="muted">${esc(m.addrEn)}</span>` : ''}</p>` : ''}
 ${(m.items || []).length ? `<p class="mi">Machines: ${m.items.map(id => (D.BUY.find(x => x.id === id) || {}).name).filter(Boolean).map(esc).join(' · ')}</p>` : ''}
 ${m.todo ? `<ul class="todo">${m.todo.map(t => `<li>☐ ${esc(t)}</li>`).join('')}</ul>` : ''}
 ${m.tip ? `<p class="tip">💡 ${esc(m.tip)}</p>` : ''}</div>`).join('')}</div>`; }).join('')}
</section>

<section><h2>2 · Machines to buy from China</h2>
<p class="muted">Each machine: what it needs to be legal in America, how close it is to Neko, and the companies to visit.</p>
${D.BUY.map(it => `<div class="mach">
 <div class="mach-h"><div class="pic">${pic(it.id)}</div><div><h3>${esc(it.name)}${it.opt ? ' <span class="opt">Optional</span>' : ''}</h3><span lang="zh" class="zh">${esc(it.zh)}</span><p>${esc(it.what)}</p>
 <p class="small"><b>US:</b> ${esc(it.us)} · <b>China:</b> ${esc(it.cn)}</p></div></div>
 <div class="row2"><div><span class="lbl">Must have</span><div class="chips">${it.checks.filter(k => D.CK[k].critical).map(k => `<i class="must">${esc(D.CK[k].short)}</i>`).join('')}${it.checks.filter(k => !D.CK[k].critical).map(k => `<i>${esc(D.CK[k].short)}</i>`).join('')}</div></div>
 <div><span class="lbl">Neko match</span>${it.neko.score ? `<div>${esc(it.neko.match)}: ${bar(it.neko.score)} <span class="muted">${NK[it.neko.score].toLowerCase()}</span></div>` : '<div class="muted">None. Neko doesn\'t have this</div>'}<p class="small muted">${esc(it.neko.note)}</p></div></div>
 ${it.usPrices ? `<div class="usp"><span class="lbl">What US sellers charge</span>${it.usPrices.map(x => `<div class="pr-r"><span>${esc(x[0])} <span class="muted">(${esc(x[1])})</span></span><b>${esc(x[2])}</b></div>`).join('')}<div class="pr-r cn"><span>Direct from the maker in China</span><b>${esc(it.cn)}</b></div>${it.nego ? `<p class="say"><span lang="zh">${esc(it.nego[0])}</span><br><span class="muted">${esc(it.nego[1])}</span></p>` : ''}</div>` : ''}
 <span class="lbl">Companies to visit · ${sups(it).length}</span>
 ${sups(it).map(s => `<div class="sup"><div class="sup-h"><b>${esc(s.en)}</b>${s.zh ? ` <span lang="zh">${esc(s.zh)}</span>` : ''} <span class="muted">· ${esc(s.city)}</span></div>
  ${s.cert ? `<div class="cert ${s.certOk ? 'y' : 'n'}">${s.certOk ? '✓' : '⚠'} ${esc(s.cert)}</div>` : ''}
  <table class="kv"><tr><th>Where</th><td>${esc(s.meet)}${s.addr ? `<br><span lang="zh">${esc(s.addr)}</span>` : ''}${s.addrEn ? `<br><span class="muted">${esc(s.addrEn)}</span>` : ''}</td></tr>
  <tr><th>Ask for</th><td><b>${esc(s.ask[2])}</b> · <span lang="zh">${esc(s.ask[0])}</span> <span class="muted">(${esc(s.ask[1])})</span></td></tr>
  <tr><th>Get there</th><td>${esc(s.how)}</td></tr>
  ${(s.clients || []).length ? `<tr><th>Who uses them</th><td>${s.clients.map(c => `${c[1] === 'v' ? '✓' : '⚠ They say:'} ${esc(c[0])}`).join('<br>')}</td></tr>` : ''}
  ${(s.connect || []).length ? `<tr><th>Connect</th><td>${s.connect.map(esc).join('<br>')}</td></tr>` : ''}
  ${s.risk || s.flags ? `<tr><th>Watch</th><td>${esc([s.risk, s.flags].filter(Boolean).join(' '))}</td></tr>` : ''}</table></div>`).join('') || '<p class="muted">No maker found yet. Ask at CMEF.</p>'}
 ${(it.faq || []).length ? `<div class="faq"><span class="lbl">Questions and answers</span>${it.faq.map(f => `<p><b>${esc(f[0])}</b> ${esc(f[1])}</p>`).join('')}</div>` : ''}
</div>`).join('')}
</section>

<section><h2>3 · Show this to every supplier</h2>
<p class="muted">The “OK for America?” check. Must-haves are marked ★. A “no” on any ★ = not OK for America.</p>
${Object.entries(D.CK).map(([k, c]) => `<div class="q"><div class="q-h">${c.critical ? '★ ' : ''}<b>${esc(c.short)}</b></div><p lang="zh" class="qz">${esc(c.zh)}</p><p>${esc(c.en)}</p><p class="small muted">Check: ${esc(c.verify)}</p></div>`).join('')}
${D.Q.filter(q => !Object.values(D.CK).some(c => c.zh === q[0])).map(q => `<div class="q"><p lang="zh" class="qz">${esc(q[0])}</p><p>${esc(q[1])}</p></div>`).join('')}
<div class="q"><p lang="zh" class="qz">你们给哪些美国品牌做过？</p><p>Which US brands do you make for? (Harris checks the names on ImportYeti.)</p></div>
</section>

<section><h2>4 · Buy these in the US</h2>
<p class="muted">Can't or shouldn't come from China. Harris handles these from New Jersey.</p>
${D.USB.map(u => `<div class="us">${D.PHOTO[u.id] ? `<img class="usph" src="${D.PHOTO[u.id]}">` : ''}<h3>${u.ic} ${esc(u.name)}</h3><p>${esc(u.what)}</p><p class="why">🚫 Not from China: ${esc(u.why)}</p>
 <table class="kv">${u.buy.map(x => `<tr><th>${esc(x[2])}</th><td><b>${esc(x[0])}</b><br><span class="muted">${esc(x[1])}</span></td></tr>`).join('')}</table><p class="small"><b>Neko match:</b> ${esc(u.neko)}</p></div>`).join('')}
</section>

<section><h2>5 · Best in the world vs Neko</h2>
<p class="muted">For every part of Neko's scan: does China have it, and the best machine anywhere.</p>
${D.WORLD.map(g => `${g.head ? `<h3 class="wh">${esc(g.head)}</h3>` : ''}<div class="wc${g.beyond ? ' beyond' : ''}"><div class="wc-h"><b>${g.ic} ${esc(g.part)}</b>${g.neko ? `<span class="muted"> · Neko: ${esc(g.neko)}</span>` : ''}</div>
 ${g.china ? `<div class="cn ${g.china.ok ? 'y' : 'n'}">${g.china.ok ? '🇨🇳 China has it:' : '🇨🇳 Not from China:'} ${esc(g.china.text)}</div>` : ''}
 <table class="wt">${g.picks.map((x, i) => `<tr class="${i === 0 ? 'best' : ''}"><td>${i === 0 ? '<span class="bp">Best</span> ' : ''}<b>${esc(x.flag)} ${esc(x.name)}</b><br><span class="small">${esc(x.what)}</span><br><span class="small muted">${esc(x.maker)} · ${esc(x.fda)} · US: ${esc(x.us)}</span></td><td class="r">${x.price ? `<b>${esc(x.price)}</b><br>` : ''}${x.score == null ? '' : x.score > 5 ? '<span class="bp beyond">Beyond Neko</span>' : `${x.score} of 5`}</td></tr>`).join('')}</table>
 ${g.note ? `<p class="small muted">${esc(g.note)}</p>` : ''}</div>`).join('')}
</section>

<section><h2>6 · Fun, food and mosques</h2>
<div class="tip">🥩 <b>Halal:</b> look for the green <span lang="zh">清真</span> sign. Ask <span lang="zh">有猪肉吗？</span> (yǒu zhūròu ma, “Is there pork?”). Most Peking duck places and dishes like <span lang="zh">锅包肉</span> use pork.</div>
${['Shenyang', 'Beijing'].map(c => `<h3 class="wh">${c === 'Shenyang' ? '沈阳 Shenyang' : '北京 Beijing'}</h3>${D.FUN.filter(f => f.city === c).map(f => `<div class="fun"><div class="stop-h"><span class="ic">${f.ic}</span><b>${esc(f.en)}</b>${f.halal ? '<span class="tag halal">Halal</span>' : ''}</div><p>${esc(f.why)}</p>
 <p class="where"><span lang="zh"><b>${esc(f.zh)}</b> ${esc(f.addr || '')}</span>${f.addrEn ? `<br><span class="muted">${esc(f.addrEn)}</span>` : ''}</p>
 <p class="small">${f.how ? `🚇 ${esc(f.how)}` : ''}${f.hours ? ` · 🕐 ${esc(f.hours)}` : ''}${f.cost ? ` · ${esc(f.cost)}` : ''}</p></div>`).join('')}`).join('')}
</section>`;

const css = `
@page{size:A5;margin:12mm 10mm 14mm}
:root{--bg:#F2F5F4;--ink:#14201F;--muted:#56666A;--line:#D7E0DD;--accent:#2F7D6B;--soft:#E0EFEA;--us:#2C5282;--ussoft:#E3ECF7;--cn:#B23A2E;--no:#A3271F;--nosoft:#F8E3E0;--good:#1D6B45;--goodsoft:#E2F2E8;--care:#946010;--caresoft:#F7EDD8;--sunk:#E7EDEB}
*{box-sizing:border-box}body{margin:0;font:9.6pt/1.45 "Helvetica Neue",Arial,"WenQuanYi Zen Hei",sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
[lang=zh]{font-family:"WenQuanYi Zen Hei",sans-serif}
h1{font-size:22pt;line-height:1.1;margin:2mm 0 1mm}h2{font-size:15pt;margin:0 0 3mm;padding-bottom:2mm;border-bottom:2px solid var(--accent);color:var(--accent)}h3{font-size:12pt;margin:0 0 1mm}
p{margin:1mm 0}.muted{color:var(--muted)}.small{font-size:8.4pt}.kick{display:block;font-size:7.5pt;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);font-weight:700}
section{page-break-before:always}section.cover{page-break-before:avoid}
.mark{width:11mm;height:11mm;border-radius:4mm;background:var(--accent);color:#fff;display:grid;place-items:center;font:800 18pt Arial}
.lede{font-size:11pt;color:var(--muted)}
.rules{display:flex;flex-direction:column;gap:1.5mm;margin:3mm 0}.rule{background:var(--soft);border-radius:3mm;padding:1.8mm 3mm;font-size:9pt}.rule.no{background:var(--nosoft);color:var(--no)}
.box{border:1px solid var(--line);border-radius:3mm;padding:2.2mm 3mm;margin:2mm 0;font-size:8.8pt;display:flex;flex-direction:column;gap:.5mm}.toc{margin:1mm 0;padding-left:5mm}
.day{margin-bottom:4mm}.day-h{display:flex;justify-content:space-between;align-items:baseline;background:var(--ink);color:#fff;border-radius:2.5mm;padding:2mm 3mm;break-after:avoid}.day-h span{font-size:8.5pt;opacity:.85}
.stop,.fun{border:1px solid var(--line);border-radius:2.5mm;padding:2.5mm 3mm;margin-top:2mm;break-inside:avoid}.stop-h{display:flex;align-items:center;gap:2mm}.stop-h b{flex:1}.ic{font-size:12pt}
.tag{font-size:7pt;font-weight:700;text-transform:uppercase;border-radius:1.5mm;padding:.5mm 1.5mm;background:var(--sunk);white-space:nowrap}.tag.biz{background:var(--ussoft);color:var(--us)}.tag.see{background:var(--nosoft);color:var(--cn)}.tag.halal{background:var(--goodsoft);color:var(--good)}
.where{background:var(--bg);border-radius:2mm;padding:1.5mm 2mm}.mi{color:var(--accent);font-weight:700;font-size:8.5pt}.todo{margin:1mm 0;padding-left:2mm;list-style:none}.tip{background:var(--caresoft);border-radius:2mm;padding:1.5mm 2mm;margin:1.5mm 0}
.mach{border:1.5px solid var(--line);border-radius:3mm;padding:3mm;margin-bottom:4mm;break-inside:avoid-page}.mach-h{display:grid;grid-template-columns:30mm 1fr;gap:3mm;align-items:start}
.pic{background:var(--bg);border-radius:2.5mm;padding:1.5mm}.pic svg,.pic img{width:100%;height:auto;display:block;border-radius:1.5mm}
.il .s{stroke:var(--ink);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.il .n{fill:none}.il .a{fill:var(--soft)}.il .b{fill:var(--accent)}.il .w{fill:#fff}.il .r{fill:var(--cn)}.il .r2{fill:var(--nosoft)}.il .i{fill:var(--ussoft)}
.zh{color:var(--muted)}.opt{font-size:7pt;background:var(--caresoft);color:var(--care);border-radius:1.5mm;padding:.5mm 1.5mm;vertical-align:middle}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin:2mm 0}.lbl{display:block;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;margin:2mm 0 1mm}
.chips{display:flex;flex-wrap:wrap;gap:1mm}.chips i{font-style:normal;font-size:7.8pt;background:var(--sunk);border-radius:1.5mm;padding:.4mm 1.5mm}.chips i.must{background:var(--goodsoft);color:var(--good);font-weight:700}
.bar{display:inline-flex;gap:.6mm;vertical-align:middle}.bar i{width:3mm;height:1.6mm;border-radius:.5mm;background:var(--line)}.bar i.on{background:var(--us)}.sc{color:var(--us)}
.usp{border:1px solid var(--line);border-radius:2.5mm;padding:1mm 3mm 2mm;margin:2mm 0}.pr-r{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding:1mm 0}.pr-r b{color:var(--us)}.pr-r.cn b{color:var(--good)}.say{background:var(--bg);border-radius:2mm;padding:1.5mm 2mm}
.sup{border:1px solid var(--line);border-radius:2.5mm;padding:2mm 2.5mm;margin-top:2mm;break-inside:avoid}.sup-h b{font-size:10.5pt}
.cert{display:inline-block;font-size:8pt;font-weight:700;border-radius:1.5mm;padding:.4mm 1.8mm;margin:1mm 0}.cert.y{background:var(--goodsoft);color:var(--good)}.cert.n{background:var(--caresoft);color:var(--care)}
.kv{border-collapse:collapse;width:100%;font-size:8.6pt}.kv th{text-align:left;vertical-align:top;white-space:nowrap;color:var(--muted);font-weight:700;padding:.7mm 2.5mm .7mm 0;width:20mm}.kv td{padding:.7mm 0;vertical-align:top}
.faq p{font-size:8.6pt}
.q{border:1px solid var(--line);border-radius:2.5mm;padding:2mm 3mm;margin-bottom:2mm;break-inside:avoid}.qz{font-size:12pt;font-weight:700}
.us{border:1px solid var(--line);border-left:4px solid var(--us);border-radius:2.5mm;padding:2.5mm 3mm;margin-bottom:3mm;break-inside:avoid}.usph{width:40mm;float:right;margin:0 0 2mm 2mm;border-radius:2mm}.why{color:var(--no);background:var(--nosoft);border-radius:2mm;padding:1mm 2mm}
.wh{margin:4mm 0 2mm}.wc{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:2.5mm;padding:2.5mm 3mm;margin-bottom:3mm;break-inside:avoid}.wc.beyond{border-left-color:var(--care)}
.cn{font-size:8.5pt;font-weight:700;border-radius:1.5mm;padding:.8mm 2mm;margin:1.5mm 0}.cn.y{background:var(--goodsoft);color:var(--good)}.cn.n{background:var(--nosoft);color:var(--no)}
.wt{width:100%;border-collapse:collapse}.wt td{border-top:1px solid var(--line);padding:1.3mm 0;vertical-align:top}.wt td.r{text-align:right;white-space:nowrap;padding-left:2mm;color:var(--us)}.wt tr.best td{background:var(--soft)}
.bp{font-size:6.8pt;font-weight:800;text-transform:uppercase;background:var(--accent);color:#fff;border-radius:1.2mm;padding:.3mm 1.2mm}.bp.beyond{background:var(--care)}`;

const pdf = await b.newPage();
await pdf.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pulse · Farrukh's China trip guide</title><style>${css}</style></head><body>${h}</body></html>`, { waitUntil: 'load' });
const out = path.join(ROOT, 'docs/Pulse-China-Trip.pdf');
await pdf.pdf({ path: out, format: 'A5', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="font:7px Arial;color:#888;width:100%;text-align:center">Pulse · China trip guide · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  margin: { top: '12mm', bottom: '14mm', left: '10mm', right: '10mm' } });
await b.close();
console.log('wrote', out);
