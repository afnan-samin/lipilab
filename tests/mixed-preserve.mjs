import fs from 'fs';
import { createContext, runInContext } from 'vm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

function fakeEl() {
  return {
    addEventListener() {},
    style: { setProperty() {} },
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
    querySelector() { return fakeEl(); },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { height: 0, width: 0, left: 0, top: 0, right: 0, bottom: 0 }; },
    closest() { return fakeEl(); },
  };
}

const sandbox = createContext({
  console,
  window: { addEventListener() {}, requestAnimationFrame: function (fn) { return setTimeout(fn, 0); } },
  document: {
    readyState: 'loading',
    getElementById() { return fakeEl(); },
    querySelector() { return fakeEl(); },
    querySelectorAll() { return []; },
    documentElement: { style: { setProperty() {} } },
    addEventListener() {},
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { onLine: true },
  DOMParser,
  XMLSerializer,
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 },
});

let src = fs.readFileSync('/tmp/lipilab-live/engine.js', 'utf8') + '\n' + fs.readFileSync('/tmp/lipilab-live/app.js', 'utf8');
if (!src.includes('})();')) throw new Error('IIFE close missing');
src = src.replace(
  /\}\)\(\);\s*$/,
  [
    'try { window.ConvertToUnicode = ConvertToUnicode; } catch (e) {}',
    'try { window.ConvertToASCII = ConvertToASCII; } catch (e) {}',
    'try { window.convertBijoyTextMixed = convertBijoyTextMixed; } catch (e) {}',
    'try { window.convertUnicodeTextMixed = convertUnicodeTextMixed; } catch (e) {}',
    'try { window.patchDocumentXmlString = patchDocumentXmlString; } catch (e) {}',
    'try { window.appState = appState; } catch (e) {}',
    'try { window.FONTS = FONTS; } catch (e) {}',
    'try { window.ensureFontInFontTable = ensureFontInFontTable; } catch (e) {}',
  ].join('\n') + '\n})();'
);
runInContext(src, sandbox);

const W = sandbox.window;
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? ' | ' + detail : '')); }
}

check('convertBijoyTextMixed exported', typeof W.convertBijoyTextMixed === 'function');
check('convertUnicodeTextMixed exported', typeof W.convertUnicodeTextMixed === 'function');
check('ConvertToUnicode exported', typeof W.ConvertToUnicode === 'function');

const bijoyWord = 'wn‡iv‡WvUvm';
const uniWord = 'বিজ্ঞান';
const mixedB2U = uniWord + ' ' + bijoyWord;
const expectedBijoyAsUni = W.ConvertToUnicode(bijoyWord);
check(
  'engine would garble this Unicode if run as Bijoy',
  W.ConvertToUnicode(uniWord) !== uniWord,
  'ConvertToUnicode left ' + JSON.stringify(uniWord) + ' unchanged'
);

if (typeof W.convertBijoyTextMixed === 'function') {
  const out = W.convertBijoyTextMixed(mixedB2U);
  check(
    'b2u paste keeps existing Unicode',
    out.indexOf(uniWord) !== -1,
    'out=' + JSON.stringify(out)
  );
  check(
    'b2u paste converts Bijoy side',
    out.indexOf(expectedBijoyAsUni) !== -1,
    'out=' + JSON.stringify(out)
  );
  check(
    'b2u paste does not leave Bijoy bytes',
    out.indexOf(bijoyWord) === -1,
    'out=' + JSON.stringify(out)
  );
}

if (typeof W.convertUnicodeTextMixed === 'function') {
  const mixedU2B = uniWord + ' ' + bijoyWord;
  const out = W.convertUnicodeTextMixed(mixedU2B);
  const expectedUniAsBijoy = W.ConvertToASCII(uniWord);
  check(
    'u2b paste keeps existing Bijoy',
    out.indexOf(bijoyWord) !== -1,
    'out=' + JSON.stringify(out)
  );
  check(
    'u2b paste converts Unicode side',
    out.indexOf(expectedUniAsBijoy) !== -1,
    'out=' + JSON.stringify(out)
  );
  check(
    'u2b paste does not leave Unicode Bangla',
    out.indexOf(uniWord) === -1,
    'out=' + JSON.stringify(out)
  );
}

const NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const mixedXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ"/></w:rPr>
        <w:t>${uniWord} ${bijoyWord}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

