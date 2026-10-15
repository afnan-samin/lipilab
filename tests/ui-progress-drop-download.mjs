import fs from 'fs';
import { createContext, runInContext } from 'vm';

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

function fakeEl(id) {
  const el = {
    id: id || '',
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: true,
    disabled: false,
    className: '',
    classList: makeClassList(),
    style: { width: '', setProperty() {} },
    dataset: {},
    attributes: {},
    handlers: {},
    addEventListener(t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); },
    handlersFor(t) { return this.handlers[t] || []; },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
    removeAttribute(k) { delete this.attributes[k]; },
    querySelector() { return fakeEl('q'); },
    querySelectorAll() { return []; },
    closest() { return null; },
    focus() {},
    getBoundingClientRect() { return { height: 0, width: 0, left: 0, top: 0, right: 0, bottom: 0 }; },
  };
  return el;
}

const byId = {};
function getById(id) {
  return byId[id] || (byId[id] = fakeEl(id));
}

const sandbox = createContext({
  console,
  window: {
    addEventListener() {},
    requestAnimationFrame(fn) { return setTimeout(fn, 0); },
  },
  document: {
    readyState: 'loading',
    getElementById: getById,
    querySelector(sel) {
      if (sel && sel.indexOf('conversion-direction') > -1) {
        return { value: 'auto', nextElementSibling: fakeEl('label') };
      }
      return fakeEl('q');
    },
    querySelectorAll() { return []; },
    documentElement: { style: { setProperty() {} } },
    addEventListener() {},
    body: fakeEl('body'),
    activeElement: fakeEl('active'),
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { onLine: true },
  DOMParser: function () {},
  XMLSerializer: function () {},
  Node: { ELEMENT_NODE: 1, TEXT_NODE: 3, COMMENT_NODE: 8 },
});
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.DOMParser.prototype = { parseFromString() { return { getElementsByTagName() { return []; } }; } };
sandbox.XMLSerializer.prototype = { serializeToString() { return ''; } };

let src = fs.readFileSync('/tmp/lipilab-live/engine.js', 'utf8') + '\n' + fs.readFileSync('/tmp/lipilab-live/app.js', 'utf8');
if (!src.includes('})();')) throw new Error('IIFE close missing');
src = src.replace(
  /\}\)\(\);\s*$/,
  [
    'try { window.showProcessing = showProcessing; } catch (e) {}',
    'try { window.updateStats = updateStats; } catch (e) {}',
    'try { window.updateDownloadBtnState = updateDownloadBtnState; } catch (e) {}',
    'try { window.inputHasContent = inputHasContent; } catch (e) {}',
    'try { window.dropFailedToast = dropFailedToast; } catch (e) {}',
    'try { window.handleDroppedFile = handleDroppedFile; } catch (e) {}',
    'try { window.openConfirm = openConfirm; } catch (e) {}',
    'try { window.els = els; } catch (e) {}',
    'try { window.appState = appState; } catch (e) {}',
  ].join('\n') + '\n})();'
);
runInContext(src, sandbox);

const W = sandbox.window;
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? ' | ' + detail : '')); }
}

const html = fs.readFileSync('/tmp/lipilab-live/index.html', 'utf8');
const css = fs.readFileSync('/tmp/lipilab-live/styles.css', 'utf8');

check('showProcessing exported', typeof W.showProcessing === 'function');

if (typeof W.showProcessing === 'function') {
  const text = getById('processing-text');
  const percent = getById('processing-percent');
  const bar = getById('processing-progress');
  const fill = getById('processing-progress-fill');
  W.showProcessing(true, 'Converting…', 37);
  check(
    'label has no trailing percent',
    text.textContent === 'Converting…',
    'got "' + text.textContent + '"'
  );
  check(
    'percent lives only in processing-percent',
    percent.textContent === '37%',
    'got "' + percent.textContent + '"'
  );
  check(
    'progress bar class --show is on',
    bar.classList.contains('processing-progress--show'),
    'show=' + bar.classList.contains('processing-progress--show')
  );
  check(
    'progress fill width is 37%',
    fill.style.width === '37%',
    'width=' + fill.style.width
  );
}

check(
  'CSS shows bar when --show is set',
  /\.processing-progress--show\s*\{[^}]*display:\s*inline-block/.test(css),
  'rule missing'
);
check(
  'progress fill is block so green height paints',
  /\.processing-progress__fill\s*\{[^}]*display:\s*block/.test(css),
  'display:block missing on fill'
);
check(
  'progress fill uses tertiary green',
  /\.processing-progress__fill\s*\{[^}]*background:\s*var\(--tertiary\)/.test(css),
  'green fill missing'
);

check('updateDownloadBtnState exported', typeof W.updateDownloadBtnState === 'function');
if (typeof W.updateDownloadBtnState === 'function' && W.els) {
  getById('output-textarea').value = '';
  W.updateDownloadBtnState();
  const btn = getById('download-open-btn');
  check(
    'empty output marks download aria-disabled',
    btn.getAttribute('aria-disabled') === 'true',
    'aria-disabled=' + btn.getAttribute('aria-disabled')
  );
  getById('output-textarea').value = 'কলহন';
  W.updateDownloadBtnState();
  check(
    'non-empty output enables download',
    btn.getAttribute('aria-disabled') === 'false',
    'aria-disabled=' + btn.getAttribute('aria-disabled')
  );
}

check('inputHasContent exported', typeof W.inputHasContent === 'function');
if (typeof W.inputHasContent === 'function') {
  getById('input-textarea').value = '';
  getById('docx-strip').classList.remove('show');
  check('empty input has no content', W.inputHasContent() === false, 'got ' + W.inputHasContent());
  getById('input-textarea').value = 'hello';
  check('typed text counts as content', W.inputHasContent() === true, 'got ' + W.inputHasContent());
  getById('input-textarea').value = '';
  getById('docx-strip').classList.add('show');
  check('loaded file strip counts as content', W.inputHasContent() === true, 'got ' + W.inputHasContent());
}

check('handleDroppedFile exported', typeof W.handleDroppedFile === 'function');
check('openConfirm exported', typeof W.openConfirm === 'function');
check('dropFailedToast exported', typeof W.dropFailedToast === 'function');

check(
  'confirm modal markup exists',
  /id="confirm-modal"/.test(html) && /id="confirm-ok-btn"/.test(html) && /id="confirm-cancel-btn"/.test(html),
  'missing confirm modal'
);
check(
  'confirm actions are Delete and Keep',
  />Delete</.test(html) && />Keep</.test(html),
  'labels missing'
);
check(
  'download empty toast copy in app.js',
  /nothing here to download/.test(src),
  'toast string missing'
);
check(
  'drop-failed toast uses quoted filename',
  /upload failed/.test(src),
  'failed toast missing'
);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
