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
    hidden: false,
    disabled: false,
    checked: false,
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
    hidden: false
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
  DOMParser: function () {},
  XMLSerializer: function () {},
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 }
});
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.navigator = sandbox.navigator;
sandbox.window.location = sandbox.location;
sandbox.window.matchMedia = sandbox.matchMedia;
sandbox.self = sandbox;
sandbox.DOMParser.prototype = { parseFromString() { return { getElementsByTagName() { return []; } }; } };
sandbox.XMLSerializer.prototype = { serializeToString() { return ''; } };

let src = fs.readFileSync(path.join(root, 'engine.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!src.includes('})();')) throw new Error('IIFE close missing');
src = src.replace(
  /\}\)\(\);\s*$/,
  [
    'window.__convertPlainTextCalls = 0;',
    'window.__startManualConvertCalls = 0;',
    'var __origCPT = convertPlainText;',
    'convertPlainText = function () { window.__convertPlainTextCalls++; return __origCPT.apply(this, arguments); };',
    'var __origSMC = startManualConvert;',
    'startManualConvert = function () { window.__startManualConvertCalls++; return __origSMC.apply(this, arguments); };',
    'try { window.appState = appState; } catch (e) {}',
    'try { window.els = els; } catch (e) {}',
    'try { window.setLiveMode = setLiveMode; } catch (e) {}'
  ].join('\n') + '\n})();'
);
runInContext(src, sandbox);

const W = sandbox.window;
const input = getById('input-textarea');
const output = getById('output-textarea');
const convertBtn = getById('convert-btn');
const bangla = '\u09AC\u09BE\u0982\u09B2\u09BE \u09B2\u09C7\u0996\u09BE';

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

check('live mode starts ON', W.appState && W.appState.liveMode === true, 'liveMode=' + (W.appState && W.appState.liveMode));

input.value = bangla;
output.value = 'KEEP';
W.__convertPlainTextCalls = 0;
W.__startManualConvertCalls = 0;
convertBtn.handlersFor('click').forEach((fn) => fn({}));

check(
  'live ON forced click does not call convertPlainText',
  W.__convertPlainTextCalls === 0,
  'calls=' + W.__convertPlainTextCalls
);
check(
  'live ON forced click does not call startManualConvert',
  W.__startManualConvertCalls === 0,
  'calls=' + W.__startManualConvertCalls
);
check(
  'live ON forced click leaves output unchanged',
  output.value === 'KEEP',
  'output="' + output.value + '"'
);

W.setLiveMode(false);
output.value = '';
W.__convertPlainTextCalls = 0;
W.__startManualConvertCalls = 0;
convertBtn.handlersFor('click').forEach((fn) => fn({}));

check(
  'live OFF click still calls convertPlainText',
  W.__convertPlainTextCalls === 1,
  'calls=' + W.__convertPlainTextCalls
);
check(
  'live OFF click does not call startManualConvert for plain text',
  W.__startManualConvertCalls === 0,
  'calls=' + W.__startManualConvertCalls
);
check(
  'live OFF click converts',
  String(output.value || '').length > 0 && output.value !== bangla,
  'output="' + output.value + '"'
);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
