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

// measure every panel header that has actions
const probe=async(w)=>{
  await p.setViewport({width:w,height:1000});
  await new Promise(r=>setTimeout(r,300));
  return await p.evaluate(()=>{
    const heads=Array.from(document.querySelectorAll('.panel__header-actions'))
      .filter(a=>a.querySelector('.icon-btn'));
    return heads.map(a=>{
      const title=a.previousElementSibling;
      const ab=a.getBoundingClientRect();
      const tb=title?title.getBoundingClientRect():null;
      const btns=Array.from(a.querySelectorAll('.icon-btn'));
      // are all buttons on ONE row? compare each button's top
      const tops=btns.map(b=>Math.round(b.getBoundingClientRect().top));
      const oneRow=tops.every(t=>Math.abs(t-tops[0])<=2);
      // does the group overflow its header?
      const hdr=a.closest('.panel__header').getBoundingClientRect();
      return {title:title?title.textContent.trim():'?', n:btns.length,
        oneRow:oneRow, tops:tops,
        sameLineAsTitle: tb?Math.abs(ab.top-tb.top)<Math.max(tb.height,20):true,
        width:Math.round(ab.width),
        overflows: ab.right>hdr.right+1 || ab.left<hdr.left-1,
        right:Math.round(ab.right), hdrRight:Math.round(hdr.right)};
    });
  });
};

console.log('--- width  viewport --- panel headers checked ---');
for(const w of [1400,900,768,640,540,430,390,360,320]){
  const rows=await probe(w);
  const bad=rows.filter(r=>!r.oneRow||r.overflows);
  console.log(String(w).padEnd(7)+String(rows.length).padEnd(6)+
    'allOneRow='+rows.every(r=>r.oneRow)+'  offenders='+(bad.length?JSON.stringify(bad.map(x=>({t:x.title,n:x.n}))):'none'));
  ok(w+'px: every panel keeps its icons on ONE row, inside the header',
     bad.length===0, bad.map(x=>x.title+'('+x.n+')').join(',')||'clean');
  ok(w+'px: icons sit on the same line as the panel title',
     rows.every(r=>r.sameLineAsTitle));
}

// a visual crop of both panels on a phone
await p.setViewport({width:390,height:1000});
await new Promise(r=>setTimeout(r,400));
const boxes=await p.evaluate(()=>Array.from(document.querySelectorAll('.panel--input .panel__header, .panel--output .panel__header'))
  .map(h=>{const r=h.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
let y=boxes[0].y;
for(const bx of boxes){
  await p.screenshot({path:path.join(process.env.TEMP,'shots','panelhdr-'+Math.round(bx.y)+'.png'),
    clip:{x:Math.max(0,bx.x-2),y:Math.max(0,bx.y-2),width:bx.width+4,height:bx.height+4}});
}

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});