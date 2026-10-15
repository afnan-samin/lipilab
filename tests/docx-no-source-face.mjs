// Regression: converting a real Word document must leave NO trace of the
// source script family.
//
//   Unicode -> Bijoy : the opened .docx must not reference a Unicode Bangla
//                      face (Vrinda / Kalpurush / ...) anywhere - not on the
//                      Bangla words, and not on the small letter-less runs
//                      (".", ".*", "?", "-") that Word tags with the same
//                      complex-script font. Spaces must survive word-for-word,
//                      and English must stay byte-identical.
//   Bijoy -> Unicode : the mirror - no SutonnyMJ/Bijoy face may remain.
//
// Fixture: tests/fixtures/unicode-problem.docx (a real report).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createContext, runInContext } from 'vm';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const JSZip = require('jszip');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else { failed++; console.log('FAIL  ' + name + (detail ? ' | ' + detail : '')); }
}

// --- load app.js + engine.js in a DOM-stubbed sandbox (same shape as
//     tests/mixed-preserve.mjs, so the DOCX pipeline runs unmodified). ---
function fakeEl() {
  return {
    addEventListener() {}, style: { setProperty() {} },
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
    querySelector() { return fakeEl(); }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { height: 0, width: 0, left: 0, top: 0, right: 0, bottom: 0 }; },
    closest() { return fakeEl(); },
  };
}
const sandbox = createContext({
  console,
  window: { addEventListener() {}, requestAnimationFrame(fn) { return setTimeout(fn, 0); } },
  document: {
    readyState: 'loading', getElementById() { return fakeEl(); },
    querySelector() { return fakeEl(); }, querySelectorAll() { return []; },
    documentElement: { style: { setProperty() {} } }, addEventListener() {},
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { onLine: true }, DOMParser, XMLSerializer,
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 },
});
let src = fs.readFileSync(path.join(root, 'engine.js'), 'utf8') + '\n' +
          fs.readFileSync(path.join(root, 'app.js'), 'utf8');
src = src.replace(/\}\)\(\);\s*$/, [
  'try { window.patchDocumentXmlString = patchDocumentXmlString; } catch (e) {}',
  'try { window.restampThemeBanglaFont = restampThemeBanglaFont; } catch (e) {}',
  'try { window.appState = appState; } catch (e) {}',
].join('\n') + '\n})();');
runInContext(src, sandbox);
const W = sandbox.window;
W.appState.banglaFont = 'SutonnyMJ';
W.appState.englishFont = 'Times New Roman';

const docxBuf = fs.readFileSync(path.join(here, 'fixtures', 'unicode-problem.docx'));
const zip = await JSZip.loadAsync(docxBuf);
const sourceXml = await zip.file('word/document.xml').async('string');

const strip = (x) => x.replace(/<[^>]+>/g, '');
const BN = /[\u0980-\u09FF]/;

function fontCounts(outXml) {
  const counts = {};
  for (const m of outXml.matchAll(/w:rFonts[^>]*>/g)) {
    for (const mm of m[0].matchAll(/w:(?:ascii|hAnsi|cs|eastAsia)="([^"]+)"/g)) {
      counts[mm[1]] = (counts[mm[1]] || 0) + 1;
    }
  }
  return counts;
}
const UNICODE_BANGLA = ['Vrinda', 'Kalpurush', 'Nikosh', 'Nirmala UI', 'SolaimanLipi', 'Shonar Bangla'];

// ===== Unicode -> Bijoy =====
const u2b = W.patchDocumentXmlString(sourceXml, 'uni2bijoy', null, { converted: 0 });
const u2bXml = u2b.xml || u2b;
const u2bText = strip(u2bXml);
const srcText = strip(sourceXml);

check('source has Unicode Bangla to convert', BN.test(srcText));
check('u2b converted runs > 0', u2b.converted > 0, 'converted=' + u2b.converted);

check('u2b leaves ZERO Unicode Bangla characters', !BN.test(u2bText),
  (u2bText.match(BN) || []).slice(0, 5).join(''));

const u2bFonts = fontCounts(u2bXml);
const leftoverFaces = UNICODE_BANGLA.filter((f) => u2bFonts[f]);
check('u2b leaves no Unicode Bangla FONT face at all', leftoverFaces.length === 0,
  'still present: ' + JSON.stringify(leftoverFaces) + ' counts=' + JSON.stringify(u2bFonts));

check('u2b stamps the picked Bijoy face', /SutonnyMJ/.test(u2bXml), JSON.stringify(u2bFonts));

const srcSpaces = (srcText.match(/ /g) || []).length;
const u2bSpaces = (u2bText.match(/ /g) || []).length;
check('u2b preserves every space', srcSpaces === u2bSpaces,
  'source=' + srcSpaces + ' output=' + u2bSpaces);

// English stays byte-identical (sample the question text and the bracket tags).
check('u2b keeps English question untouched',
  u2bText.indexOf('He stood first.') !== -1 &&
  u2bText.indexOf('[36th BCS]') !== -1 &&
  u2bText.indexOf('[JnU-B:24-25]') !== -1);

// ===== Bijoy -> Unicode (round trip on the file the tool just produced) =====
const b2u = W.patchDocumentXmlString(u2bXml, 'bijoy2uni', null, { converted: 0 });
const b2uXml = b2u.xml || b2u;
const b2uText = strip(b2uXml);
const b2uFonts = fontCounts(b2uXml);

check('b2u leaves no Bijoy FONT face behind', !/SutonnyMJ/.test(b2uXml),
  JSON.stringify(b2uFonts));
check('b2u leaves no TonnyBanglaMJ/ArialKhanMJ behind',
  !/TonnyBanglaMJ/.test(b2uXml) && !/ArialKhanMJ/.test(b2uXml));
check('b2u restores Unicode Bangla', BN.test(b2uText));
check('b2u preserves spaces', (b2uText.match(/ /g) || []).length === srcSpaces,
  'got ' + (b2uText.match(/ /g) || []).length);
check('b2u keeps English intact', b2uText.indexOf('[36th BCS]') !== -1 &&
  b2uText.indexOf('He stood first.') !== -1);

// ===== Theme Bengali fallback face =====
// A converted package must not keep the source script as its theme's Bengali
// fallback (theme1.xml -> <a:font script="Beng" typeface="Vrinda"/>).
check('restampThemeBanglaFont exported', typeof W.restampThemeBanglaFont === 'function');
const themeXml = '<a:majorFont><a:font script="Beng" typeface="Vrinda"/>'
  + '<a:font script="Gujr" typeface="Shruti"/></a:majorFont>';
const themedBijoy = W.restampThemeBanglaFont(themeXml, 'SutonnyMJ');
check('theme Bengali face -> Bijoy face', /script="Beng" typeface="SutonnyMJ"/.test(themedBijoy), themedBijoy);
check('theme leaves other scripts alone', /script="Gujr" typeface="Shruti"/.test(themedBijoy));
check('theme drops the Unicode face', !/Vrinda/.test(themedBijoy));
const themedUni = W.restampThemeBanglaFont(themeXml, 'Kalpurush');
check('theme Bengali face -> Unicode face', /script="Beng" typeface="Kalpurush"/.test(themedUni), themedUni);

if (failed) { console.log(failed + ' failed'); process.exit(1); }
console.log('all passed');
