const puppeteer=require('puppeteer-core');
const path=require('path');
const file='file:///'+path.resolve(__dirname,'..','index.html').replace(/\//g, '/');
const out=[];const ok=(n,c,d)=>out.push((c?'PASS':'FAIL')+' | '+n+(d?' | '+d:''));
(async()=>{
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--allow-file-access-from-files']});
const p=await b.newPage();
await p.setViewport({width:1400,height:1000});
await p.goto(file,{waitUntil:'networkidle0'});

// measure what a user would ACTUALLY see
const vis=await p.evaluate(()=>{
  const m=document.getElementById('download-modal');
  m.hidden=false;
  const ad=document.getElementById('spot-download');
  const ar=ad.getBoundingClientRect();
  const mr=m.querySelector('.dlg__card').getBoundingClientRect();
  const ask=document.getElementById('ask-overlay');
  const centre=document.elementFromPoint(mr.left+mr.width/2, mr.top+mr.height/2);
  const res={adW:Math.round(ar.width),adH:Math.round(ar.height),cardW:Math.round(mr.width),
    centreInDialog:!!(centre&&centre.closest('#download-modal')),
    centreIsAsk:!!(centre&&centre.closest('#ask-overlay')),
    askZ:getComputedStyle(ask).zIndex,dlgZ:getComputedStyle(m).zIndex,
    hdrZ:getComputedStyle(document.querySelector('.app-header')).zIndex};
  m.hidden=true;
  return res;
});
ok('ad slot has real size', vis.adW>200&&vis.adH>=100, 'ad='+vis.adW+'x'+vis.adH);
ok('centre of dialog is NOT the consent ask', vis.centreInDialog&&!vis.centreIsAsk, 'inDlg='+vis.centreInDialog+' ask='+vis.centreIsAsk);
ok('dialog z above ask z', parseInt(vis.dlgZ)>parseInt(vis.askZ), vis.dlgZ+' > '+vis.askZ);
ok('dialog z above header z', parseInt(vis.dlgZ)>parseInt(vis.hdrZ), vis.dlgZ+' > '+vis.hdrZ);

// now with the consent ask actually shown (first-visit state)
const vis2=await p.evaluate(()=>{
  const ask=document.getElementById('ask-overlay');
  ask.classList.add('ask-overlay--show');
  document.getElementById('download-open-btn').click();
  const m=document.getElementById('download-modal');
  const mr=m.querySelector('.dlg__card').getBoundingClientRect();
  const centre=document.elementFromPoint(mr.left+mr.width/2, mr.top+mr.height/2);
  const askVisible=getComputedStyle(ask).opacity;
  const res={centreInDialog:!!(centre&&centre.closest('#download-modal')),askVisible:askVisible,modalShown:!m.hidden};
  ask.classList.remove('ask-overlay--show');m.hidden=true;
  return res;
});
ok('download modal visible even when consent ask is up', vis2.centreInDialog&&vis2.modalShown, 'centreInDlg='+vis2.centreInDialog);
ok('consent ask hidden while dialog open', parseFloat(vis2.askVisible)<0.05, 'opacity='+vis2.askVisible);

// screenshots for the record
await p.evaluate(()=>{document.getElementById('ask-overlay').classList.remove('ask-overlay--show');
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';
  document.getElementById('output-textarea').value='আজ মঙ্গলবার';
  document.getElementById('download-open-btn').click();});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:path.join(process.env.TEMP,'shots','dl-modal.png')});
await p.evaluate(()=>{document.getElementById('confirm-modal').hidden=false;});
await new Promise(r=>setTimeout(r,300));
await p.screenshot({path:path.join(process.env.TEMP,'shots','confirm-modal.png')});
out.forEach(l=>console.log(l));
console.log('\nRESULT pass='+out.filter(l=>l.startsWith('PASS')).length+' fail='+out.filter(l=>l.startsWith('FAIL')).length);
await p.evaluate(()=>{
  document.getElementById('ask-overlay').classList.remove('ask-overlay--show');
  document.getElementById('confirm-modal').hidden=true;
  document.getElementById('input-textarea').value='আজ মঙ্গলবার';
  document.getElementById('output-textarea').value='আজ মঙ্গলবার';
  document.getElementById('download-open-btn').click();
});
await new Promise(r=>setTimeout(r,400));
await p.screenshot({path:path.join(process.env.TEMP,'shots','dl-modal.png')});
await p.evaluate(()=>{document.getElementById('download-modal').hidden=true;document.getElementById('input-textarea').value='আজ মঙ্গলবার';document.getElementById('clear-btn').click();});
await new Promise(r=>setTimeout(r,300));
await p.screenshot({path:path.join(process.env.TEMP,'shots','confirm-modal.png')});
console.log('shots written');
await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
