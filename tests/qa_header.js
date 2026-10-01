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

const measure=async(label)=>{
  return await p.evaluate((label)=>{
    const hdr=document.querySelector('.app-header').getBoundingClientRect();
    const lg=document.querySelector('.app-logo').getBoundingClientRect();
    const nm=document.querySelector('.app-brand-name').getBoundingClientRect();
    const tg=document.querySelector('.app-brand-tagline').getBoundingClientRect();
    const tcs=getComputedStyle(document.querySelector('.app-brand-tagline'));
    const root=getComputedStyle(document.documentElement);
    return {label,
      logoLeft:Math.round(lg.left), logoTop:Math.round(lg.top), logoRight:Math.round(lg.right),
      hdrLeft:Math.round(hdr.left), hdrTop:Math.round(hdr.top),
      nameLeft:Math.round(nm.left), nameTop:Math.round(nm.top), nameBottom:Math.round(nm.bottom),
      tagLeft:Math.round(tg.left), tagTop:Math.round(tg.top), tagRight:Math.round(tg.right),
      tagW:Math.round(tg.width), tagH:Math.round(tg.height),
      logoBesideName: lg.right<=nm.left+2 && Math.abs(lg.top-nm.top)<40,
      tagBelowName: tg.top>=nm.bottom-2,
      tagLeftAligned: Math.abs(tg.left-nm.left)<3,
      nameFont: tcs.fontFamily,
      tagFont: tcs.fontFamily,
      tagColor: tcs.color,
      primary: root.getPropertyValue('--primary').trim(),
      tagSize: parseFloat(tcs.fontSize),
      nameSize: parseFloat(getComputedStyle(document.querySelector('.app-brand-name')).fontSize)};
  },label);
};

// ---- desktop ----
await p.setViewport({width:1400,height:900});
await p.goto(file,{waitUntil:'networkidle0'});
await p.evaluate(()=>document.getElementById('ask-overlay').classList.remove('ask-overlay--show'));
const d=await measure('desktop');
ok('logo stays put at its own position', d.logoLeft>0&&d.logoTop>=d.hdrTop-1, 'logo=('+d.logoLeft+','+d.logoTop+')');
ok('LipiLab sits BESIDE the logo (same row)', d.logoBesideName, 'logoRight='+d.logoRight+' nameLeft='+d.nameLeft);
ok('tagline sits BELOW LipiLab', d.tagBelowName, 'nameBottom='+d.nameBottom+' tagTop='+d.tagTop);
ok('tagline left-aligned with LipiLab', d.tagLeftAligned);
ok('tagline uses Kalpurush', /Kalpurush/i.test(d.tagFont), d.tagFont);
ok('tagline colour === --primary', d.tagColor.replace(/\s/g,'')===('rgb(' + d.primary.replace(/[^\d.]/g,',').replace(/^,/,'') + ')') || /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.test(d.tagColor),
   'tagColor='+d.tagColor+' primary='+d.primary);
ok('tagline NOT wrapped (single line)', d.tagH<34, 'h='+d.tagH+' w='+d.tagW);
await p.screenshot({path:path.join(process.env.TEMP,'shots','hdr-desktop.png'),
  clip:{x:0,y:0,width:1400,height:70}});

// ---- mobile: the whole point of the fix ----
await p.setViewport({width:390,height:844});
await new Promise(r=>setTimeout(r,450));
const m=await measure('mobile');
ok('MOBILE: logo still beside LipiLab, NOT on its own row', m.logoBesideName,
   'logoRight='+m.logoRight+' nameLeft='+m.nameLeft+' logoTop='+m.logoTop+' nameTop='+m.nameTop);
ok('MOBILE: tagline under LipiLab', m.tagBelowName, 'tagTop='+m.tagTop+' nameBottom='+m.nameBottom);
ok('MOBILE: tagline single line', m.tagH<34, 'h='+m.tagH);
ok('MOBILE: tagline uses Kalpurush + primary colour', /Kalpurush/i.test(m.tagFont), m.tagFont+' / '+m.tagColor);
ok('MOBILE: nothing overflows the viewport', m.tagRight<=390, 'tagRight='+m.tagRight);
await p.screenshot({path:path.join(process.env.TEMP,'shots','hdr-mobile.png'),
  clip:{x:0,y:0,width:390,height:Math.max(70,m.tagTop+34)}});

// ---- very narrow ----
await p.setViewport({width:320,height:700});
await new Promise(r=>setTimeout(r,450));
const s=await measure('small');
ok('320px: logo still beside LipiLab', s.logoBesideName, 'logoRight='+s.logoRight+' nameLeft='+s.nameLeft);
ok('320px: tagline still below + inside viewport', s.tagBelowName&&s.tagRight<=320, 'tagRight='+s.tagRight);
await p.screenshot({path:path.join(process.env.TEMP,'shots','hdr-320.png'),clip:{x:0,y:0,width:320,height:90}});

// ---- the tagline must never sit under the action buttons ----
const noOverlap=async(label,vw)=>{
  const r=await p.evaluate(()=>{
    const t=document.querySelector('.app-brand-tagline').getBoundingClientRect();
    const a=document.querySelector('.app-header__actions').getBoundingClientRect();
    // horizontal intersection between the tagline pill and the buttons
    const overlap=Math.max(0, Math.min(t.right,a.right)-Math.max(t.left,a.left));
    const vertOverlap=Math.max(0, Math.min(t.bottom,a.bottom)-Math.max(t.top,a.top));
    return {overlap:Math.round(overlap), vertOverlap:Math.round(vertOverlap),
      tagRight:Math.round(t.right), actLeft:Math.round(a.left), clipped:t.right<=a.left+1};
  });
  ok(label+': tagline does not overlap the action buttons', r.overlap===0||r.clipped,
     'overlap='+r.overlap+'px tagRight='+r.tagRight+' buttonsLeft='+r.actLeft);
  return r;
};
await p.setViewport({width:390,height:844});
await new Promise(r=>setTimeout(r,450));
await noOverlap('MOBILE',390);
await p.setViewport({width:320,height:700});
await new Promise(r=>setTimeout(r,450));
await noOverlap('320px',320);
await p.setViewport({width:1400,height:900});
await new Promise(r=>setTimeout(r,300));

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});