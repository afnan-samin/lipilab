import fs from 'fs';
import { createContext, runInContext } from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAP = 8 * 1024 * 1024;

function makeClassList() {
  const set = {};
  return {
    add(n) { set[n] = true; },
    remove(n) { delete set[n]; },
    contains(n) { return !!set[n]; },
    toggle(n, force) {
      const want = force === undefined ? !set[n] : !!force;
      if (want) set[n] = true; else delete set[n];
      return want;
    }
  };
}

function makeEl(id) {
  const el = {
    id: id || '',
    tagName: 'DIV',
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    disabled: false,
    files: [],
    children: [],
    handlers: {},
    attributes: {},
    dataset: {},
    classList: makeClassList(),
    style: { width: '', setProperty() {} },
    handlersFor(t) { return this.handlers[t] || []; },
    addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); },
    removeEventListener() {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    removeAttribute(k) { delete this.attributes[k]; },
    querySelector() { return makeEl('q'); },
    querySelectorAll() { return []; },
    appendChild(c) { this.children.push(c); return c; },
    closest() { return null; },
    focus() {},
    click() {
      this.handlersFor('click').forEach((fn) => fn({ preventDefault() {}, target: el }));
    },
    getBoundingClientRect() { return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 }; }
  };
  return el;
}

const byId = {};
function getById(id) {
  return byId[id] || (byId[id] = makeEl(id));
}

function FakeFileReader() {
  this.onload = null;
  FakeFileReader.reads.push(this);
}
FakeFileReader.reads = [];
FakeFileReader.prototype.readAsText = function (file) {
  this.readFile = file;
  const self = this;
  setTimeout(function () {
    if (self.onload) self.onload({ target: { result: 'LOADED:' + file.name } });
  }, 0);
};

const toasts = [];
const sandbox = createContext({
  console,
  window: {
    addEventListener() {},
    removeEventListener() {},
    requestAnimationFrame(fn) { return setTimeout(fn, 0); },
    matchMedia() { return { matches: false, addEventListener() {}, addListener() {}, removeEventListener() {} }; }
  },
  document: {
    readyState: 'complete',
    getElementById: getById,
    querySelector(sel) {
      if (sel && String(sel).indexOf('conversion-direction') > -1) {
        return { value: 'unicode-to-bijoy', nextElementSibling: makeEl('label') };
      }
      return makeEl('q');
    },
    querySelectorAll() { return []; },
    documentElement: { style: { setProperty() {} } },
    body: makeEl('body'),
    activeElement: makeEl('active'),
    addEventListener() {},
    createElement() { return makeEl('created'); },
    createElementNS() { return makeEl('created'); },
    hidden: false,
    visibilityState: 'visible'
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { onLine: true, userAgent: 'node', clipboard: null, serviceWorker: undefined },
  location: { href: 'http://localhost/', protocol: 'http:', hostname: 'localhost' },
  setTimeout,
  clearTimeout,
  requestAnimationFrame(fn) { return setTimeout(fn, 0); },
  cancelAnimationFrame() {},
  matchMedia() { return { matches: false, addEventListener() {}, addListener() {}, removeEventListener() {} }; },
  getComputedStyle() { return {}; },
  FileReader: FakeFileReader,
  JSZip: function () {},
  DOMParser: function () {},
  XMLSerializer: function () {},
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 }
});
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.navigator = sandbox.navigator;
sandbox.window.location = sandbox.location;
sandbox.window.matchMedia = sandbox.matchMedia;
sandbox.window.FileReader = FakeFileReader;
sandbox.self = sandbox;
sandbox.DOMParser.prototype = { parseFromString() { return { getElementsByTagName() { return []; } }; } };
sandbox.XMLSerializer.prototype = { serializeToString() { return ''; } };

