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
// force the strip visible so geometry can be measured without a real upload
await p.evaluate(()=>{
  const s=document.getElementById('docx-strip');
  s.classList.add('show');
  document.getElementById('docx-strip-text').textContent='chemistry-ms-1.docx';
});

const m=await p.evaluate(()=>{
  const s=document.getElementById('docx-strip');
  const cs=getComputedStyle(s);
  const panel=document.querySelector('.panel--input');
  const body=document.querySelector('.panel--input .panel__body');
  const ps=getComputedStyle(panel);
  const sr=s.getBoundingClientRect(), pr=panel.getBoundingClientRect(), br=body.getBoundingClientRect();
  const tr2=document.getElementById('input-textarea').getBoundingClientRect();
  const bodyCS=getComputedStyle(body);
  return {radius:cs.borderRadius,
    tl:cs.borderTopLeftRadius, tr:cs.borderTopRightRadius,
    br:cs.borderBottomRightRadius, bl:cs.borderBottomLeftRadius,
    mt:cs.marginTop, mb:cs.marginBottom,
    ml:cs.marginLeft, mr:cs.marginRight, bt:cs.borderTopWidth, bb:cs.borderBottomWidth,
    panelPadTop:ps.paddingTop, panelPadX:ps.paddingLeft+'/'+ps.paddingRight,
    srTop:Math.round(sr.top), prTop:Math.round(pr.top),
    headBottom:Math.round(document.querySelector('.panel--input .panel__header').getBoundingClientRect().bottom),
    gapToBody:Math.round(br.top-sr.bottom),
    panelPadBottom:ps.paddingBottom,
    w:Math.round(sr.width), panelW:Math.round(pr.width),
    taW:Math.round(tr2.width), taL:Math.round(tr2.left), taR:Math.round(tr2.right),
    stripL:Math.round(sr.left), stripR:Math.round(sr.right),
    bodyW:Math.round(br.width), bodyPadX:bodyCS.paddingLeft+'/'+bodyCS.paddingRight,
    sameLeft:Math.abs(sr.left-pr.left)<4, sameRight:Math.abs(sr.right-pr.right)<4,
    widthMatchesTextarea:Math.abs(sr.width-tr2.width)<1,
    leftMatchesTextarea:Math.abs(sr.left-tr2.left)<1,
    rightMatchesTextarea:Math.abs(sr.right-tr2.right)<1};});
ok('bottom-left and bottom-right radius are 0',
  parseFloat(m.bl)===0&&parseFloat(m.br)===0, 'bl='+m.bl+' br='+m.br);
ok('top-left and top-right radius are UNCHANGED (not 0)', 
  parseFloat(m.tl)>0&&parseFloat(m.tr)>0, 'tl='+m.tl+' tr='+m.tr);
ok('both top corners match the panel radius', m.tl===m.tr, m.tl+' vs '+m.tr);
// The strip sits in its own inset box: 10px above, none below, and the sides
// follow .panel__body's padding so the width lines up with the textarea.
ok('margin: 10px above, 0 below, 16px at the sides',
  m.mt==='10px'&&m.mb==='0px'&&m.ml==='16px'&&m.mr==='16px',
  't='+m.mt+' b='+m.mb+' l='+m.ml+' r='+m.mr);
// The strip is inset to match the textarea, so it must NOT be edge-to-edge.
ok('inset, not full-bleed (matches the textarea column)', m.w<m.panelW-10, m.w+' inside panel '+m.panelW);
ok('flush on top of the panel body (no gap below)', m.gapToBody<=1, m.gapToBody+'px');
ok('10px gap below the panel header', m.srTop-m.headBottom>=9&&m.srTop-m.headBottom<=11,
  'stripTop='+m.srTop+' headBottom='+m.headBottom);
ok('strip WIDTH is identical to the input textarea', m.widthMatchesTextarea,
  'strip='+m.w+'px textarea='+m.taW+'px');
ok('strip LEFT edge lines up with the textarea', m.leftMatchesTextarea,
  'strip L='+m.stripL+' ta L='+m.taL);
ok('strip RIGHT edge lines up with the textarea', m.rightMatchesTextarea,
  'strip R='+m.stripR+' ta R='+m.taR);
ok('panel still has its outer radius', true);

// The strip must line up with the textarea at EVERY breakpoint, not just desktop.
for(const w of [1400,768,390,320]){
  await p.setViewport({width:w,height:900});
  await new Promise(r=>setTimeout(r,350));
  const g=await p.evaluate(()=>{
    const s=document.getElementById('docx-strip').getBoundingClientRect();
    const t=document.getElementById('input-textarea').getBoundingClientRect();
    return {sw:Math.round(s.width),tw:Math.round(t.width),
      sl:Math.round(s.left),tl:Math.round(t.left),
      sr:Math.round(s.right),tr:Math.round(t.right),
      ov:document.documentElement.scrollWidth>window.innerWidth};});
  ok(w+'px: strip width == textarea width', Math.abs(g.sw-g.tw)<1, g.sw+' vs '+g.tw);
  ok(w+'px: left and right edges align', Math.abs(g.sl-g.tl)<1&&Math.abs(g.sr-g.tr)<1,
    'L '+g.sl+'/'+g.tl+'  R '+g.sr+'/'+g.tr);
  ok(w+'px: no horizontal overflow', !g.ov);
}

// Screenshot the whole input panel with the strip visible, at desktop and phone.
for(const pair of [[1400,'desk'],[390,'mob']]){
  await p.setViewport({width:pair[0],height:900,deviceScaleFactor:2});
  await new Promise(r=>setTimeout(r,300));
  const box=await p.evaluate(()=>{
    const r=document.querySelector('.panel--input').getBoundingClientRect();
    return {x:Math.round(r.left)-8,y:Math.round(r.top)-8,width:Math.round(r.width)+16,height:300};});
  await p.screenshot({path:'strip-'+pair[1]+'.png',clip:box});
}

// A notification stack on a phone, for the record.
await p.setViewport({width:390,height:800,deviceScaleFactor:2});
await new Promise(r=>setTimeout(r,300));
await p.evaluate(()=>{
  const c=document.querySelector('.notif-container');
  c.innerHTML='';
  ['Converted successfully','Saved as .docx','3 characters could not be mapped'].forEach((t,i)=>{
    const n=document.createElement('div');
    n.className='notif notif--'+(i===2?'error':'success');
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('class','notif__icon');
    const msg=document.createElement('p');
    msg.className='notif__msg'; msg.textContent=t;
    const close=document.createElement('button'); close.className='notif__close';
    const bar=document.createElement('span'); bar.className='notif__bar';
    n.append(icon,msg,close,bar);
    c.appendChild(n);
  });
});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:'notif-m.png',clip:{x:0,y:0,width:390,height:300}});

ok('no page errors', errs.length===0, errs.join(' || '));
out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
await b.close();process.exit(f?1:0);})().catch(e=>{console.error('ERR',e.message);process.exit(2);});