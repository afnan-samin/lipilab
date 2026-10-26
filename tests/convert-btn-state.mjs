import fs from 'fs';
import { createContext, runInContext } from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE_ON_TITLE = 'Live mode is ON — text converts as you type (Ctrl+L for manual convert)';
const BASE_TITLE = 'Convert (Ctrl+Enter)';

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
    'try { window.updateConvertBtnState = updateConvertBtnState; } catch (e) {}'
  ].join('\n') + '\n})();'
);
runInContext(src, sandbox);

const W = sandbox.window;
const convertBtn = getById('convert-btn');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

check('live mode starts ON', W.appState && W.appState.liveMode === true, 'liveMode=' + (W.appState && W.appState.liveMode));
check('Live ON -> Convert disabled', convertBtn.disabled === true, 'disabled=' + convertBtn.disabled);
check('Live ON -> aria-disabled true', convertBtn.attributes['aria-disabled'] === 'true', 'aria-disabled=' + convertBtn.attributes['aria-disabled']);
check('Live ON -> title is the Live-ON string', convertBtn.title === LIVE_ON_TITLE, 'title="' + convertBtn.title + '"');

W.setLiveMode(false);
check('Live OFF -> Convert enabled', convertBtn.disabled === false, 'disabled=' + convertBtn.disabled);
check('Live OFF -> aria-disabled false', convertBtn.attributes['aria-disabled'] === 'false', 'aria-disabled=' + convertBtn.attributes['aria-disabled']);
check('Live OFF -> title is the base title', convertBtn.title === BASE_TITLE, 'title="' + convertBtn.title + '"');

W.setLiveMode(true);
check('Live ON again -> Convert disabled', convertBtn.disabled === true, 'disabled=' + convertBtn.disabled);
check('Live ON again -> title is the Live-ON string', convertBtn.title === LIVE_ON_TITLE, 'title="' + convertBtn.title + '"');

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
