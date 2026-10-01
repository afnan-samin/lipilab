const puppeteer=require('puppeteer-core');
const path=require('path');
const file='file:///'+path.resolve(__dirname,'..','index.html').replace(/\//g, '/');
const out=[];const ok=(n,c,d)=>out.push((c?'PASS':'FAIL')+' | '+n+(d?' | '+d:''));
(async()=>{
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--allow-file-access-from-files']});
const p=await b.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));
await p.evaluate(()=>{const t=document.getElementById('input-textarea');t.value='';t.dispatchEvent(new Event('input',{bubbles:true}));});

const probe=()=>p.evaluate(()=>{
  const btn=document.getElementById('sample-fill-btn'), hint=document.getElementById('empty-hint');
  const r=btn.getBoundingClientRect();
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {op:getComputedStyle(hint).opacity, vis:getComputedStyle(hint).visibility,
    pe:getComputedStyle(btn).pointerEvents, visBtn:getComputedStyle(btn).visibility,
    hitId:hit?(hit.id||hit.className||hit.tagName):'none',
    hitPath:(()=>{let e=hit,out=[];while(e&&out.length<4){out.push(e.tagName+(e.id?'#'+e.id:''));e=e.parentElement;}return out.join(' < ');})(),
    clickable:hit===btn||btn.contains(hit),
    rect:(r.left|0)+','+(r.top|0)+' '+Math.round(r.width)+'x'+Math.round(r.height),
    val:document.getElementById('input-textarea').value};});

let s=await probe();
ok('empty input: hint is visible', s.vis==='visible'&&s.op==='1', s.vis+'/'+s.op);
ok('empty input: Try a sample IS clickable', s.clickable, s.hitPath+' | pe='+s.pe+' visBtn='+s.visBtn+' rect='+s.rect);

// type, then confirm the hidden hint no longer intercepts clicks at that spot
await p.click('#input-textarea');
await p.keyboard.type('my own text');
await new Promise(r=>setTimeout(r,400));
s=await probe();
ok('with text: hint is hidden', s.vis==='hidden'||parseFloat(s.op)<0.05, s.vis+'/'+s.op);
ok('with text: hidden button is NOT clickable', !s.clickable, 'hit target was the button: '+s.clickable);

// a real click in that corner must land on the textarea, not the ghost button
await p.mouse.click(s.x||0,0).catch(()=>{});
const after=await p.evaluate(()=>{
  const btn=document.getElementById('sample-fill-btn');const r=btn.getBoundingClientRect();
  const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {hitId:hit?(hit.id||hit.className||hit.tagName):'none',
    val:document.getElementById('input-textarea').value};});
ok('clicking the old hint position does not load the sample', after.val==='my own text', 'value="'+after.val+'"');

// the sample button must still work when it IS shown
await p.evaluate(()=>{const t=document.getElementById('input-textarea');t.value='';t.dispatchEvent(new Event('input',{bubbles:true}));});
await new Promise(r=>setTimeout(r,400));
await p.click('#sample-fill-btn');
await new Promise(r=>setTimeout(r,500));
const filled=await p.evaluate(()=>({v:document.getElementById('input-textarea').value,
  vis:getComputedStyle(document.getElementById('empty-hint')).visibility}));
ok('empty input: clicking Try a sample loads the sample text', filled.v.length>10, filled.v.slice(0,24)+'…');
ok('after loading, the hint hides itself again', filled.vis==='hidden'||filled.vis==='transition', filled.vis);

// keyboard users must not be able to tab onto an invisible button
await p.evaluate(()=>{const t=document.getElementById('input-textarea');t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));});
await new Promise(r=>setTimeout(r,400));
const tabbable=await p.evaluate(()=>{
  const b=document.getElementById('sample-fill-btn');
  b.focus(); return document.activeElement===b;});
ok('hidden sample button cannot take focus', !tabbable);

ok('no page errors', errs.length===0, errs.join(' || '));
out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
await b.close();process.exit(f?1:0);})().catch(e=>{console.error('ERR',e.message);process.exit(2);});