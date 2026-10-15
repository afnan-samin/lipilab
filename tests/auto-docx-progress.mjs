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
    'try { window.detectAutoDirection = detectAutoDirection; } catch (e) {}',
    'try { window.detectDocxHintFromXml = detectDocxHintFromXml; } catch (e) {}',
    'try { window.DOCX_RUN_BATCH = DOCX_RUN_BATCH; } catch (e) {}',
    'try { window.patchDocumentXmlString = patchDocumentXmlString; } catch (e) {}',
    'try { window.patchDocumentXmlInBatches = patchDocumentXmlInBatches; } catch (e) {}',
  ].join('\n') + '\n})();'
);
runInContext(src, sandbox);

const W = sandbox.window;
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? ' | ' + detail : '')); }
}

check('detectAutoDirection exported', typeof W.detectAutoDirection === 'function');
check('detectDocxHintFromXml exported', typeof W.detectDocxHintFromXml === 'function');
check('DOCX_RUN_BATCH is 10000', W.DOCX_RUN_BATCH === 10000, 'got ' + W.DOCX_RUN_BATCH);

if (typeof W.detectAutoDirection === 'function' && typeof W.detectDocxHintFromXml === 'function') {
  const unicodePreview = 'Subject: Chemistry\nঅধ্যায় ২';
  check(
    'plain auto: Unicode Bangla → unicode-to-bijoy',
    W.detectAutoDirection(unicodePreview, null) === 'unicode-to-bijoy',
    W.detectAutoDirection(unicodePreview, null)
  );
  check(
    'plain auto: Bijoy ASCII only → bijoy-to-unicode',
    W.detectAutoDirection('K. wn‡iv‡WvUvm', null) === 'bijoy-to-unicode',
    W.detectAutoDirection('K. wn‡iv‡WvUvm', null)
  );

  const bijoyXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:rPr><w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="Nirmala UI"/></w:rPr><w:t>Avgvi</w:t></w:r></w:p></w:body>
</w:document>`;
  const uniXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:rPr><w:rFonts w:ascii="Kalpurush" w:hAnsi="Kalpurush"/></w:rPr><w:t>আমার</w:t></w:r></w:p></w:body>
</w:document>`;

  const bijoyHint = W.detectDocxHintFromXml(bijoyXml);
  const uniHint = W.detectDocxHintFromXml(uniXml);
  check('SutonnyMJ DOCX hint is bijoy-to-unicode', bijoyHint === 'bijoy-to-unicode', bijoyHint);
  check('Kalpurush DOCX hint is unicode-to-bijoy', uniHint === 'unicode-to-bijoy', uniHint);
  check(
    'auto prefers DOCX Bijoy hint over Unicode preview',
    W.detectAutoDirection(unicodePreview, bijoyHint) === 'bijoy-to-unicode',
    W.detectAutoDirection(unicodePreview, bijoyHint)
  );
}

check('patchDocumentXmlInBatches exported', typeof W.patchDocumentXmlInBatches === 'function');
if (typeof W.patchDocumentXmlInBatches === 'function') {
  const tiny = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:rPr><w:rFonts w:ascii="SutonnyMJ"/></w:rPr><w:t>Avgvi</w:t></w:r></w:p></w:body>
</w:document>`;
  const batched = W.patchDocumentXmlInBatches(tiny, 'bijoy2uni', null, function () {});
  check(
    'small DOCX batch patch is thenable',
    batched && typeof batched.then === 'function',
    'got ' + (batched && batched.constructor && batched.constructor.name)
  );
}

console.log('auto-docx-progress: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
