import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createContext, runInContext } from 'vm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const JSZip = require('jszip');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HEADER_BN = 'হেডারবাংলা';
const SECRET_BN = 'গোপনলেখা';
const BODY_BN = 'বডিবাংলা';
const HEADER_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header';

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
    setAttribute() {},
    getAttribute() { return null; }
  };
}

const sandbox = createContext({
  console,
  window: { addEventListener() {}, requestAnimationFrame(fn) { return setTimeout(fn, 0); } },
  document: {
    readyState: 'loading',
    getElementById() { return fakeEl(); },
    querySelector(sel) {
      if (sel && String(sel).indexOf('conversion-direction') > -1) {
        return { value: 'unicode-to-bijoy', nextElementSibling: fakeEl() };
      }
      return fakeEl();
    },
    querySelectorAll() { return []; },
    documentElement: { style: { setProperty() {} } },
    addEventListener() {}
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { onLine: true },
  DOMParser,
  XMLSerializer,
  JSZip,
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 }
});
sandbox.window.document = sandbox.document;
sandbox.window.JSZip = JSZip;

let src = fs.readFileSync(path.join(root, 'engine.js'), 'utf8') + '\n' +
          fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!src.includes('})();')) throw new Error('IIFE close missing');
src = src.replace(/\}\)\(\);\s*$/, [
  'try { window.findHeaderFooterParts = findHeaderFooterParts; } catch (e) {}',
  'try { window.patchDocxParts = patchDocxParts; } catch (e) {}',
  'try { window.patchDocumentXmlString = patchDocumentXmlString; } catch (e) {}',
  'try { window.appState = appState; } catch (e) {}'
].join('\n') + '\n})();');
runInContext(src, sandbox);
const W = sandbox.window;
W.appState.banglaFont = 'SutonnyMJ';
W.appState.englishFont = 'Times New Roman';

function wxml(text) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body><w:p><w:r><w:rPr><w:rFonts w:ascii="Kalpurush" w:hAnsi="Kalpurush" w:cs="Kalpurush"/></w:rPr>' +
    '<w:t>' + text + '</w:t></w:r></w:p></w:body></w:document>';
}

function headerXml(text) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:p><w:r><w:rPr><w:rFonts w:ascii="Kalpurush" w:hAnsi="Kalpurush" w:cs="Kalpurush"/></w:rPr>' +
    '<w:t>' + text + '</w:t></w:r></w:p></w:hdr>';
}

function relsXml(target) {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="' + HEADER_TYPE + '" Target="' + target + '"/>' +
    '</Relationships>';
}

async function makeZip(target) {
  const zip = new JSZip();
  zip.file('word/document.xml', wxml(BODY_BN));
  zip.file('word/header1.xml', headerXml(HEADER_BN));
  zip.file('word/_rels/document.xml.rels', relsXml(target));
  zip.file('secret.xml', headerXml(SECRET_BN));
  return zip;
}

function strip(xml) {
  return String(xml || '').replace(/<[^>]+>/g, '');
}

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

async function runCase(label, target, expectHeaderConverted, expectSecretUntouched) {
  const zip = await makeZip(target);
  const parts = await W.findHeaderFooterParts(zip);
  const blob = await zip.generateAsync({ type: 'nodebuffer' });
  W.appState.docxFile = blob;
  W.appState.docxZip = zip;
  const r = await W.patchDocxParts();
  const headerOut = await r.zip.file('word/header1.xml').async('string');
  const secretOut = await r.zip.file('secret.xml').async('string');
  const headerText = strip(headerOut);
  const secretText = strip(secretOut);
  const headerConverted = headerText.indexOf(HEADER_BN) === -1 && /[^\u0980-\u09FF]/.test(headerText) && headerText.length > 0;
  const secretStill = secretText.indexOf(SECRET_BN) > -1;

  check(
    label + ' findHeaderFooterParts ' + (expectHeaderConverted ? 'includes header' : 'skips header'),
    expectHeaderConverted ? parts.indexOf('word/header1.xml') > -1 : parts.indexOf('word/header1.xml') === -1,
    'parts=' + JSON.stringify(parts)
  );
  check(
    label + ' secret.xml is never a part',
    parts.indexOf('secret.xml') === -1 && parts.every((p) => p.indexOf('secret') === -1),
    'parts=' + JSON.stringify(parts)
  );
  check(
    label + ' header text ' + (expectHeaderConverted ? 'is converted' : 'is unchanged'),
    expectHeaderConverted ? headerConverted : headerText.indexOf(HEADER_BN) > -1,
    'header="' + headerText + '"'
  );
  if (expectSecretUntouched) {
    check(label + ' secret.xml is not converted', secretStill, 'secret="' + secretText + '"');
  }
}

await runCase('(a) Target=header1.xml', 'header1.xml', true, true);
await runCase('(b) Target=/word/header1.xml', '/word/header1.xml', true, true);
await runCase('(c) Target=./header1.xml', './header1.xml', true, true);
await runCase('(d) Target=../secret.xml', '../secret.xml', false, true);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
