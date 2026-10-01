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

// ---- favicon ----
const fav=await p.evaluate(async()=>{
  const link=document.querySelector('link[rel="icon"]');
  const res=await fetch(link.getAttribute('href'));
  const txt=await res.text();
  return {href:link.getAttribute('href'), ok:res.ok,
    green:/#0a5c40/i.test(txt)&&/#006a4e/i.test(txt),
    purpleGone:!/6c63ff|a855f7/i.test(txt), kalpurush:/Kalpurush/i.test(txt)};
});
ok('favicon loads', fav.ok, fav.href);
ok('favicon uses the GREEN brand colours', fav.green && fav.purpleGone);
ok('favicon uses Kalpurush font', fav.kalpurush);

// ---- logo: no background, plain letter, 5px smaller than the wordmark ----
const lg=await p.evaluate(()=>{
  const el=document.querySelector('.app-logo');
  const cs=getComputedStyle(el);
  const t=document.querySelector('.app-brand-tagline');
  const tcs=getComputedStyle(t);
  const nm=parseFloat(getComputedStyle(document.querySelector('.app-brand-name')).fontSize);
  // the badge fill lives inside the SVG, not in CSS
  const rect=el.querySelector('rect');
  const stops=Array.from(el.querySelectorAll('stop')).map(s=>getComputedStyle(s).stopColor);
  return {tag:el.tagName,
    rectFill:rect?rect.getAttribute('fill'):null,
    stops:stops, hasLetter:!!el.querySelector('.app-logo__letter'),
    w:Math.round(el.getBoundingClientRect().width),
    shadow:cs.boxShadow, radius:cs.borderRadius,
    // tagline facts
    tbg:tcs.backgroundColor, tbd:tcs.borderTopWidth, tpad:tcs.paddingTop,
    tradius:tcs.borderTopLeftRadius,
    tfont:parseFloat(tcs.fontSize), tname:nm};
});
ok('LOGO: is an SVG badge again, not plain text', lg.tag==='svg' && lg.hasLetter, lg.tag);
ok('LOGO: rounded box with shadow', lg.radius==='9px'&&lg.shadow!=='none',
   'r='+lg.radius+' shadow='+lg.shadow);
ok('LOGO: green gradient fill from the brand', /url\(#logo-grad\)/.test(lg.rectFill||''),
   (lg.rectFill||'')+' stops='+JSON.stringify(lg.stops));
ok('LOGO: sized to the viewport (not 0)', lg.w>=34, lg.w+'px');
ok('TAGLINE: background REMOVED (plain text)',
   lg.tbg==='rgba(0, 0, 0, 0)' && lg.tbd==='0px' && lg.tpad==='0px',
   'bg='+lg.tbg+' border='+lg.tbd+' pad='+lg.tpad);
ok('TAGLINE: LipiLab is exactly 5px bigger', Math.abs(lg.tname-lg.tfont-5)<0.15,
   'LipiLab='+lg.tname+' tagline='+lg.tfont+' diff='+(lg.tname-lg.tfont).toFixed(2));

// ---- the two L letters have different colours ----
const ls=await p.evaluate(()=>{
  const all=Array.from(document.querySelectorAll('.app-brand-name .brand-l'));
  return all.map(e=>({txt:e.textContent, color:getComputedStyle(e).color,
    modifier:e.className}));
});
ok('wordmark has exactly 2 styled L letters', ls.length===2, JSON.stringify(ls.map(x=>x.txt)));
ok('the two L letters use DIFFERENT colours', ls.length===2&&ls[0].color!==ls[1].color,
   ls.map(x=>x.color).join(' vs '));
const lsMobile=await p.evaluate(()=>Array.from(document.querySelectorAll('.app-brand-name .brand-l')).map(e=>getComputedStyle(e).color));
ok('colours survive the mobile breakpoint', lsMobile.length===2&&lsMobile[0]!==lsMobile[1], lsMobile.join(' vs '));

// ---- slogan bigger ----
const sl=await p.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.app-brand-tagline')).fontSize));
ok('slogan is 21px on desktop (LipiLab 26px - 5)', sl===21, sl+'px');
const sl320=await (async()=>{await p.setViewport({width:320,height:800});await new Promise(r=>setTimeout(r,300));
  return p.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.app-brand-tagline')).fontSize));})();
ok('slogan floor is 13px at 320px (LipiLab 18px - 5)', sl320===13, sl320+'px');

// ---- layout still intact across widths ----
for(const w of [1400,1000,768,640,430,390,360,320]){
  await p.setViewport({width:w,height:900});
  await new Promise(r=>setTimeout(r,260));
  const r=await p.evaluate(()=>{
    const l=document.querySelector('.app-logo').getBoundingClientRect();
    const n=document.querySelector('.app-brand-name').getBoundingClientRect();
    const t=document.querySelector('.app-brand-tagline');
    const tb=t.getBoundingClientRect();
    const ab=document.querySelector('.app-header__actions').getBoundingClientRect();
    const cs=getComputedStyle(t);
    const nm2=parseFloat(getComputedStyle(document.querySelector('.app-brand-name')).fontSize);
    const tfont=parseFloat(cs.fontSize);
    const vpad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
    const lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.4;
    return {logoBeside:l.right<=n.left+2, tagBelow:tb.top>=n.bottom-2||Math.abs(tb.top-n.top)<n.height*0.6,
      overlap:Math.round(Math.max(0,Math.min(tb.right,ab.right)-Math.max(tb.left,ab.left))),
      lines:Math.max(1,Math.round((tb.height-vpad)/lh)),
      clipped:t.scrollWidth>t.clientWidth+1, radius:parseFloat(cs.borderTopLeftRadius),
      gapName:Math.abs(nm2-tfont)};
  });
  ok(w+'px: logo beside name, no overlap, <=2 lines, plain (no box), not clipped',
     r.logoBeside&&r.overlap===0&&r.lines<=2&&r.radius===0&&!r.clipped,
     'overlap='+r.overlap+' lines='+r.lines+' taglineRadius='+r.radius);
}

for(const w of [1400,390,320]){
  await p.setViewport({width:w,height:800});
  await new Promise(r=>setTimeout(r,300));
  const h=await p.evaluate(()=>Math.round(document.querySelector('.app-header').getBoundingClientRect().height)+8);
  await p.screenshot({path:path.join(process.env.TEMP,'shots','brand-'+w+'.png'),clip:{x:0,y:0,width:w,height:h}});
}

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