let src = fs.readFileSync(path.join(root, 'engine.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!src.includes('})();')) throw new Error('IIFE close missing');
src = src.replace(
  /\}\)\(\);\s*$/,
  [
    'var __origToast = showToast;',
    'showToast = function (msg, kind) { window.__toasts.push(String(msg)); return __origToast.apply(this, arguments); };',
    'var __origLoadDocx = loadDocxFile;',
    'loadDocxFile = function (file) { window.__loadDocxCalls.push(file && file.name); };',
    'var __origSnap = snapshotForUndo;',
    'snapshotForUndo = function () { window.__snapCalls++; return __origSnap.apply(this, arguments); };',
    'try { window.ingestFile = ingestFile; } catch (e) {}',
    'try { window.appState = appState; } catch (e) {}',
    'try { window.els = els; } catch (e) {}',
    'try { window.MAX_PLAIN_UPLOAD_BYTES = MAX_PLAIN_UPLOAD_BYTES; } catch (e) {}'
  ].join('\n') + '\n})();'
);

const W = sandbox.window;
W.__toasts = toasts;
W.__loadDocxCalls = [];
W.__snapCalls = 0;
runInContext(src, sandbox);

const input = getById('input-textarea');
const output = getById('output-textarea');
const strip = getById('docx-strip');
const stripText = getById('docx-strip-text');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function fakeFile(name, size) {
  return { name: name, size: size };
}

input.value = 'KEEP-IN';
output.value = 'KEEP-OUT';
strip.textContent = 'KEEP-STRIP';
stripText.textContent = 'KEEP-STRIP';
strip.classList.remove('show');
W.__snapCalls = 0;
toasts.length = 0;
FakeFileReader.reads.length = 0;
W.__loadDocxCalls.length = 0;

W.ingestFile(fakeFile('huge.txt', CAP + 1));
await sleep(20);

check(
  'over-cap file shows a toast',
  toasts.length >= 1 && /too large|Too large|বড়|large/i.test(toasts.join(' | ')),
  'toasts=' + JSON.stringify(toasts)
);
check(
  'over-cap file does not start FileReader',
  FakeFileReader.reads.length === 0,
  'reads=' + FakeFileReader.reads.length
);
check(
  'over-cap file leaves input unchanged',
  input.value === 'KEEP-IN',
  'input="' + input.value + '"'
);
check(
  'over-cap file leaves output unchanged',
  output.value === 'KEEP-OUT',
  'output="' + output.value + '"'
);
check(
  'over-cap file does not snapshot undo',
  W.__snapCalls === 0,
  'snaps=' + W.__snapCalls
);
check(
  'over-cap file leaves docx strip unchanged',
  stripText.textContent === 'KEEP-STRIP' && !strip.classList.contains('show'),
  'strip="' + stripText.textContent + '" show=' + strip.classList.contains('show')
);

toasts.length = 0;
FakeFileReader.reads.length = 0;
W.ingestFile(fakeFile('small.txt', 12));
await sleep(20);
check(
  'small .txt still loads',
  input.value === 'LOADED:small.txt',
  'input="' + input.value + '"'
);

input.value = 'KEEP-IN';
toasts.length = 0;
FakeFileReader.reads.length = 0;
W.ingestFile(fakeFile('notes.md', 20));
await sleep(20);
check(
  'a .md still loads',
  input.value === 'LOADED:notes.md',
  'input="' + input.value + '"'
);

input.value = 'KEEP-IN';
toasts.length = 0;
FakeFileReader.reads.length = 0;
W.ingestFile(fakeFile('README', 20));
await sleep(20);
check(
  'a file with no extension still loads',
  input.value === 'LOADED:README',
  'input="' + input.value + '"'
);

input.value = 'KEEP-IN';
toasts.length = 0;
FakeFileReader.reads.length = 0;
W.__loadDocxCalls.length = 0;
W.ingestFile(fakeFile('book.docx', CAP + 50));
await sleep(20);
check(
  'a .docx still routes to loadDocxFile',
  W.__loadDocxCalls.length === 1 && W.__loadDocxCalls[0] === 'book.docx',
  'calls=' + JSON.stringify(W.__loadDocxCalls)
);
check(
  'a .docx does not use the plain-text FileReader',
  FakeFileReader.reads.length === 0,
  'reads=' + FakeFileReader.reads.length
);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
