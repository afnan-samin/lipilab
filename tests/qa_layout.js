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

// ---- 1. shortcuts: description LEFT, keys RIGHT ----
await p.evaluate(()=>document.getElementById('shortcuts-open-btn').click());
await new Promise(r=>setTimeout(r,350));
const sc=await p.evaluate(()=>{
  const rows=Array.from(document.querySelectorAll('#shortcuts-panel .shortcuts-list__item'));
  const L=[],R=[];
  rows.forEach(r=>{
    const d=r.querySelector('.shortcuts-list__desc').getBoundingClientRect();
    const k=r.querySelector('.shortcuts-list__keys').getBoundingClientRect();
    L.push(Math.round(d.left)); R.push(Math.round(k.right));
  });
  const first=rows[0];
  const fr=first.getBoundingClientRect();
  const fd=first.querySelector('.shortcuts-list__desc').getBoundingClientRect();
  const fk=first.querySelector('.shortcuts-list__keys').getBoundingClientRect();
  return {rows:rows.length,
    descLefts:Array.from(new Set(L)), keyRights:Array.from(new Set(R)),
    sameRow:Math.abs(fd.top-fk.top)<6, descBeforeKeysInDom:!!(first.querySelector('.shortcuts-list__desc')),
    gap:Math.round(fk.left-fd.right), h:Math.round(fr.height)};
});
ok('9 rows present', sc.rows===9, 'rows='+sc.rows);
ok('descriptions all start at same LEFT edge', sc.descLefts.length===1, JSON.stringify(sc.descLefts));
ok('key groups all end at same RIGHT edge', sc.keyRights.length===1, JSON.stringify(sc.keyRights));
ok('desc is on the left, keys on the right, same row', sc.sameRow && sc.gap>0, 'gap='+sc.gap+'px sameRow='+sc.sameRow);
const cs=await p.screenshot({path:path.join(process.env.TEMP,'shots','shortcuts-modal.png'),
  clip:await p.evaluate(()=>{const r=document.querySelector('#shortcuts-panel .shortcuts-panel__content').getBoundingClientRect();
    return {x:Math.max(0,r.x-8),y:Math.max(0,r.y-8),width:Math.round(r.width)+16,height:Math.round(r.height)+16};})});
await p.evaluate(()=>document.getElementById('shortcuts-close-btn').click());

// ---- 2. desktop header: tagline pill sits NEXT TO LipiLab, one row ----
const hd=await p.evaluate(()=>{
  const n=document.querySelector('.app-brand-name').getBoundingClientRect();
  const t=document.querySelector('.app-brand-tagline').getBoundingClientRect();
  const cs=getComputedStyle(document.querySelector('.app-brand-tagline'));
  return {sameRow:Math.abs(n.top-t.top)<n.height*0.6, tagRight:Math.round(t.right), nameRight:Math.round(n.right),
    gap:Math.round(t.left-n.right), visible:t.width>0, bg:cs.backgroundColor, bd:cs.borderTopWidth};
});
ok('tagline is beside LipiLab (not below) on desktop', hd.sameRow && hd.gap>0, 'gap='+hd.gap+'px');
ok('tagline has a light background + border', hd.visible && hd.bg!=='rgba(0, 0, 0, 0)', 'bg='+hd.bg+' bd='+hd.bd);

// ---- 3. mobile header: tagline BELOW the name, single line ----
await p.setViewport({width:390,height:844});
await new Promise(r=>setTimeout(r,400));
const mob=await p.evaluate(()=>{
  const n=document.querySelector('.app-brand-name').getBoundingClientRect();
  const t=document.querySelector('.app-brand-tagline').getBoundingClientRect();
  const cs=getComputedStyle(document.querySelector('.app-brand-tagline'));
  return {below:t.top>=n.bottom-2, gap:Math.round(t.top-n.bottom), visible:t.width>0&&t.height>0,
    oneLine:t.height<34, leftAligned:Math.abs(t.left-n.left)<3, bg:cs.backgroundColor};
});
ok('tagline is visible on mobile (was display:none)', mob.visible);
ok('tagline sits BELOW LipiLab on mobile', mob.below && mob.gap>=0, 'gap='+mob.gap+'px');
ok('tagline stays on a single line', mob.oneLine);
ok('tagline left-aligned with the wordmark', mob.leftAligned);
const hb=await p.evaluate(()=>{const r=document.querySelector('.app-header').getBoundingClientRect();return {x:0,y:0,width:390,height:Math.round(r.height)+6};});
await p.screenshot({path:path.join(process.env.TEMP,'shots','header-mobile.png'),clip:hb});

// ---- 4. mobile shortcuts still readable ----
await p.evaluate(()=>document.getElementById('shortcuts-open-btn').click());
await new Promise(r=>setTimeout(r,400));
const msc=await p.evaluate(()=>{
  const rows=Array.from(document.querySelectorAll('#shortcuts-panel .shortcuts-list__item'));
  const stacked=rows.every(r=>{
    const d=r.querySelector('.shortcuts-list__desc').getBoundingClientRect();
    const k=r.querySelector('.shortcuts-list__keys').getBoundingClientRect();
    return k.top>=d.bottom-1;
  });
  const gaps=rows.map(r=>Math.round(r.querySelector('.shortcuts-list__keys').getBoundingClientRect().top-r.querySelector('.shortcuts-list__desc').getBoundingClientRect().bottom));
  return {stacked:stacked, minGap:Math.min.apply(null,gaps), rows:rows.length};
});
ok('mobile shortcuts stack in two lines', msc.stacked, 'rows='+msc.rows);
ok('minimum gap between the two lines', msc.minGap>=4, 'minGap='+msc.minGap+'px');
await p.screenshot({path:path.join(process.env.TEMP,'shots','shortcuts-mobile.png')});

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});