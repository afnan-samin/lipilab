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

console.log('vw     hdrH  notifTop  gap  left right  w     overflow  overlapHdr');
const rows=[];
await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'networkidle0'});
for(const w of [1400,768,640,560,540,430,414,390,360,320]){
  await p.setViewport({width:w,height:900});
  await new Promise(r=>setTimeout(r,350));
  await p.evaluate(()=>{
    const ask=document.getElementById('ask-overlay');
    if(ask) ask.classList.remove('ask-overlay--show');
    const c=document.getElementById('toast-container');
    if(c) c.innerHTML='';
  });
  // fire one notification (clear)
  await p.evaluate(()=>{
    const t=document.getElementById('input-textarea');
    const c=document.getElementById('clear-btn');
    if(!t||!c) throw new Error('page not ready');
    t.value='আজ মঙ্গলবার';
    c.click();
  });
  await new Promise(r=>setTimeout(r,450));
  const r=await p.evaluate(()=>{
    const n=document.querySelector('.notif');
    if(!n) return null;
    const nb=n.getBoundingClientRect();
    const hdr=document.querySelector('.app-header').getBoundingClientRect();
    const cs=getComputedStyle(n);
    return {vw:window.innerWidth, hdrH:Math.round(hdr.height), hdrBottom:Math.round(hdr.bottom),
      top:Math.round(nb.top), left:Math.round(nb.left), right:Math.round(nb.right),
      w:Math.round(nb.width), h:Math.round(nb.height),
      overflowL:nb.left<0, overflowR:nb.right>window.innerWidth,
      overlap:Math.max(0,Math.round(Math.min(nb.bottom,hdr.bottom)-Math.max(nb.top,hdr.top))),
      bar:!!n.querySelector('.notif__bar'), close:!!n.querySelector('.notif__close'),
      msg:n.querySelector('.notif__msg').textContent};
  });
  if(!r){ console.log(String(w).padEnd(7)+'NO NOTIFICATION'); ok(w+'px: notification appears',false); continue; }
  rows.push(r);
  console.log(String(r.vw).padEnd(7)+String(r.hdrH).padEnd(6)+String(r.top).padEnd(10)+
    String(r.top-r.hdrBottom).padEnd(5)+String(r.left).padEnd(6)+String(r.right).padEnd(7)+
    String(r.w).padEnd(6)+String(r.overflowL||r.overflowR).padEnd(10)+r.overlap);

  ok(w+'px: notification sits BELOW the header (no overlap)', r.overlap===0,
     'gap='+(r.top-r.hdrBottom)+'px overlap='+r.overlap);
  ok(w+'px: fits inside the viewport', !r.overflowL && !r.overflowR,
     'left='+r.left+' right='+r.right+' vw='+r.vw);
  ok(w+'px: has bar + close + message', r.bar&&r.close&&!!r.msg, r.msg);
  ok(w+'px: width is sensible', r.w<=r.vw-8 && r.w>200, r.w+'px of '+r.vw);
}

// screenshots on a phone
for(const w of [390,320]){
  await p.setViewport({width:w,height:760});
  await new Promise(r=>setTimeout(r,350));
  await p.evaluate(()=>{
    document.getElementById('toast-container').innerHTML='';
    document.getElementById('input-textarea').value='আজ মঙ্গলবার';
    document.getElementById('clear-btn').click();
    document.getElementById('copy-btn').click();
    document.getElementById('undo-btn') && document.getElementById('undo-btn').click();
  });
  await new Promise(r=>setTimeout(r,350));
  await p.screenshot({path:path.join(process.env.TEMP,'shots','notif-m-'+w+'.png'),
    clip:{x:0,y:0,width:w,height:300}});
}

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});