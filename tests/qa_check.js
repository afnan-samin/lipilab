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

ok('confirm-modal gone from DOM', await p.evaluate(()=>!document.getElementById('confirm-modal')));
const grp=await p.evaluate(()=>{
  const g=document.querySelector('.download-group');
  const b=document.getElementById('download-open-btn');
  const gs=getComputedStyle(g);
  return {gw:Math.round(g.getBoundingClientRect().width), bw:Math.round(b.getBoundingClientRect().width),
    bg:gs.backgroundColor, bd:gs.borderTopWidth};
});
ok('download-group same width as button (no stray chip)', Math.abs(grp.gw-grp.bw)<=1, 'group='+grp.gw+' btn='+grp.bw);
ok('download-group has no background/border', grp.bg==='rgba(0, 0, 0, 0)'&&parseFloat(grp.bd)===0, grp.bg+' bd='+grp.bd);

const ta=await p.evaluate(()=>{
  const c=getComputedStyle(document.getElementById('input-textarea'));
  return {tl:c.borderTopLeftRadius,tr:c.borderTopRightRadius,br:c.borderBottomRightRadius};
});
ok('textarea top-left and top-right radius = 0', parseFloat(ta.tl)===0&&parseFloat(ta.tr)===0, 'tl='+ta.tl+' tr='+ta.tr+' br='+ta.br);

const res=await p.evaluate(()=>{
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';
  document.getElementById('clear-btn').click();
  return {val:document.getElementById('input-textarea').value,
    popup:!!document.querySelector('.dlg:not([hidden])')};
});
ok('clear works immediately, NO popup', res.val===''&&!res.popup, 'val="'+res.val+'" popup='+res.popup);
const undone=await p.evaluate(()=>{
  const u=document.getElementById('undo-btn');
  if(u) u.click();
  return document.getElementById('input-textarea').value;
});
ok('undo restores cleared text', undone.length>0, 'val="'+undone+'"');

await p.evaluate(()=>{
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';
  document.getElementById('output-textarea').value='আজ মঙ্গলবার';
  document.getElementById('download-open-btn').click();
});
await new Promise(r=>setTimeout(r,500));
const ad=await p.evaluate(()=>{
  const a=document.getElementById('spot-download');
  const r=a.getBoundingClientRect();
  const c=a.querySelector('.demo-ad');
  const cr=c?c.getBoundingClientRect():{width:0,height:0};
  return {h:Math.round(r.height),cw:Math.round(cr.width),ch:Math.round(cr.height),
    text:c?c.textContent.replace(/\s+/g,' ').trim():''};
});
ok('demo ad visible at 300x100', ad.h===100&&ad.cw>200&&ad.ch===100, JSON.stringify(ad));
ok('demo ad has real content', ad.text.includes('LipiLab'), ad.text);
await p.screenshot({path:path.join(process.env.TEMP,'shots','dl-modal.png')});

const box=await p.evaluate(()=>{
  document.getElementById('download-modal').hidden=true;
  const r=document.querySelector('.panel--output .panel__header-actions').getBoundingClientRect();
  return {x:r.x,y:r.y,w:r.width,h:r.height};
});
await p.screenshot({path:path.join(process.env.TEMP,'shots','out-actions.png'),
  clip:{x:Math.max(0,box.x-12),y:Math.max(0,box.y-12),width:box.w+24,height:box.h+24}});

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));

// focused visual shots of the textarea top corners and clear flow
await p.evaluate(()=>{
  const b=document.getElementById('input-textarea').getBoundingClientRect();
  return b;
});
const tb=await p.evaluate(()=>{const r=document.getElementById('input-textarea').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:80};});
await p.screenshot({path:path.join(process.env.TEMP,'shots','ta-corners.png'),
  clip:{x:Math.max(0,tb.x-6),y:Math.max(0,tb.y-30),width:tb.w+12,height:tb.h+36}});
const cb=await p.evaluate(()=>{
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';
  document.getElementById('input-textarea').dispatchEvent(new Event('input',{bubbles:true}));
  const r=document.getElementById('clear-btn').getBoundingClientRect();
  return {x:r.x,y:r.y,w:r.width,h:r.height};
});
await p.screenshot({path:path.join(process.env.TEMP,'shots','clear-btn.png'),
  clip:{x:Math.max(0,cb.x-150),y:Math.max(0,cb.y-14),width:cb.w+300,height:cb.h+28}});

out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});