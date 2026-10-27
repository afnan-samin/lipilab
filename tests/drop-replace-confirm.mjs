import fs from 'fs';
import { createContext, runInContext } from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
    hidden: true,
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

const dropTarget = makeEl('panel-input');

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
      if (sel === '.panel--input') return dropTarget;
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
    'try { window.handleDroppedFile = handleDroppedFile; } catch (e) {}',
    'try { window.openConfirm = openConfirm; } catch (e) {}',
    'try { window.ingestFile = ingestFile; } catch (e) {}',
    'try { window.els = els; } catch (e) {}',
    'try { window.appState = appState; } catch (e) {}'
  ].join('\n') + '\n})();'
);

runInContext(src, sandbox);
const W = sandbox.window;

const input = getById('input-textarea');
const output = getById('output-textarea');
const strip = getById('docx-strip');
const modal = getById('confirm-modal');
const okBtn = getById('confirm-ok-btn');
const cancelBtn = getById('confirm-cancel-btn');

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

function drop(file) {
  const ev = {
    preventDefault() {},
    dataTransfer: { files: [file] }
  };
  const handlers = dropTarget.handlersFor('drop');
  if (handlers.length) handlers.forEach((fn) => fn(ev));
  else W.handleDroppedFile(file);
}

check('handleDroppedFile exported', typeof W.handleDroppedFile === 'function');
check('openConfirm exported', typeof W.openConfirm === 'function');
check('drop handler wired on input panel', dropTarget.handlersFor('drop').length > 0, 'handlers=' + dropTarget.handlersFor('drop').length);

function resetEmpty() {
  input.value = '';
  output.value = '';
  strip.classList.remove('show');
  if (W.appState) {
    W.appState.docxZip = null;
    W.appState.docxFile = null;
  }
  modal.hidden = true;
  FakeFileReader.reads.length = 0;
}

resetEmpty();
input.value = 'existing text';
drop(fakeFile('notes.txt', 12));
await sleep(20);

check('non-empty drop opens confirm modal', modal.hidden === false, 'hidden=' + modal.hidden);
check('non-empty drop leaves input unchanged', input.value === 'existing text', 'value="' + input.value + '"');
check('non-empty drop does not start FileReader', FakeFileReader.reads.length === 0, 'reads=' + FakeFileReader.reads.length);

cancelBtn.handlersFor('click').forEach((fn) => fn({ preventDefault() {} }));
await sleep(20);

check('Cancel closes the modal', modal.hidden === true, 'hidden=' + modal.hidden);
check('Cancel keeps the input text', input.value === 'existing text', 'value="' + input.value + '"');
check('Cancel does not ingest the file', FakeFileReader.reads.length === 0 && input.value === 'existing text', 'reads=' + FakeFileReader.reads.length);

drop(fakeFile('notes.txt', 12));
check('drop again reopens confirm', modal.hidden === false, 'hidden=' + modal.hidden);
okBtn.handlersFor('click').forEach((fn) => fn({ preventDefault() {} }));
await sleep(20);

check('OK closes the modal', modal.hidden === true, 'hidden=' + modal.hidden);
check('OK ingests the file', input.value === 'LOADED:notes.txt', 'value="' + input.value + '"');

resetEmpty();
drop(fakeFile('empty.txt', 8));
await sleep(20);

check('empty drop does not open modal', modal.hidden === true, 'hidden=' + modal.hidden);
check('empty drop ingests directly', input.value === 'LOADED:empty.txt', 'value="' + input.value + '"');

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('drop-replace-confirm: all passed');
