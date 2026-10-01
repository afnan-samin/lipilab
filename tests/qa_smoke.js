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

// On a phone the card must be exactly as wide as its message needs — never
// narrower (text would wrap early) and never wider (a short toast should not
// stretch across the whole screen). Long text still wraps instead of
// overflowing, so it is capped at the available width.
const short='Converted successfully';
for(const w of [1400,768,560,390,320]){
  await p.setViewport({width:w,height:800});
  await new Promise(r=>setTimeout(r,300));
  const m=await p.evaluate(t=>{
    const c=document.querySelector('.notif-container');
    c.innerHTML='';
    const n=document.createElement('div');
    n.className='notif notif--success';
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('class','notif__icon');
    const msg=document.createElement('p');
    msg.className='notif__msg'; msg.textContent=t;
    const close=document.createElement('button'); close.className='notif__close';
    const bar=document.createElement('span'); bar.className='notif__bar';
    n.append(icon,msg,close,bar);
    c.appendChild(n);
    const cr=c.getBoundingClientRect(), nr=n.getBoundingClientRect();
    return {vw:window.innerWidth, container:Math.round(cr.width), card:Math.round(nr.width),
      height:Math.round(nr.height), lineH:Math.round(parseFloat(getComputedStyle(msg).lineHeight)),
      right:Math.round(nr.right),
      noOverflow:document.documentElement.scrollWidth<=window.innerWidth};
  },short);
  ok(w+'px: short toast fits on ONE line', m.height<=m.lineH+40, m.height+'px high, line-height '+m.lineH);
  ok(w+'px: toast is not wider than it needs', m.card<=m.container+1,
    'card='+m.card+' available='+m.container+' (short message)');
  ok(w+'px: no horizontal overflow', m.noOverflow);
  console.log('   '+w+'px -> card '+m.card+' of '+m.container+' available, height '+m.height);
}

// A long message must still wrap rather than run off the screen.
await p.setViewport({width:390,height:800});
await new Promise(r=>setTimeout(r,250));
const longM=await p.evaluate(()=>{
  const c=document.querySelector('.notif-container');
  c.innerHTML='';
  const n=document.createElement('div');
  n.className='notif notif--error';
  const msg=document.createElement('p');
  msg.className='notif__msg';
  msg.textContent='Several characters in your text have no Bijoy equivalent and were kept as Unicode — review them before submitting.';
  const bar=document.createElement('span'); bar.className='notif__bar';
  n.append(msg,bar); c.appendChild(n);
  const nr=n.getBoundingClientRect();
  return {card:Math.round(nr.width), right:Math.round(nr.right), vw:window.innerWidth,
    wrapped:Math.round(nr.height)>60,
    noOverflow:document.documentElement.scrollWidth<=window.innerWidth};});
ok('390px: a long message wraps instead of overflowing', longM.wrapped&&longM.noOverflow,
  'card='+longM.card+' right='+longM.right+' of '+longM.vw);

out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
await b.close();process.exit(f?1:0);})().catch(e=>{console.error('ERR',e.message);process.exit(2);});