if (typeof W.patchDocumentXmlString === 'function') {
  const result = W.patchDocumentXmlString(mixedXml, 'bijoy2uni', null, { converted: 0 });
  const out = result.xml || result;
  check(
    'b2u DOCX keeps existing Unicode',
    out.indexOf(uniWord) !== -1,
    'missing Unicode'
  );
  check(
    'b2u DOCX converts Bijoy side',
    out.indexOf(expectedBijoyAsUni) !== -1,
    'missing converted Bijoy'
  );
  check(
    'b2u DOCX does not leave Bijoy bytes',
    out.indexOf(bijoyWord) === -1,
    'still has Bijoy'
  );

  const u2bXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Kalpurush" w:hAnsi="Kalpurush"/></w:rPr>
        <w:t>${uniWord} ${bijoyWord}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const u2b = W.patchDocumentXmlString(u2bXml, 'uni2bijoy', null, { converted: 0 });
  const u2bout = u2b.xml || u2b;
  const expectedUniAsBijoy = W.ConvertToASCII(uniWord);
  check(
    'u2b DOCX keeps existing Bijoy',
    u2bout.indexOf(bijoyWord) !== -1,
    'Bijoy missing'
  );
  check(
    'u2b DOCX converts Unicode side',
    u2bout.indexOf(expectedUniAsBijoy) !== -1,
    'converted Unicode missing'
  );
  check(
    'u2b DOCX does not leave Unicode Bangla',
    u2bout.indexOf(uniWord) === -1,
    'Unicode still present'
  );

  // Already-Bijoy SutonnyMJ (no Unicode Bangla): Uni→Bijoy must not retag
  // ASCII Bijoy bytes as English. That is what garbled lecture 16.
  const alreadyBijoyXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="SutonnyMJ" w:eastAsia="SutonnyMJ"/></w:rPr>
        <w:t>${bijoyWord}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="SutonnyMJ"/></w:rPr>
        <w:t xml:space="preserve"> </w:t>
      </w:r>
      <w:r>
        <w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="Vrinda"/></w:rPr>
        <w:t>-</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const already = W.patchDocumentXmlString(alreadyBijoyXml, 'uni2bijoy', null, { converted: 0 });
  const alreadyOut = already.xml || already;
  const alreadyConverted = already.converted;
  check(
    'u2b already-Bijoy SutonnyMJ keeps original text',
    alreadyOut.replace(/<[^>]+>/g, '').indexOf(bijoyWord) !== -1,
    'text changed'
  );
  check(
    'u2b already-Bijoy SutonnyMJ keeps SutonnyMJ ascii font',
    /w:ascii="SutonnyMJ"/.test(alreadyOut),
    'SutonnyMJ ascii missing'
  );
  check(
    'u2b already-Bijoy does not stamp Times New Roman',
    alreadyOut.indexOf('Times New Roman') === -1,
    alreadyOut.slice(0, 400)
  );
  check(
    'u2b already-Bijoy restamp counts as converted',
    alreadyConverted > 0,
    'converted=' + alreadyConverted
  );
  check(
    'u2b already-Bijoy punctuation dash stays',
    alreadyOut.replace(/<[^>]+>/g, '').indexOf('-') !== -1,
    'dash missing'
  );
  check(
    'u2b already-Bijoy space run stays SutonnyMJ',
    alreadyOut.indexOf('Times New Roman') === -1 && /w:ascii="SutonnyMJ"/.test(alreadyOut),
    'space run retagged'
  );

  // Mixed Unicode + already-Bijoy in one SutonnyMJ run: convert Unicode only;
  // Bijoy bytes and the Bijoy face stay (do not retag ASCII as English).
  const mixedAlreadyXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ"/></w:rPr>
        <w:t>${uniWord} ${bijoyWord}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const mixedAlready = W.patchDocumentXmlString(mixedAlreadyXml, 'uni2bijoy', null, { converted: 0 });
  const mixedAlreadyOut = mixedAlready.xml || mixedAlready;
  check(
    'u2b mixed SutonnyMJ keeps existing Bijoy bytes',
    mixedAlreadyOut.indexOf(bijoyWord) !== -1,
    'Bijoy missing'
  );
  check(
    'u2b mixed SutonnyMJ converts Unicode side',
    mixedAlreadyOut.indexOf(expectedUniAsBijoy) !== -1,
    'converted Unicode missing'
  );
  check(
    'u2b mixed SutonnyMJ does not stamp Times New Roman',
    mixedAlreadyOut.indexOf('Times New Roman') === -1,
    mixedAlreadyOut.slice(0, 500)
  );

  // Vrinda is a Unicode face: Uni→Bijoy must convert its Bangla, not skip it.
  const vrindaUniXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Vrinda" w:hAnsi="Vrinda" w:cs="Vrinda"/></w:rPr>
        <w:t>${uniWord}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const vrinda = W.patchDocumentXmlString(vrindaUniXml, 'uni2bijoy', null, { converted: 0 });
  const vrindaOut = vrinda.xml || vrinda;
  check(
    'u2b Vrinda Unicode converts to Bijoy',
    vrindaOut.indexOf(expectedUniAsBijoy) !== -1,
    'converted missing'
  );
  check(
    'u2b Vrinda Unicode does not leave Bangla',
    vrindaOut.indexOf(uniWord) === -1,
    'Unicode still present'
  );
  check(
    'u2b Vrinda converted count > 0',
    vrinda.converted > 0,
    'converted=' + vrinda.converted
  );

  // Mixed SutonnyMJ (already Bijoy) + Vrinda Unicode in one doc.
  const mixedVrindaXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ"/></w:rPr>
        <w:t>${bijoyWord}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Vrinda" w:hAnsi="Vrinda" w:cs="Vrinda"/></w:rPr>
        <w:t>${uniWord}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const mixedV = W.patchDocumentXmlString(mixedVrindaXml, 'uni2bijoy', null, { converted: 0 });
  const mixedVOut = mixedV.xml || mixedV;
  check(
    'u2b mixed doc keeps already-Bijoy bytes',
    mixedVOut.indexOf(bijoyWord) !== -1,
    'Bijoy missing'
  );
  check(
    'u2b mixed doc converts Vrinda Unicode',
    mixedVOut.indexOf(expectedUniAsBijoy) !== -1,
    'Vrinda Unicode not converted'
  );

  // Picked Bijoy face (ArialKhanMJ) must restamp already-Bijoy SutonnyMJ runs
  // so Word actually uses the font the user selected.
  check(
    'FONTS.bijoy includes ArialKhanMJ',
    W.FONTS && W.FONTS.bijoy && W.FONTS.bijoy.indexOf('ArialKhanMJ') !== -1,
    W.FONTS ? JSON.stringify(W.FONTS.bijoy) : 'no FONTS'
  );
  if (W.appState) W.appState.banglaFont = 'ArialKhanMJ';
  if (W.appState) W.appState.outputEncoding = 'unicode-to-bijoy';
  const restampXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="SutonnyMJ" w:hint="cs"/>
          <w:cs/>
          <w:lang w:bidi="bn-IN"/>
        </w:rPr>
        <w:t>${bijoyWord}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const restamp = W.patchDocumentXmlString(restampXml, 'uni2bijoy', null, { converted: 0 });
  const restampOut = restamp.xml || restamp;
  check(
    'u2b restamp applies ArialKhanMJ',
    /w:ascii="ArialKhanMJ"/.test(restampOut) && /w:cs="ArialKhanMJ"/.test(restampOut),
    restampOut.slice(0, 500)
  );
  check(
    'u2b restamp keeps already-Bijoy text',
    restampOut.indexOf(bijoyWord) !== -1,
    'text changed'
  );
  check(
    'u2b restamp drops w:hint=cs so Word can change fonts',
    restampOut.indexOf('w:hint="cs"') === -1,
    'hint still present'
  );
  check(
    'u2b restamp drops empty w:cs lock',
    !/<w:cs\s*\/>/.test(restampOut) && !/<w:cs><\/w:cs>/.test(restampOut),
    'empty w:cs still present'
  );
}

