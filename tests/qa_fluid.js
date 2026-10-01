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

// measure the fluid values across a sweep of widths
const widths=[1600,1400,1200,1000,860,768,640,540,430,390,360,320];
const rows=[];
for(const w of widths){
  await p.setViewport({width:w,height:900});
  await new Promise(r=>setTimeout(r,180));
  const m=await p.evaluate(()=>{
    const nm=document.querySelector('.app-brand-name');
    const tg=document.querySelector('.app-brand-tagline');
    const lg=document.querySelector('.app-logo');
    const ncs=getComputedStyle(nm), tcs=getComputedStyle(tg);
    const nb=nm.getBoundingClientRect(), tb=tg.getBoundingClientRect();
    const lb=lg.getBoundingClientRect(), ab=document.querySelector('.app-header__actions').getBoundingClientRect();
    const overlap=Math.max(0, Math.min(tb.right,ab.right)-Math.max(tb.left,ab.left));
    return {name:parseFloat(ncs.fontSize), tag:parseFloat(tcs.fontSize),
      logoW:Math.round(lb.width), gap:Math.round(nb.left-lb.right),
      tagH:Math.round(tb.height), tagBelow:tb.top>=nb.bottom-2,
      logoBeside:lb.right<=nb.left+2, overlap:Math.round(overlap),
      vw:window.innerWidth, nameFont:ncs.fontFamily.indexOf('Sora')>=0,
      tagFont:tcs.fontFamily.indexOf('Kalpurush')>=0};
  });
  rows.push(m);
}
console.log('vw    name  slogan logo gap tagH below beside overlap');
rows.forEach(r=>console.log(
  String(r.vw).padEnd(6)+String(r.name.toFixed(1)).padEnd(6)+
  String(r.tag.toFixed(1)).padEnd(7)+String(r.logoW).padEnd(5)+
  String(r.gap).padEnd(4)+String(r.tagH).padEnd(5)+
  String(r.tagBelow).padEnd(6)+String(r.logoBeside).padEnd(7)+r.overlap));

// monotonic: smaller viewport must never give a BIGGER font
let monotonic=true, viol=[];
for(let i=1;i<rows.length;i++){
  if(rows[i].name>rows[i-1].name+0.05||rows[i].tag>rows[i-1].tag+0.05){
    monotonic=false; viol.push(rows[i-1].vw+'->'+rows[i].vw);
  }
}
ok('font shrinks monotonically as viewport narrows', monotonic, viol.length?viol.join(','):'clean');
ok('LipiLab is 22px on a wide desktop', Math.abs(rows[0].name-22)<0.2, rows[0].name+'px @'+rows[0].vw);
ok('LipiLab shrinks to <=19px at 390px', rows.find(r=>r.vw===390).name<=19,
   rows.find(r=>r.vw===390).name+'px');
ok('LipiLab hits the 16px floor at 320px', Math.abs(rows.find(r=>r.vw===320).name-16)<0.2,
   rows.find(r=>r.vw===320).name+'px');
ok('slogan shrinks too (13px -> ~9.7px)', rows[0].tag>rows[rows.length-1].tag+2,
   rows[0].tag+'px -> '+rows[rows.length-1].tag+'px');
ok('logo is fluid (36px -> 30px floor) and never flex-shrunk',
   rows[0].logoW===36 && rows[rows.length-1].logoW===30,
   rows[0].logoW+'px -> '+rows[rows.length-1].logoW+'px');

// layout integrity at every width
ok('logo always beside LipiLab', rows.every(r=>r.logoBeside));
ok('slogan always below LipiLab', rows.every(r=>r.tagBelow));
ok('slogan never overlaps the buttons', rows.every(r=>r.overlap===0),
   rows.filter(r=>r.overlap>0).map(r=>r.vw+':'+r.overlap).join(',')||'all clear');
ok('slogan stays a single line everywhere', rows.every(r=>r.tagH<34), 'max='+Math.max.apply(null,rows.map(r=>r.tagH)));
ok('fonts are Sora / Kalpurush throughout', rows.every(r=>r.nameFont&&r.tagFont));

// screenshots at three sizes
for(const w of [390,360,320]){
  await p.setViewport({width:w,height:800});
  await new Promise(r=>setTimeout(r,300));
  const h=await p.evaluate(()=>Math.round(document.querySelector('.app-header').getBoundingClientRect().height)+8);
  await p.screenshot({path:path.join(process.env.TEMP,'shots','fluid-'+w+'.png'),clip:{x:0,y:0,width:w,height:h}});
}

ok('no JS errors', errs.length===0);
if(errs.length) out.push('ERRORS: '+errs.join(' || '));
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});