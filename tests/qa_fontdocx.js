// Drives the REAL font functions straight out of app.js (no browser needed):
// slices the FONTS catalog + token split, then checks each token's font.
const fs=require('fs');
const src=fs.readFileSync('../app.js','utf8');
function sliceFn(name){
  const start=src.indexOf('function '+name+'(');
  if(start<0) throw new Error('missing '+name);
  let i=src.indexOf('{',start),depth=0;
  for(;i<src.length;i++){const c=src[i];
    if(c==='{')depth++; else if(c==='}'){depth--; if(depth===0) return src.slice(start,i+1);}}
  throw new Error('unclosed '+name);
}
// catalog block: from `var FONTS` up to the end of applyOutputPreviewFont
const catStart=src.indexOf('var FONTS =');
const catEnd=src.indexOf('function applyOutputPreviewFont');
const catalog=src.slice(catStart,catEnd);
const parts=[catalog,
  'var appState={outputEncoding:"bijoy-to-unicode",banglaFont:null,englishFont:null};',
  'var els={banglaFontSelect:null,englishFontSelect:null,outputTextarea:{style:{}}};',
  sliceFn('banglaListForEncoding'),sliceFn('defaultBanglaFont'),sliceFn('defaultEnglishFont'),
  sliceFn('resolveFontName'),sliceFn('currentOutputEncoding'),sliceFn('getSelectedBanglaFont'),
  sliceFn('getSelectedEnglishFont'),sliceFn('fontForPlainToken'),
  sliceFn('tokenizeMixedText'),
  'module.exports={FONTS,appState,getSelectedBanglaFont,getSelectedEnglishFont,fontForPlainToken,tokenizeMixedText,banglaListForEncoding,defaultBanglaFont,defaultEnglishFont,resolveFontName};'
].join('\n');
fs.writeFileSync(__dirname+'/fontengine.js',parts);
const E=require('./fontengine.js');
const out=[];const ok=(n,c,d)=>out.push((c?'PASS':'FAIL')+' | '+n+(d?' | '+d:''));

ok('catalog exposes bijoy/unicode/english lists',
  E.FONTS.bijoy.length&&E.FONTS.unicode.length&&E.FONTS.english.length,
  'bijoy='+E.FONTS.bijoy.join('/')+' unicode='+E.FONTS.unicode.join('/'));
ok('Unicode list puts Kalpurush first',
  E.FONTS.unicode[0]==='Kalpurush', E.FONTS.unicode.join('/'));
ok('Unicode list keeps Nirmala UI last as a fallback',
  E.FONTS.unicode[E.FONTS.unicode.length-1]==='Nirmala UI');
ok('Bijoy default is SutonnyMJ', E.defaultBanglaFont('unicode-to-bijoy')==='SutonnyMJ', E.defaultBanglaFont('unicode-to-bijoy'));
ok('English default is Times New Roman', E.defaultEnglishFont()==='Times New Roman', E.defaultEnglishFont());

// Bangla list follows OUTPUT encoding
ok('Unicode output -> Unicode font list', E.banglaListForEncoding('bijoy-to-unicode').indexOf('Kalpurush')>-1);
ok('Bijoy output -> Bijoy font list', E.banglaListForEncoding('unicode-to-bijoy').join(',')==='SutonnyMJ,TonnyBanglaMJ');

// unknown name falls back
ok('unknown Bangla name falls back to default',
  E.getSelectedBanglaFont()===E.defaultBanglaFont('bijoy-to-unicode'));
E.appState.banglaFont='Not A Real Font';
ok('unknown stored Bangla name still resolves', E.getSelectedBanglaFont()==='Kalpurush', E.getSelectedBanglaFont());

// English pick is honoured
E.appState.englishFont='Calibri';
ok('English pick honoured', E.getSelectedEnglishFont()==='Calibri', E.getSelectedEnglishFont());
E.appState.englishFont='Not A Real Font';
ok('unknown English name falls back to default', E.getSelectedEnglishFont()==='Times New Roman', E.getSelectedEnglishFont());
E.appState.englishFont='Calibri';

// token-level font split — this is exactly what buildBlankDocxBlob writes
E.appState.outputEncoding='unicode-to-bijoy';
E.appState.banglaFont='SutonnyMJ';
const toks=E.tokenizeMixedText('Hello আমি test');
const fonts=toks.map(t=>({type:t.type,effectiveType:t.effectiveType,font:E.fontForPlainToken(t,'unicode-to-bijoy')}));
fonts.forEach(f=>console.log('   token '+f.type+' -> '+f.font));
const bangla=fonts.filter(f=>f.type==='bangla');
const latin=fonts.filter(f=>f.type==='latin');
ok('converted Bangla tokens carry the Bangla pick',
  bangla.length>0&&bangla.every(f=>f.font==='SutonnyMJ'), bangla.map(f=>f.font).join(','));
ok('Latin tokens carry the English pick',
  latin.length>0&&latin.every(f=>f.font==='Calibri'), latin.map(f=>f.font).join(','));

// no Bangla token may ever get an English font and vice versa
ok('no Bangla token fell back to the English font', bangla.every(f=>f.font!=='Calibri'));
ok('no Latin token fell back to the Bangla font', latin.every(f=>f.font!=='SutonnyMJ'));

// Bijoy output: the split is English-only by design (spec item 9)
E.appState.outputEncoding='bijoy-to-unicode';
const bt=E.tokenizeMixedText('Hello আমি test').map(t=>E.fontForPlainToken(t,'bijoy-to-unicode'));
ok('Bijoy output leaves the whole run on the English pick',
  bt.every(f=>f==='Calibri'), bt.join(','));

out.forEach(l=>console.log(l));
const f=out.filter(l=>l.startsWith('FAIL')).length;
console.log('RESULT pass='+(out.length-f)+' fail='+f);
process.exit(f?1:0);