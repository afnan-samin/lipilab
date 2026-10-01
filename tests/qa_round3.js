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

// ---- 1. never more than 3 notifications at once ----
const cap=await p.evaluate(()=>{
  const fire=(m)=>{document.getElementById('clear-btn').click();document.getElementById('copy-btn').click();};
  let peak=0;
  for(let i=0;i<5;i++){
    fire();
    peak=Math.max(peak,document.querySelectorAll('.notif').length);
  }
  return {peak:peak, final:document.querySelectorAll('.notif').length,
    msgs:Array.from(document.querySelectorAll('.notif__msg')).map(m=>m.textContent)};
});
ok('never exceeds 3 notifications', cap.peak<=3, 'peak='+cap.peak);
ok('stays at 3 after 10 rapid triggers', cap.final===3, 'final='+cap.final);

// flood again with a pause so cards animate in fully, then re-check the cap
const cap2=await p.evaluate(async()=>{
  let peak=0;
  for(let i=0;i<6;i++){
    document.getElementById('copy-btn').click();
    await new Promise(r=>setTimeout(r,60));
    peak=Math.max(peak,document.querySelectorAll('.notif').length);
  }
  return {peak:peak, n:document.querySelectorAll('.notif').length};
});
ok('cap holds with animation timing', cap2.peak<=3, JSON.stringify(cap2));

// ---- 2. notification still behaves like the old toast (auto close + X) ----
const behave=await p.evaluate(()=>{
  const n=document.querySelector('.notif');
  return {hasBar:!!n.querySelector('.notif__bar'), hasClose:!!n.querySelector('.notif__close'),
    hasIcon:!!n.querySelector('.notif__icon'), msg:!!n.querySelector('.notif__msg').textContent};
});
ok('card has icon + message + bar + X', behave.hasBar&&behave.hasClose&&behave.hasIcon, JSON.stringify(behave));

// ---- 3. download modal: backdrop click must NOT close it ----
const bd=await p.evaluate(()=>{
  document.getElementById('output-textarea').value='আজ মঙ্গলবার';
  document.getElementById('download-open-btn').click();
  return !document.getElementById('download-modal').hidden;
});
ok('download modal opens', bd);
await p.evaluate(()=>document.querySelector('#download-modal .dlg__backdrop').click());
await new Promise(r=>setTimeout(r,200));
const stillOpen=await p.evaluate(()=>!document.getElementById('download-modal').hidden);
ok('backdrop click does NOT close download modal', stillOpen);
// click far outside the card too
await p.mouse.click(20,500);
await new Promise(r=>setTimeout(r,200));
ok('click outside card does NOT close it', await p.evaluate(()=>!document.getElementById('download-modal').hidden));
// but the X still closes it
await p.evaluate(()=>document.getElementById('download-close-btn').click());
await new Promise(r=>setTimeout(r,200));
ok('X button still closes it', await p.evaluate(()=>document.getElementById('download-modal').hidden));
// Escape still closes it
await p.evaluate(()=>{document.getElementById('download-open-btn').click();});
await new Promise(r=>setTimeout(r,150));
await p.keyboard.press('Escape');
await new Promise(r=>setTimeout(r,200));
ok('Escape still closes it', await p.evaluate(()=>document.getElementById('download-modal').hidden));

// ---- 4. shortcuts modal header matches the download dialog header ----
const sh=await p.evaluate(()=>{
  document.getElementById('shortcuts-open-btn').click();
  const a=getComputedStyle(document.querySelector('#shortcuts-panel .shortcuts-panel__header'));
  const r=document.querySelector('#shortcuts-panel .shortcuts-panel__header').getBoundingClientRect();
  return {bg:a.backgroundColor, h:Math.round(r.height), w:Math.round(r.width)};
});
const dl=await p.evaluate(()=>{
  document.getElementById('shortcuts-close-btn').click();
  document.getElementById('download-open-btn').click();
  const a=getComputedStyle(document.querySelector('#download-modal .dlg__header'));
  return {bg:a.backgroundColor};
});
ok('shortcuts header bg === download header bg', sh.bg===dl.bg, 'shortcuts='+sh.bg+' download='+dl.bg);
ok('shortcuts header has real height (band is visible)', sh.h>40, 'h='+sh.h);
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:path.join(process.env.TEMP,'shots','dl-modal.png')});

await p.evaluate(()=>{document.getElementById('download-modal').hidden=true;document.body.classList.remove('dlg-open');
  document.getElementById('shortcuts-open-btn').click();});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:path.join(process.env.TEMP,'shots','shortcuts-modal.png'),clip:{x:400,y:250,width:600,height:420}});

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});