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
await p.setViewport({width:1400,height:1000});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));

const nb=await p.evaluate(()=>{
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';
  document.getElementById('clear-btn').click();
  const n=document.querySelector('.notif');
  const r=n.getBoundingClientRect();
  const hdr=document.querySelector('.app-header').getBoundingClientRect();
  const bar=n.querySelector('.notif__bar');
  return {top:Math.round(r.top),hdrBottom:Math.round(hdr.bottom),
    belowHeader:r.top>=hdr.bottom-1, right:Math.round(window.innerWidth-r.right),
    w:Math.round(r.width), barDur:getComputedStyle(bar).animationDuration,
    msg:n.querySelector('.notif__msg').textContent,
    hasClose:!!n.querySelector('.notif__close'), kind:n.className};
});
ok('notification shows', !!nb.msg, nb.msg+' ['+nb.kind+']');
ok('sits just BELOW the app header', nb.belowHeader, 'notifTop='+nb.top+' headerBottom='+nb.hdrBottom);

// Re-measure after the slide-in animation settles, otherwise the start
// transform (translateX 24px) makes the card look like it overflows.
await new Promise(r=>setTimeout(r,500));
const settled=await p.evaluate(()=>{
  const n=document.querySelector('.notif'); if(!n) return null;
  const r=n.getBoundingClientRect();
  return {rightGap:Math.round(window.innerWidth-r.right), left:Math.round(r.left),
    right:Math.round(r.right), vw:window.innerWidth, w:Math.round(r.width)};
});
ok('anchored top-RIGHT, fully inside viewport',
   settled && settled.rightGap===16 && settled.right<=settled.vw && settled.left>=0,
   settled?JSON.stringify(settled):'no notif');
ok('progress bar animates for 2s', nb.barDur==='2s', nb.barDur);
ok('has a close (X) button', nb.hasClose);

const before=await p.evaluate(()=>document.querySelectorAll('.notif').length);
await new Promise(r=>setTimeout(r,2600));
const after=await p.evaluate(()=>document.querySelectorAll('.notif').length);
ok('auto-dismisses after ~2s', before===1&&after===0, 'before='+before+' after='+after);

await p.evaluate(()=>document.getElementById('copy-btn').click());
await new Promise(r=>setTimeout(r,120));
const xres=await p.evaluate(()=>{
  const n=document.querySelector('.notif');
  if(!n) return {found:false};
  n.querySelector('.notif__close').click();
  return {found:true, closing:n.dataset.closing==='1'};
});
await new Promise(r=>setTimeout(r,600));
const xGone=await p.evaluate(()=>document.querySelectorAll('.notif').length);
ok('X closes it immediately', xres.found&&xres.closing&&xGone===0, 'count='+xGone);

const blk=await p.evaluate(()=>{
  document.getElementById('output-textarea').value='আজ মঙ্গলবার';
  document.getElementById('download-open-btn').click();
  const hdr=document.querySelector('.app-header');
  const hr=hdr.getBoundingClientRect();
  const pts=[[hr.left+30,hr.top+20],[hr.right-40,hr.top+20],[hr.left+hr.width/2,hr.top+10]];
  const hits=pts.map(([x,y])=>{const e=document.elementFromPoint(x,y);return e?!!e.closest('.app-header'):false;});
  return {anyHeaderClickable:hits.some(Boolean), bodyClass:document.body.classList.contains('dlg-open'),
    pe:getComputedStyle(hdr).pointerEvents, hits};
});
ok('app header NOT clickable while modal open', blk.anyHeaderClickable===false&&blk.pe==='none', 'pe='+blk.pe+' hits='+JSON.stringify(blk.hits));
ok('body flagged dlg-open', blk.bodyClass);

const back=await p.evaluate(()=>{
  document.querySelector('#download-modal .dlg__backdrop').click();
  return {modalHidden:document.getElementById('download-modal').hidden,
    bodyClass:document.body.classList.contains('dlg-open'),
    pe:getComputedStyle(document.querySelector('.app-header')).pointerEvents};
});
// Backdrop clicks are intentionally NOT a way to close the dialog (see the note
// above wireDialog in app.js), so the modal must still be open afterwards and the
// app header must still be pointer-blocked. The close button is what restores it.
ok('backdrop click does NOT close the dialog', !back.modalHidden);
ok('header still pointer-blocked while dialog stays open', back.bodyClass && back.pe==='none', 'pe='+back.pe);

const closed=await p.evaluate(()=>{
  document.getElementById('download-close-btn').click();
  return {modalHidden:document.getElementById('download-modal').hidden,
    bodyClass:document.body.classList.contains('dlg-open'),
    pe:getComputedStyle(document.querySelector('.app-header')).pointerEvents};
});
ok('close button closes the dialog', closed.modalHidden);
ok('header clickable again after close', !closed.bodyClass&&closed.pe==='auto', 'pe='+closed.pe);

const dh=await p.evaluate(()=>{
  document.getElementById('download-open-btn').click();
  const cs=getComputedStyle(document.querySelector('#download-modal .dlg__header'));
  return {bg:cs.backgroundColor, hdrBg:getComputedStyle(document.querySelector('.app-header')).backgroundColor};
});
ok('dialog header colour matches app header', dh.bg===dh.hdrBg, 'dlg='+dh.bg+' appHeader='+dh.hdrBg);
await new Promise(r=>setTimeout(r,450));
await p.screenshot({path:path.join(process.env.TEMP,'shots','dl-modal.png')});

await p.evaluate(()=>{document.getElementById('download-modal').hidden=true;document.body.classList.remove('dlg-open');
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';document.getElementById('clear-btn').click();});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:path.join(process.env.TEMP,'shots','notif.png'),clip:{x:0,y:0,width:1400,height:320}});

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});