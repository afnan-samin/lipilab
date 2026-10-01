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
// short viewport so the shortcuts list is guaranteed to overflow
await p.setViewport({width:1400,height:460});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));

// ---- 1. shortcuts header must NOT move when the list scrolls ----
await p.evaluate(()=>document.getElementById('shortcuts-open-btn').click());
await new Promise(r=>setTimeout(r,350));
const before=await p.evaluate(()=>{
  const h=document.querySelector('#shortcuts-panel .shortcuts-panel__header');
  const body=document.querySelector('#shortcuts-panel .shortcuts-panel__body');
  const r=h.getBoundingClientRect();
  return {top:Math.round(r.top), scrollable:body.scrollHeight>body.clientHeight+1,
    sh:body.scrollHeight, ch:body.clientHeight};
});
ok('shortcuts body actually overflows (test is meaningful)', before.scrollable, 'content='+before.sh+' box='+before.ch);
await p.evaluate(()=>{
  const body=document.querySelector('#shortcuts-panel .shortcuts-panel__body');
  body.scrollTop=body.scrollHeight;
});
await new Promise(r=>setTimeout(r,250));
const after=await p.evaluate(()=>{
  const h=document.querySelector('#shortcuts-panel .shortcuts-panel__header');
  const body=document.querySelector('#shortcuts-panel .shortcuts-panel__body');
  const r=h.getBoundingClientRect();
  const title=document.querySelector('#shortcuts-panel-title').getBoundingClientRect();
  return {top:Math.round(r.top), scrollTop:Math.round(body.scrollTop), titleTop:Math.round(title.top)};
});
ok('shortcuts header stays put after scrolling', after.top===before.top && after.scrollTop>0,
   'before='+before.top+' after='+after.top+' scrolled='+after.scrollTop);

// ---- 2. shortcut rows align in two clean columns ----
const cols=await p.evaluate(()=>{
  const rows=Array.from(document.querySelectorAll('#shortcuts-panel .shortcuts-list__item'));
  const kLefts=[],kRights=[],dLefts=[];
  rows.forEach(r=>{
    const k=r.querySelector('.shortcuts-list__keys').getBoundingClientRect();
    const d=r.querySelector('.shortcuts-list__desc').getBoundingClientRect();
    kLefts.push(Math.round(k.left));
    kRights.push(Math.round(k.right));
    dLefts.push(Math.round(d.left));
    if(k.left<d.right-1) return 'overlap';
  });
  return {rows:rows.length,
    uniqKeyRights:Array.from(new Set(kRights)),
    uniqDescLefts:Array.from(new Set(dLefts)),
    noOverlap:true,
    rightAligned:Array.from(new Set(kRights)).length===1,
    descAligned:Array.from(new Set(dLefts)).length===1};
});
// Layout intent (grid: 1fr auto): descriptions form the left column and all key
// groups line up on a shared RIGHT edge. Checking the opposite edges would fail
// for any correct layout, because each row's text is a different length.
ok('all key groups share the same right edge', cols.rightAligned, JSON.stringify(cols.uniqKeyRights));
ok('all descriptions share the same left edge', cols.descAligned, JSON.stringify(cols.uniqDescLefts));
ok('every row has keys + description', cols.rows===9, 'rows='+cols.rows);
await p.evaluate(()=>document.getElementById('shortcuts-close-btn').click());

// ---- 3. download dialog header must NOT move when the body scrolls ----
// very short viewport so even the download dialog body is forced to scroll
await p.setViewport({width:1400,height:340});
await p.evaluate(()=>{
  document.getElementById('shortcuts-close-btn').click();
  document.getElementById('output-textarea').value='আজ মঙ্গলবার';
  document.getElementById('download-open-btn').click();
});
await new Promise(r=>setTimeout(r,350));
const dBefore=await p.evaluate(()=>{
  const h=document.querySelector('#download-modal .dlg__header').getBoundingClientRect();
  const body=document.querySelector('#download-modal .dlg__body');
  return {top:Math.round(h.top), scrollable:body.scrollHeight>body.clientHeight+1,
    sh:body.scrollHeight, ch:body.clientHeight};
});
ok('download body overflows at this height (test is meaningful)', dBefore.scrollable, 'content='+dBefore.sh+' box='+dBefore.ch);
await p.evaluate(()=>{
  const body=document.querySelector('#download-modal .dlg__body');
  body.scrollTop=body.scrollHeight;
});
await new Promise(r=>setTimeout(r,250));
const dAfter=await p.evaluate(()=>{
  const h=document.querySelector('#download-modal .dlg__header').getBoundingClientRect();
  const body=document.querySelector('#download-modal .dlg__body');
  const t=document.querySelector('#download-modal-title').getBoundingClientRect();
  return {top:Math.round(h.top), titleTop:Math.round(t.top), scrollTop:Math.round(body.scrollTop)};
});
ok('download header stays put after body scroll',
   dAfter.top===dBefore.top && dAfter.scrollTop>0 && dAfter.titleTop>=dBefore.top,
   'headerTop before='+dBefore.top+' after='+dAfter.top+' scrolled='+dAfter.scrollTop+' titleTop='+dAfter.titleTop);

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);

// tall screenshot of the shortcuts dialog for visual review
await p.evaluate(()=>{document.getElementById('download-modal').hidden=true;document.body.classList.remove('dlg-open');
  document.getElementById('shortcuts-open-btn').click();});
await p.setViewport({width:1400,height:1000});
await new Promise(r=>setTimeout(r,450));
const c=await p.evaluate(()=>{const r=document.querySelector('#shortcuts-panel .shortcuts-panel__content').getBoundingClientRect();
  return {x:Math.max(0,r.x-10),y:Math.max(0,r.y-10),width:Math.round(r.width)+20,height:Math.round(r.height)+20};});
await p.screenshot({path:path.join(process.env.TEMP,'shots','shortcuts-modal.png'),clip:c});
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});