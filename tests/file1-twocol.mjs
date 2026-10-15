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
  window: { addEventListener() {} },
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
  'window.patchDocumentXmlString = patchDocumentXmlString;\nwindow.ConvertToUnicode = ConvertToUnicode;\n})();'
);
runInContext(src, sandbox);

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
}

const NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${NS}">
  <w:body>
    <w:p>
      <w:pPr>
        <w:tabs>
          <w:tab w:val="left" w:pos="2520"/>
          <w:tab w:val="right" w:pos="5220"/>
        </w:tabs>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="Nirmala UI"/>
        </w:rPr>
        <w:tab/>
        <w:t>K. wn‡iv‡WvUvm</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="SutonnyMJ" w:hAnsi="SutonnyMJ" w:cs="Nirmala UI"/>
        </w:rPr>
        <w:tab/>
        <w:t xml:space="preserve">L. Kjnb </w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

const ConvertToUnicode = sandbox.window.ConvertToUnicode;
const patchDocumentXmlString = sandbox.window.patchDocumentXmlString;
assert(typeof ConvertToUnicode === 'function', 'ConvertToUnicode exported');
assert(typeof patchDocumentXmlString === 'function', 'patchDocumentXmlString exported');

const expectedK = ConvertToUnicode('wn‡iv‡WvUvm');
const expectedL = ConvertToUnicode('Kjnb');
assert(expectedK && expectedK !== 'wn‡iv‡WvUvm', 'engine converts option K body');
assert(expectedL && expectedL !== 'Kjnb', 'engine converts option L body');

const result = patchDocumentXmlString(xml, 'bijoy2uni', null, { converted: 0 });
const out = result.xml || result;
const convertedCount = result.converted;

let pass = 0;
let fail = 0;
function check(name, cond, detail) {
  if (cond) {
    pass++;
    console.log('  PASS  ' + name);
  } else {
    fail++;
    console.log('  FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

check('converts at least one tab+text run', convertedCount >= 1, 'converted=' + convertedCount);
check('option K body became Unicode', out.includes(expectedK), 'missing ' + JSON.stringify(expectedK));
check('option L ASCII-Bijoy body became Unicode', out.includes(expectedL), 'missing ' + JSON.stringify(expectedL));
check('did not leave option K Bijoy body', !out.includes('wn‡iv‡WvUvm'), 'still has Bijoy');
check('did not leave option L Bijoy body', !out.includes('Kjnb'), 'still has Bijoy');
check('keeps both column tabs', (out.match(/<w:tab\b/g) || []).length >= 2, 'tabs=' + (out.match(/<w:tab\b/g) || []).length);
check('option letters converted as Bijoy', out.includes('ক.') && out.includes('খ.'), 'ক./খ. missing');

console.log('file1-twocol: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
