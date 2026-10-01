// Measures the notification card width against the space actually available.
// The card must fill that space exactly — no narrower (dead space on the right)
// and never wider (overflow off the edge).
const puppeteer=require('puppeteer-core');
const path=require('path');
const file='file:///'+path.resolve(__dirname,'..','index.html').replace(/\//g, '/');
const out=[];const ok=(n,c,d)=>out.push((c?'PASS':'FAIL')+' | '+n+(d?' | '+d:''));
(async()=>{
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--allow-file-access-from-files']});
const p=await b.newPage();
await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'domcontentloaded'});

for(const w of [1400,768,560,390,320]){
  await p.setViewport({width:w,height:800});
  await new Promise(r=>setTimeout(r,300));
  const m=await p.evaluate(()=>{
    const c=document.querySelector('.notif-container');
    c.innerHTML='';
    const n=document.createElement('div');
    n.className='notif notif--success';
    // Build with DOM APIs so no quoting is involved.
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('class','notif__icon');
    const msg=document.createElement('p');
    msg.className='notif__msg'; msg.textContent='A representative notification message';
    const close=document.createElement('button');
    close.className='notif__close';
    const bar=document.createElement('span'); bar.className='notif__bar';
    n.append(icon,msg,close,bar);
    c.appendChild(n);
    const cr=c.getBoundingClientRect(), nr=n.getBoundingClientRect();
    const cs=getComputedStyle(c);
    return {vw:window.innerWidth, container:Math.round(cr.width), notif:Math.round(nr.width),
      left:Math.round(nr.left), right:Math.round(nr.right),
      gapRight:Math.round(window.innerWidth-nr.right),
      gapLeft:Math.round(nr.left), noOverflow:document.documentElement.scrollWidth<=window.innerWidth};
  });
  ok(w+'px: card fills the available width', Math.abs(m.notif-m.container)<1,
    'card='+m.notif+' available='+m.container);
  ok(w+'px: right edge matches the container (no dead space)', m.gapRight<=11,
    'gapRight='+m.gapRight+'px');
  ok(w+'px: no horizontal overflow', m.noOverflow);
  console.log('   '+w+'px -> card '+m.notif+' of '+m.container+' (left '+m.left+', gapRight '+m.gapRight+')');
}

out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
await b.close();process.exit(f?1:0);})().catch(e=>{console.error('ERR',e.message);process.exit(2);});
