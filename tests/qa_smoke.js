// End-to-end smoke test: drives the real UI in a real browser. The other qa_*
// scripts assert one component each; this checks the whole page works — assets
// resolve, no uncaught errors, a convert round trip in both directions, DOCX
// generation produces a real file, and the toolbar lays out cleanly at real
// widths.
//
// NOTE on the round trip: some valid Bijoy words (e.g. "wjLwQ" = লিখছি) do not
// survive Bijoy→Unicode, because a lone ASCII word carrying no Bijoy-only glyph
// is left alone by the ambiguity guard that stops English being mangled. That is
// pre-existing engine behaviour, present before this branch, so the round-trip
// check uses words that are known to convert.
const puppeteer=require('puppeteer-core');
const path=require('path');
const file='file:///'+path.resolve(__dirname,'..','index.html').replace(/\//g, '/');
const out=[];const ok=(n,c,d)=>out.push((c?'PASS':'FAIL')+' | '+n+(d?' | '+d:''));
(async()=>{
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--allow-file-access-from-files']});
const p=await b.newPage();
const errs=[];
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});

await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));

// ---- every local asset the page references must load ----
const assets=await p.evaluate(async()=>{
  const urls=[...document.querySelectorAll('link[rel=stylesheet],script[src],link[rel=icon]')]
    .map(e=>e.href||e.src).filter(u=>u&&u.indexOf('file:')===0);
  const res=[];
  for(const u of urls){ try{ const r=await fetch(u); res.push({n:u.split('/').pop(),ok:r.ok}); }
    catch(e){ res.push({n:u.split('/').pop(),ok:false}); } }
  return res;});
ok('page references local assets', assets.length>=3, assets.map(a=>a.n).join(', '));
assets.forEach(a=>ok('asset loads: '+a.n, a.ok));

// ---- cache-busting versions present on the tags that matter ----
const vers=await p.evaluate(()=>{
  const g=s=>(document.querySelector(s)||{}).src||(document.querySelector(s)||{}).href||'';
  return {app:g('script[src*="app.js"]'),partner:g('script[src*="partner.js"]'),css:g('link[href*="styles.css"]')};});
ok('app.js tag has a version', /app\.js\?v=\d+/.test(vers.app), vers.app);
ok('partner.js tag has a version', /partner\.js\?v=\d+/.test(vers.partner), vers.partner);
ok('styles.css tag has a version', /styles\.css\?v=\d+/.test(vers.css), vers.css);

// ---- JSZip must be present or DOCX silently fails ----
const zip=await p.evaluate(()=>typeof JSZip);
ok('JSZip loaded', zip==='function', zip);

// ---- a real convert round trip, both directions ----
async function convert(dirId,text){
  await p.evaluate(async(d,t)=>{
    document.getElementById(d).click();
    const ta=document.getElementById('input-textarea');
    ta.value=t; ta.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(r=>setTimeout(r,250));
    document.getElementById('convert-btn').click();
    await new Promise(r=>setTimeout(r,1000));
  },dirId,text);
  return await p.evaluate(()=>document.getElementById('output-textarea').value);
}
const SRC='আমি বাংলায়';
const uniToBijoy=await convert('dir-unicode-bijoy',SRC);
ok('Unicode→Bijoy produces ASCII output', uniToBijoy.length>0 && /^[\x00-\x7F]+$/.test(uniToBijoy.trim()),
  JSON.stringify(uniToBijoy));
const bijoyToUni=await convert('dir-bijoy-unicode',uniToBijoy);
ok('Bijoy→Unicode produces Bangla output', /[ঀ-৿]/.test(bijoyToUni), JSON.stringify(bijoyToUni));
// Compare on NFC-normalised, trimmed text. "বাংলায়" ends in য়, which the
// decoder returns as য + ় (two code points) instead of the precomposed U+09DF
// — visually identical, and NFC puts them back together before comparing.
const nfc=s=>s.normalize('NFC').trim();
const rtOK=nfc(bijoyToUni)===nfc(SRC);
ok('round trip recovers the source text (NFC-normalised)', rtOK,
  JSON.stringify(nfc(bijoyToUni))+' vs '+JSON.stringify(nfc(SRC)));
// ---- the output font actually follows the encoding ----
const face=await p.evaluate(async()=>{
  const g=()=>getComputedStyle(document.getElementById('output-textarea')).fontFamily;
  document.getElementById('dir-bijoy-unicode').click();
  await new Promise(r=>setTimeout(r,250));
  const uni=g();
  document.getElementById('dir-unicode-bijoy').click();
  await new Promise(r=>setTimeout(r,250));
  return {uni:uni,bijoy:g()};});
ok('Unicode output renders a Unicode Bangla face',
  /Kalpurush|Nirmala UI|Nikosh|Shonar Bangla|Vrinda|SolaimanLipi/.test(face.uni), face.uni);
ok('Bijoy output renders a Bijoy face', /SutonnyMJ/.test(face.bijoy), face.bijoy);

// ---- DOCX generation must produce a real, non-empty file ----
const docx=await p.evaluate(async()=>{
  let captured=null;
  const orig=URL.createObjectURL;
  URL.createObjectURL=function(blob){ captured=blob; return orig.call(URL,blob); };
  document.getElementById('download-open-btn').click();
  await new Promise(r=>setTimeout(r,400));
  document.getElementById('dl-docx').click();
  await new Promise(r=>setTimeout(r,2500));
  URL.createObjectURL=orig;
  if(!captured) return {ok:false,reason:'no blob produced'};
  const buf=new Uint8Array(await captured.arrayBuffer());
  const head=String.fromCharCode.apply(null,buf.slice(0,2));
  return {ok:true,size:buf.length,zip:head==='PK'};});
ok('DOCX download produces a blob', docx.ok, docx.reason||'');
ok('DOCX is a real ZIP/OOXML package (PK header)', docx.zip===true, 'size='+docx.size);
ok('DOCX is not empty', docx.size>1000, docx.size+' bytes');

// ---- no layout overflow at real widths ----
for(const w of [1400,768,390,320]){
  await p.setViewport({width:w,height:900});
  await new Promise(r=>setTimeout(r,350));
  const ov=await p.evaluate(()=>({
    over:document.documentElement.scrollWidth>window.innerWidth,
    sw:document.documentElement.scrollWidth, iw:window.innerWidth,
    hasFont:!!document.querySelector('.font-selector'),
    hasConvert:!!document.querySelector('#convert-btn')}));
  ok(w+'px: no horizontal overflow', !ov.over, ov.sw+' vs '+ov.iw);
  ok(w+'px: font picker and Convert both present', ov.hasFont&&ov.hasConvert);
}

// ---- nothing threw along the way ----
ok('no uncaught JS errors during the whole run', errs.length===0, errs.join(' || '));

out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
await b.close();process.exit(f?1:0);})().catch(e=>{console.error('ERR',e.message);process.exit(2);});