check(
  'ensureFontInFontTable exported',
  typeof W.ensureFontInFontTable === 'function'
);
if (typeof W.ensureFontInFontTable === 'function') {
  const fontTableXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="${NS}">
  <w:font w:name="SutonnyMJ"><w:charset w:val="00"/></w:font>
</w:fonts>`;
  const withFont = W.ensureFontInFontTable(fontTableXml, 'ArialKhanMJ');
  check(
    'fontTable gains ArialKhanMJ',
    /w:name="ArialKhanMJ"/.test(withFont),
    withFont.slice(0, 400)
  );
  check(
    'fontTable keeps SutonnyMJ',
    /w:name="SutonnyMJ"/.test(withFont),
    'SutonnyMJ dropped'
  );
  const again = W.ensureFontInFontTable(withFont, 'ArialKhanMJ');
  check(
    'fontTable does not duplicate ArialKhanMJ',
    (again.match(/w:name="ArialKhanMJ"/g) || []).length === 1,
    'duplicates'
  );
}

const srcNow = fs.readFileSync('/tmp/lipilab-live/app.js', 'utf8');
const toastHits = srcNow.split('কোনো বাংলা টেক্সট শনাক্ত হয়নি — ফাইলের ফন্ট সমর্থিত কিনা যাচাই করুন').length - 1;
check('old Bangla zero-convert toast is gone', toastHits === 0, 'still has ' + toastHits);
const newToastHits = srcNow.split('No related text detected.').length - 1;
check('zero-convert toast is No related text detected.', newToastHits >= 2, 'hits=' + newToastHits);

console.log('mixed-preserve: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
