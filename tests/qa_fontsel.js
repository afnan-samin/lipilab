const puppeteer=require('puppeteer-core');
const path=require('path');
const file='file:///'+path.resolve(__dirname,'..','index.html').replace(/\//g, '/');
const out=[];const ok=(n,c,d)=>out.push((c?'PASS':'FAIL')+' | '+n+(d?' | '+d:''));
(async()=>{
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--allow-file-access-from-files']});
const p=await b.newPage();
const errs=[];
p.on('pageerror',e=>errs.push(e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));
await p.evaluate(()=>{localStorage.removeItem('lipilab:bangla-font');localStorage.removeItem('lipilab:english-font');});

// ---- markup ----
const mk=await p.evaluate(()=>({
  b:!!document.getElementById('bangla-font-select'),
  e:!!document.getElementById('english-font-select'),
  heading:document.querySelector('.font-selector__heading')?.textContent.trim(),
  bOpts:[...document.getElementById('bangla-font-select').options].map(o=>o.value),
  eOpts:[...document.getElementById('english-font-select').options].map(o=>o.value),
  bSel:document.getElementById('bangla-font-select').value,
  eSel:document.getElementById('english-font-select').value}));
ok('both selects exist', mk.b&&mk.e);
ok('group is labelled "Font:"', mk.heading==='Font:', mk.heading);
ok('Bangla options populated', mk.bOpts.length>1, mk.bOpts.join(','));
ok('English options populated', mk.eOpts.length>1, mk.eOpts.join(','));
ok('Kalpurush is the default Bangla pick (brand face first)', mk.bSel==='Kalpurush', mk.bSel);
ok('Nirmala UI is kept last as a fallback', mk.bOpts[mk.bOpts.length-1]==='Nirmala UI', mk.bOpts.join(','));
ok('Times New Roman is the default English pick', mk.eSel==='Times New Roman', mk.eSel);

// ---- Bangla list follows the OUTPUT encoding ----
const swap=await p.evaluate(async()=>{
  const r=id=>[...document.getElementById(id).options].map(o=>o.value);
  const out={};
  document.getElementById('dir-unicode-bijoy').click();
  await new Promise(r=>setTimeout(r,120));
  out.u2b={b:r('bangla-font-select'), sel:document.getElementById('bangla-font-select').value};
  document.getElementById('dir-bijoy-unicode').click();
  await new Promise(r=>setTimeout(r,120));
  out.b2u={b:r('bangla-font-select'), sel:document.getElementById('bangla-font-select').value};
  return out;});
ok('Unicode→Bijoy switches to the Bijoy font list', swap.u2b.b.join(',')==='SutonnyMJ,TonnyBanglaMJ', swap.u2b.b.join(','));
ok('Unicode→Bijoy default is SutonnyMJ', swap.u2b.sel==='SutonnyMJ', swap.u2b.sel);
ok('Bijoy→Unicode switches back to the Unicode list', swap.b2u.b.join(',').indexOf('Kalpurush')===0, swap.b2u.b.join(','));
ok('Bijoy→Unicode default is Kalpurush', swap.b2u.sel==='Kalpurush', swap.b2u.sel);
// ---- preview follows the Bangla pick ----
const prev=await p.evaluate(async()=>{
  const ta=document.getElementById('output-textarea');
  const s=document.getElementById('bangla-font-select');
  s.value='Kalpurush'; s.dispatchEvent(new Event('change'));
  await new Promise(r=>setTimeout(r,150));
  return ta.style.fontFamily;});
ok('preview textarea uses the selected Bangla font', /Kalpurush/.test(prev), prev);

// ---- persistence ----
const persist=await p.evaluate(async()=>{
  const e=document.getElementById('english-font-select');
  e.value='Calibri'; e.dispatchEvent(new Event('change'));
  return {b:localStorage.getItem('lipilab:bangla-font'), e:localStorage.getItem('lipilab:english-font')};});
ok('Bangla pick persisted to localStorage', persist.b==='Kalpurush', String(persist.b));
ok('English pick persisted to localStorage', persist.e==='Calibri', String(persist.e));

// ---- unknown saved name falls back to the list default ----
await p.evaluate(()=>{localStorage.setItem('lipilab:bangla-font','Definitely Not A Font');location.reload();});
await new Promise(r=>setTimeout(r,1800));
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));
const fb=await p.evaluate(()=>({
  sel:document.getElementById('bangla-font-select').value,
  eng:document.getElementById('english-font-select').value}));
ok('unknown saved Bangla name falls back to the default', fb.sel==='Kalpurush', fb.sel);
ok('saved English pick survives reload', fb.eng==='Calibri', fb.eng);

// ---- Clear resets to the encoding defaults ----
const clr=await p.evaluate(async()=>{
  document.getElementById('clear-btn').click();
  await new Promise(r=>setTimeout(r,150));
  return {b:document.getElementById('bangla-font-select').value,
    e:document.getElementById('english-font-select').value,
    lb:localStorage.getItem('lipilab:bangla-font')};});
ok('Clear resets the Bangla pick to the default', clr.b==='Kalpurush', clr.b);
ok('Clear resets the English pick to the default', clr.e==='Times New Roman', clr.e);
ok('Clear persists the defaults', clr.lb==='Kalpurush', String(clr.lb));

// ---- toolbar layout: one row desktop, three rows mobile ----
const layout=await p.evaluate(()=>{
  const g=n=>document.querySelector(n).getBoundingClientRect();
  const dir=g('.direction-selector'), live=g('.live-toggle'), fs=g('.font-selector'), conv=g('#convert-btn');
  return {dirL:Math.round(dir.left), liveL:Math.round(live.left), fsL:Math.round(fs.left), convL:Math.round(conv.left),
    // Desktop keeps one row and the DOM order: direction, Live, font, Convert.
    sameRow:Math.max(dir.top,live.top,fs.top,conv.top)-Math.min(dir.top,live.top,fs.top,conv.top)<12,
    ordered:dir.left<live.left&&live.left<fs.left&&fs.left<conv.left,
    short:getComputedStyle(document.querySelector('.dir-label--short')).display,
    full:getComputedStyle(document.querySelector('.dir-label--full')).display};});
ok('desktop: everything shares ONE row', layout.sameRow,
  'dir='+layout.dirL+' live='+layout.liveL+' font='+layout.fsL+' convert='+layout.convL);
ok('desktop: order is direction, Live, font, Convert', layout.ordered);
ok('desktop: full direction labels, short forms hidden', layout.full!=='none'&&layout.short==='none', layout.full+'/'+layout.short);

await p.setViewport({width:390,height:800});
await new Promise(r=>setTimeout(r,500));
const m=await p.evaluate(()=>{
  const g=n=>document.querySelector(n).getBoundingClientRect();
  const dir=g('.direction-selector'), live=g('.live-toggle'), fs=g('.font-selector'), conv=g('#convert-btn');
  return {dirT:Math.round(dir.top), liveT:Math.round(live.top), fsT:Math.round(fs.top), convT:Math.round(conv.top),
    // Mobile: direction row 1, font row 2, Live + Convert TOGETHER on row 3.
    dirFirst:dir.bottom<=fs.top+1,
    fontAbove:fs.bottom<=Math.min(live.top,conv.top)+1,
    liveWithConvert:Math.abs(live.top-conv.top)<12 && live.left<conv.left,
    fsW:Math.round(fs.width), selW:Math.round(document.querySelector('#bangla-font-select').getBoundingClientRect().width),
    short:getComputedStyle(document.querySelector('.dir-label--short')).display,
    full:getComputedStyle(document.querySelector('.dir-label--full')).display,
    overflow:document.documentElement.scrollWidth>window.innerWidth};});
ok('mobile: direction selector is row 1', m.dirFirst, 'dir='+m.dirT);
ok('mobile: font picker is row 2, full width', m.fontAbove && m.fsW>300,
  'font='+m.fsT+' width='+m.fsW);
ok('mobile: Live and Convert share row 3 (Live left)', m.liveWithConvert,
  'live='+m.liveT+' convert='+m.convT);
ok('mobile: font selects are not squeezed', m.selW>120, 'select width='+m.selW+'px');
ok('mobile: short direction labels shown', m.short!=='none'&&m.full==='none', m.short+'/'+m.full);
ok('mobile: no horizontal overflow', !m.overflow);

ok('no page errors', errs.length===0, errs.join(' || '));
out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
await b.close();process.exit(f?1:0);})().catch(e=>{console.error('ERR',e.message);process.exit(2);});