import fs from 'fs';
import { createContext, runInContext } from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXT_KEY = 'lipilab:input-text';

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

const store = {};
const textSets = [];
const winListeners = {};
const docListeners = {};
const documentEl = {
  readyState: 'complete',
  visibilityState: 'visible',
  hidden: false,
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
  addEventListener(t, fn) { (docListeners[t] = docListeners[t] || []).push(fn); },
  createElement() { return makeEl('created'); },
  createElementNS() { return makeEl('created'); }
};

const sandbox = createContext({
  console,
  window: {
    addEventListener(t, fn) { (winListeners[t] = winListeners[t] || []).push(fn); },
    removeEventListener() {},
    requestAnimationFrame(fn) { return setTimeout(fn, 0); },
    matchMedia() { return { matches: false, addEventListener() {}, addListener() {}, removeEventListener() {} }; }
  },
  document: documentEl,
  localStorage: {
    getItem(k) { return k in store ? store[k] : null; },
    setItem(k, v) {
      store[k] = String(v);
      if (k === TEXT_KEY) textSets.push(String(v));
    },
    removeItem(k) { delete store[k]; }
  },
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
    'try { window.appState = appState; } catch (e) {}',
    'try { window.setLiveMode = setLiveMode; } catch (e) {}',
    'try { window.persistState = persistState; } catch (e) {}'
  ].join('\n') + '\n})();'
);
runInContext(src, sandbox);

const W = sandbox.window;
const input = getById('input-textarea');
const clearBtn = getById('clear-btn');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function fireInput() {
  input.handlersFor('input').forEach((fn) => fn({}));
}
function fireWin(type) {
  (winListeners[type] || []).forEach((fn) => fn({ type }));
}
function fireDoc(type) {
  (docListeners[type] || []).forEach((fn) => fn({ type }));
}

W.setLiveMode(false);
textSets.length = 0;
delete store[TEXT_KEY];

for (let i = 0; i < 50; i++) {
  input.value = 'typed-' + i;
  fireInput();
}

check(
  '50 rapid inputs do not persist immediately',
  textSets.length === 0,
  'sets=' + textSets.length
);

await sleep(500);

check(
  '50 rapid inputs cause at most one text save after the delay',
  textSets.length <= 1,
  'sets=' + textSets.length
);
check(
  'text is saved after the delay',
  textSets.length === 1 && textSets[0] === 'typed-49',
  'sets=' + JSON.stringify(textSets)
);

textSets.length = 0;
delete store[TEXT_KEY];
input.value = 'pending-pagehide';
fireInput();
delete store[TEXT_KEY];
textSets.length = 0;
fireWin('pagehide');
check(
  'pending save is flushed on pagehide',
  store[TEXT_KEY] === 'pending-pagehide',
  'stored=' + store[TEXT_KEY] + ' sets=' + textSets.length
);

textSets.length = 0;
delete store[TEXT_KEY];
input.value = 'pending-hidden';
fireInput();
delete store[TEXT_KEY];
textSets.length = 0;
documentEl.visibilityState = 'hidden';
documentEl.hidden = true;
fireDoc('visibilitychange');
fireWin('visibilitychange');
check(
  'pending save is flushed on visibilitychange hidden',
  store[TEXT_KEY] === 'pending-hidden',
  'stored=' + store[TEXT_KEY] + ' sets=' + textSets.length
);

textSets.length = 0;
store[TEXT_KEY] = 'OLDTEXT';
input.value = 'OLDTEXT';
fireInput();
clearBtn.handlersFor('click').forEach((fn) => fn({}));
await sleep(500);
check(
  'after Clear then the timer firing, stored text is not the old text',
  store[TEXT_KEY] !== 'OLDTEXT',
  'stored=' + store[TEXT_KEY]
);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
