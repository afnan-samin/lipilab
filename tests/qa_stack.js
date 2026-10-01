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
await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));

const probe=async(w)=>{
  await p.setViewport({width:w,height:900});
  await new Promise(r=>setTimeout(r,260));
  return await p.evaluate(()=>{
    const nm=document.querySelector('.app-brand-name').getBoundingClientRect();
    const tgEl=document.querySelector('.app-brand-tagline');
    const tg=tgEl.getBoundingClientRect();
    const lg=document.querySelector('.app-logo').getBoundingClientRect();
    const ab=document.querySelector('.app-header__actions').getBoundingClientRect();
    const cs=getComputedStyle(tgEl);
    const txt=tgEl.textContent.trim();
    // rendered line count: use the CONTENT box (height minus vertical padding),
    // otherwise the padding inflates height and a 1-line pill reads as 2 lines.
    const vpad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
    const contentH=tg.height-vpad;
    const lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.4;
    const lines=Math.max(1,Math.round(contentH/lh));
    // is the text visually complete (not clipped)?
    const full = cs.textOverflow!=='ellipsis' && cs.overflow!=='hidden';
    // the scrollWidth vs clientWidth tells us if content overflows
    const clipped = tgEl.scrollWidth>tgEl.clientWidth+1;
    return {vw:window.innerWidth,
      beside: lg.right<=nm.left+2 && Math.abs(tg.top-nm.top)<nm.height*0.6 && tg.left>=nm.right-2,
      below: tg.top>=nm.bottom-2,
      radius: parseFloat(cs.borderTopLeftRadius),
      borderW: parseFloat(cs.borderTopWidth)||0,
      font: cs.fontFamily, color: cs.color,
      size: parseFloat(cs.fontSize),
      lines: lines, lineH: Math.round(tg.height),
      overlap: Math.round(Math.max(0, Math.min(tg.right,ab.right)-Math.max(tg.left,ab.left))),
      clipped: clipped, full: full, text: txt,
      headerH: Math.round(document.querySelector('.app-header').getBoundingClientRect().height)};
  });
};

console.log('--- DESKTOP (must be ONE line, beside) ---');
for(const w of [1400,1200,1000,860,768,700,641]){
  const r=await probe(w);
  ok('DESKTOP '+w+'px: beside + single line + plain (no pill radius)',
     r.beside && !r.below && r.lines===1 && r.radius===0,
     'lines='+r.lines+' radius='+r.radius+' beside='+r.beside);
}
console.log('--- MOBILE (below, up to 2 lines, text NOT clipped) ---');
for(const w of [640,540,430,390,360,320]){
  const r=await probe(w);
  ok('MOBILE '+w+'px: tagline BELOW LipiLab', r.below && !r.beside, 'lines='+r.lines);
  ok('MOBILE '+w+'px: never more than 2 lines', r.lines<=2, 'lines='+r.lines);
  ok('MOBILE '+w+'px: full text visible, NOT clipped', !r.clipped, 'clipped='+r.clipped);
  ok('MOBILE '+w+'px: no overlap with buttons', r.overlap===0, 'overlap='+r.overlap);
  ok('MOBILE '+w+'px: plain tagline (0px radius, no border)', r.radius===0 && parseFloat(r.borderW)===0, r.radius+'px border='+r.borderW);
  console.log('   '+w+'px -> '+r.lines+' line(s), box '+r.lineH+'px, header '+r.headerH+'px');
}
const at641=await probe(641), at640=await probe(640);
ok('breakpoint: 641px beside/1-line, 640px below/2-line',
   at641.beside&&at641.lines===1 && at640.below&&at640.lines<=2,
   '641 lines='+at641.lines+' 640 lines='+at640.lines);

// the header must be tall enough to actually show both lines
ok('header grows to fit the 2 lines', at640.headerH>52, at640.headerH+'px');

for(const w of [1400,390,320]){
  await p.setViewport({width:w,height:800});
  await new Promise(r=>setTimeout(r,300));
  const clip=await p.evaluate(()=>({h:Math.round(document.querySelector('.app-header').getBoundingClientRect().height)+8}));
  await p.screenshot({path:path.join(process.env.TEMP,'shots',(w===1400?'side-':'two-')+w+'.png'),
    clip:{x:0,y:0,width:w,height:clip.h}});
}

console.log('--- DEBUG 390 / 320 ---');
for(const w of [390,320]){
  await p.setViewport({width:w,height:800});
  await new Promise(r=>setTimeout(r,300));
  const dbg=await p.evaluate(()=>{
    const h=document.querySelector('.app-header');
    const tg=document.querySelector('.app-brand-tagline');
    const nm=document.querySelector('.app-brand-name');
    const hcs=getComputedStyle(h), tcs=getComputedStyle(tg);
    const tb=tg.getBoundingClientRect(), nb=nm.getBoundingClientRect();
    return {headerDisplay:hcs.display, areas:hcs.gridTemplateAreas,
      cols:hcs.gridTemplateColumns, rowGap:hcs.rowGap,
      tagArea:tcs.gridArea, tagW:Math.round(tb.width), tagLeft:Math.round(tb.left),
      nameTop:Math.round(nb.top), tagTop:Math.round(tb.top),
      hdrH:Math.round(h.getBoundingClientRect().height),
      hdrPad:hcs.padding, whiteSpace:tcs.whiteSpace, fontSize:tcs.fontSize,
      text:tg.textContent.trim()};
  });
  console.log(w+'px:',JSON.stringify(dbg,null,1));
}

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});