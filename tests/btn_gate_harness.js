/* Behavioural check for the live-mode Convert gate, run against the real
   github-revert/app.js inside a minimal fake DOM (no browser needed).

   Asserts:
     1. boot (live mode ON by default)  -> Convert button disabled + aria-disabled
     2. a real click on it is refused   -> no "Converting…" status, no run
     3. Ctrl+Enter style forced click    -> still refused (handler guard)
     4. toggling live mode OFF          -> Convert button enabled
     5. click while enabled             -> statusbar shows "Converting… 0%" first
     6. live mode ON again              -> disabled again
     7. no init step failed
*/
var fs = require('fs');
var vm = require('vm');

var APP = '../app.js';

var results = [];
function check(name, cond, detail) {
  results.push({ name: name, ok: !!cond, detail: detail });
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + ' | ' + detail);
}

function makeClassList() {
  var set = {};
  return {
    add: function (n) { set[n] = true; },
    remove: function (n) { delete set[n]; },
    contains: function (n) { return !!set[n]; },
    toggle: function (n, force) {
      var want = force === undefined ? !set[n] : !!force;
      if (want) set[n] = true; else delete set[n];
      return want;
    }
  };
}

function makeEl(id) {
  var el = {
    id: id || '', tagName: 'DIV', value: '', textContent: '', innerHTML: '',
    hidden: false, disabled: false, checked: false, readOnly: false, files: [],
    children: [], handlers: {}, attributes: {}, dataset: {},
    classList: makeClassList(),
    handlersFor: function (t) { return this.handlers[t] || []; },
    addEventListener: function (t, fn) { (this.handlers[t] = this.handlers[t] || []).push(fn); },
    removeEventListener: function () {},
    dispatchEvent: function () { return true; },
    setAttribute: function (k, v) { this.attributes[k] = String(v); },
    getAttribute: function (k) { return k in this.attributes ? this.attributes[k] : null; },
    removeAttribute: function (k) { delete this.attributes[k]; },
    hasAttribute: function (k) { return k in this.attributes; },
    appendChild: function (c) { this.children.push(c); return c; },
    insertBefore: function (c) { this.children.push(c); return c; },
    removeChild: function (c) { return c; },
    remove: function () {},
    querySelector: function () { return makeEl('q'); },
    querySelectorAll: function () { return []; },
    getElementsByTagName: function () { return []; },
    closest: function () { return makeEl('closest'); },
    focus: function () {}, blur: function () {},
    setSelectionRange: function () {}, select: function () {},
    // A real browser refuses to dispatch a click on a disabled control.
    click: function () {
      if (this.disabled) { this.clickBlocked = true; return; }
      this.handlersFor('click').forEach(function (fn) { fn({ preventDefault: function () {}, target: el }); });
    },
    getBoundingClientRect: function () { return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 }; },
    scrollIntoView: function () {},
    contains: function () { return false; },
    matches: function () { return false; }
  };
  el.style = new Proxy({}, { get: function (t, k) { return k in t ? t[k] : ''; }, set: function (t, k, v) { t[k] = v; return true; } });
  return el;
}

var INDEX = APP.replace(/app\.js$/, 'index.html');
// The site's contact address — read from index.html exactly like the app does.
var siteMail = (function () {
  var m = fs.readFileSync(INDEX, 'utf8').match(/class="support-mail" href="mailto:([^"]+)"/);
  return m ? m[1] : null;
})();
var clipboardWrites = [];
var docListeners = {};

var byId = {};
var doc = {
  readyState: 'complete',
  documentElement: makeEl('html'),
  body: makeEl('body'),
  hidden: false,
  activeElement: makeEl('active'),
  getElementById: function (id) { return byId[id] || (byId[id] = makeEl(id)); },
  querySelector: function (sel) {
    if (sel.indexOf('conversion-direction') > -1) return { value: 'unicode-to-bijoy', nextElementSibling: makeEl('label') };
    if (sel.indexOf('.support-mail') > -1) {
      var a = makeEl('support-mail');
      a.setAttribute('href', 'mailto:' + siteMail);
      return a;
    }
    return makeEl('q');
  },
  querySelectorAll: function () { return []; },
  createElement: function () { return makeEl('created'); },
  createElementNS: function () { return makeEl('created'); },
  addEventListener: function (t, fn) { (docListeners[t] = docListeners[t] || []).push(fn); },
  removeEventListener: function () {},
  getElementsByTagName: function () { return []; },
  execCommand: function () { return true; }
};

function fireKey(key) {
  var ev = { key: key, ctrlKey: false, shiftKey: false, altKey: false, preventDefault: function () {}, stopPropagation: function () {} };
  (docListeners.keydown || []).forEach(function (fn) { fn(ev); });
}

byId['live-mode-btn'] = (function () { var b = makeEl('live-mode-btn'); b.setAttribute('aria-checked', 'true'); return b; })(); // ships as aria-checked="true" in index.html
var store = {};
var initErrors = [];
var sandbox = {
  console: {
    log: function () {},
    error: function () { initErrors.push(Array.prototype.join.call(arguments, ' ')); },
    warn: function () {}, info: function () {}, debug: function () {}
  },
  document: doc,
  localStorage: {
    getItem: function (k) { return k in store ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  },
  navigator: { onLine: true, userAgent: 'node-harness', clipboard: null },
  location: { href: 'http://localhost/', protocol: 'http:', hostname: 'localhost' },
  requestAnimationFrame: function (fn) { return setTimeout(fn, 0); },
  cancelAnimationFrame: function () {},
  setTimeout: setTimeout, clearTimeout: clearTimeout,
  setInterval: function () { return 0; }, clearInterval: function () {},
  fetch: function () { return new Promise(function () {}); },
  matchMedia: function () { return { matches: false, addEventListener: function () {}, addListener: function () {}, removeEventListener: function () {} }; },
  getComputedStyle: function () { return {}; },
  open: function () {}, print: function () {},
  performance: { now: function () { return Date.now(); } },
  DOMParser: function () {},
  XMLSerializer: function () {}
};
sandbox.DOMParser.prototype.parseFromString = function () {
  return { getElementsByTagName: function () { return []; }, documentElement: { nodeName: 'root' }, parseError: null };
};
sandbox.XMLSerializer.prototype.serializeToString = function () { return ''; };

// --- download-layer stubs ---------------------------------------------------
// Every anchor the app creates is recorded, so a test can prove the finished
// file really was handed to the browser (and which name it was given).
var createdAnchors = [];
var rawCreateElement = doc.createElement;
doc.createElement = function (tag) {
  var el = rawCreateElement(tag);
  el.tagName = String(tag).toUpperCase();
  if (String(tag).toLowerCase() === 'a') createdAnchors.push(el);
  return el;
};
function FakeJSZip() {
  var self = this;
  this.file = function () { return self; };
  this.folder = function () { return self; };
  this.generateAsync = function () { return Promise.resolve({ fakeDocxBlob: true }); };
}
sandbox.JSZip = FakeJSZip;
sandbox.Blob = function (parts, opts) { this.parts = parts; this.type = opts && opts.type; };
sandbox.URL = { createObjectURL: function () { return 'blob:fake'; }, revokeObjectURL: function () {} };
sandbox.navigator.clipboard = {
  writeText: function (t) { clipboardWrites.push(t); return Promise.resolve(); }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.window.addEventListener = function () {};
sandbox.window.removeEventListener = function () {};
sandbox.window.matchMedia = sandbox.matchMedia;
sandbox.window.location = sandbox.location;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.document = doc;
sandbox.window.navigator = sandbox.navigator;

var src = fs.readFileSync(APP, 'utf8');
vm.runInNewContext(src, sandbox, { filename: 'app.js' });

function tick(ms) { return new Promise(function (r) { setTimeout(r, ms || 5); }); }
function fireLiveToggle() { byId['live-mode-btn'].handlersFor('click').forEach(function (fn) { fn({}); }); }
function statusText() { return byId['processing-text'].textContent; }

(async function () {
  var convertBtn = byId['convert-btn'];
  var liveBtn = byId['live-mode-btn'];
  var input = byId['input-textarea'];
  var percent = byId['processing-percent'];

  check('app.js booted (init ran, no step failed)', initErrors.length === 0, initErrors.join(' ; ') || 'no init errors');
  check('live mode is ON at boot', liveBtn.attributes['aria-checked'] === 'true', 'aria-checked=' + liveBtn.attributes['aria-checked']);
  check('Convert button is DISABLED while live mode is on', convertBtn.disabled === true, 'disabled=' + convertBtn.disabled);
  check('Convert button exposes aria-disabled=true', convertBtn.attributes['aria-disabled'] === 'true', 'aria-disabled=' + convertBtn.attributes['aria-disabled']);
  check('disabled hint explains why', /Live mode is ON/.test(convertBtn.title || ''), 'title="' + convertBtn.title + '"');

  input.value = '\u09AC\u09BE\u0982\u09B2\u09BE \u09B2\u09C7\u0996\u09BE';
  convertBtn.click();
  check('click on the disabled button is refused', convertBtn.clickBlocked === true && statusText() !== 'Converting\u2026', 'clickBlocked=' + convertBtn.clickBlocked + ', status="' + statusText() + '"');

  convertBtn.handlersFor('click').forEach(function (fn) { fn({}); }); // Ctrl+Enter calls .click()
  check('handler guard refuses a forced click while live mode is on', statusText() !== 'Converting\u2026', 'status="' + statusText() + '"');

  fireLiveToggle();
  check('live mode OFF -> Convert button ENABLED', convertBtn.disabled === false && liveBtn.attributes['aria-checked'] === 'false', 'disabled=' + convertBtn.disabled);
  check('enabled button loses aria-disabled', convertBtn.attributes['aria-disabled'] === 'false', 'aria-disabled=' + convertBtn.attributes['aria-disabled']);
  check('enabled tooltip restored', convertBtn.title === 'Convert (Ctrl+Enter)', 'title="' + convertBtn.title + '"');

  convertBtn.click();
  check('manual click paints the converting feedback', statusText() === 'Converting\u2026' && percent.textContent === '0%', 'status="' + statusText() + '", percent="' + percent.textContent + '"');

  await tick(40);
  check('conversion finishes with a success status', /^Successfully converted to/.test(statusText()), 'status="' + statusText() + '"');
  check('output was produced', String(byId['output-textarea'].value || '').length > 0, 'length=' + String(byId['output-textarea'].value || '').length);
  check('progress bar cleared after success', percent.textContent === '', 'percent="' + percent.textContent + '"');
  check('plain Bangla leaves the unmappable badge hidden', byId['warning-badge'].hidden === true, 'hidden=' + byId['warning-badge'].hidden + ', count=' + byId['warning-count'].textContent);

  fireLiveToggle();
  check('live mode ON again -> Convert disabled again', convertBtn.disabled === true, 'disabled=' + convertBtn.disabled);

  // --- unmappable badge: it must say WHAT is unmappable -------------------
  fireLiveToggle(); // live OFF again so Convert is clickable
  input.value = '\u09AC\u09BE\u0982\u09B2\u09BE \u09B2\u09C7\u0996\u09BE \u09F0 \u09F1'; // ... + ৰ (U+09F0), ৱ (U+09F1)
  convertBtn.click();
  await tick(40);
  check('conversion with rare glyphs succeeded', /^Successfully converted to/.test(statusText()), 'status="' + statusText() + '"');

  var badge = byId['warning-badge'];
  var badgeCount = byId['warning-count'];
  check('badge shows the unmappable count', badge.hidden === false && badgeCount.textContent === '2', 'hidden=' + badge.hidden + ', count=' + badgeCount.textContent);
  check('badge tooltip names the characters', /no Bijoy/.test(badge.title || '') && /\u09F0/.test(badge.title) && /\u09F1/.test(badge.title), 'title="' + badge.title + '"');
  check('badge carries the same explanation for screen readers', /no Bijoy/.test(badge.attributes['aria-label'] || ''), 'aria-label="' + badge.attributes['aria-label'] + '"');

  // --- unmappable report dialog: explanation + copy + ready-made mail ------
  var modal = byId['unmap-modal'];
  var preview = byId['unmap-mail-preview'];
  modal.hidden = true; // index.html ships the dialog with the hidden attribute

  badge.handlersFor('click').forEach(function (fn) { fn({}); });
  check('badge click opens the report dialog', modal.hidden === false, 'hidden=' + modal.hidden);
  check('badge tooltip invites reporting', /click to report it/.test(badge.title || ''), 'title="' + badge.title + '"');

  var idxSrc = fs.readFileSync(INDEX, 'utf8');

  // Chips row and the bottom button row are gone — the three actions now
  // live in the dialog's header: Send, Copy, Close (in that order).
  check('character chips are gone from the dialog markup',
    idxSrc.indexOf('unmap-char-chips') === -1, 'found=' + (idxSrc.indexOf('unmap-char-chips') > -1));
  check('bottom button row is gone from the dialog markup',
    idxSrc.indexOf('unmap-modal__actions') === -1, 'found=' + (idxSrc.indexOf('unmap-modal__actions') > -1));
  var headerBlock = idxSrc.slice(idxSrc.indexOf('unmap-modal__header'), idxSrc.indexOf('unmap-modal__lead'));
  var iSend = headerBlock.indexOf('unmap-send-btn');
  var iCopy = headerBlock.indexOf('unmap-copy-btn');
  var iClose = headerBlock.indexOf('unmap-close-btn');
  check('header carries Send, Copy and Close in that order',
    iSend > -1 && iCopy > iSend && iClose > iCopy, 'send=' + iSend + ', copy=' + iCopy + ', close=' + iClose);

  check('instruction says they are not in the converter list yet',
    /কনভার্টার-লিস্টে যোগ করা হয়নি/.test(idxSrc),
    'instruction found=' + /কনভার্টার-লিস্টে যোগ করা হয়নি/.test(idxSrc));
  check('instruction promises that no user text is sent',
    /আপনার কোনো লেখা বা ব্যক্তিগত তথ্য যায় না/.test(idxSrc),
    'found=' + /আপনার কোনো লেখা বা ব্যক্তিগত তথ্য যায় না/.test(idxSrc));
  check('the dropped 600-character promise is gone',
    !/৬০০ ক্যারেক্টার/.test(idxSrc) && !/রিপ্রোডিউস/.test(idxSrc), 'still present');

  var previewText = String(preview.textContent || '');
  check('preview names the characters with code points',
    previewText.indexOf('ৰ (U+09F0)') > -1 && previewText.indexOf('ৱ (U+09F1)') > -1, 'len=' + previewText.length);
  check('preview carries none of the user\'s own text',
    previewText.indexOf('বাংলা লেখা') === -1 && previewText.indexOf('My text') === -1,
    'hasUserText=' + (previewText.indexOf('বাংলা লেখা') > -1));
  check('preview still asks for a future-update fix',
    /Please add them to the SutonnyMJ/.test(previewText), 'ask=' + /Please add them to the SutonnyMJ/.test(previewText));

  // Copy -> exactly the previewed text lands on the clipboard.
  byId['unmap-copy-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  await tick(10);
  check('Copy puts exactly the preview text on the clipboard',
    clipboardWrites.length === 1 && clipboardWrites[0] === previewText,
    'writes=' + clipboardWrites.length + ', match=' + (clipboardWrites[0] === previewText));
  var toastText = function () { var c = byId['toast-container'].children; return (c[c.length - 1] || {}).textContent || ''; };
  check('Copy confirms with a toast', /Report copied/.test(toastText()), 'toast="' + toastText() + '"');

  // Send -> readymade mail: address from the site, body = the preview text.
  byId['unmap-send-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  var sentHref = sandbox.location.href || '';
  check('Send opens a ready-made mail to the site address',
    sentHref.indexOf('mailto:' + siteMail + '?subject=') === 0,
    'href head="' + sentHref.slice(0, Math.min(90, sentHref.length)) + '"');
  var sentSubject = decodeURIComponent((sentHref.split('?subject=')[1] || '').split('&body=')[0]);
  var sentBody = decodeURIComponent(sentHref.split('&body=')[1] || '');
  check('mail subject names the characters', sentSubject.indexOf('ৰ ৱ') > -1, 'subject="' + sentSubject + '"');
  check('mail body is exactly what the modal showed', sentBody === previewText, 'sentLen=' + sentBody.length + ', previewLen=' + previewText.length);
  check('mail body asks for a future-update fix', /Please add them to the SutonnyMJ/.test(sentBody), 'ask=' + /Please add them to the SutonnyMJ/.test(sentBody));

  // Closing paths: Esc and the header's X button. A click outside must NOT close it.
  fireKey('Escape');
  check('Esc closes the dialog', modal.hidden === true, 'hidden=' + modal.hidden);
  badge.handlersFor('click').forEach(function (fn) { fn({}); });
  var backdropHandlers = byId['unmap-backdrop'].handlersFor('click');
  check('click outside does NOT close the dialog (no backdrop handler)', backdropHandlers.length === 0 && modal.hidden === false, 'handlers=' + backdropHandlers.length + ', hidden=' + modal.hidden);
  badge.handlersFor('click').forEach(function (fn) { fn({}); });
  byId['unmap-close-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  check('X button closes it', modal.hidden === true, 'hidden=' + modal.hidden);

  // --- same single report text for a taka sign (U+09F3, still unmapped) ---
  input.value = 'বাংলা লেখা ৳'; // ৳ (U+09F3)
  convertBtn.click();
  await tick(40);
  check('taka conversion succeeded', /^Successfully converted to/.test(statusText()), 'status="' + statusText() + '"');
  check('badge counts just the taka sign', byId['warning-badge'].hidden === false && byId['warning-count'].textContent === '1', 'count=' + byId['warning-count'].textContent);
  byId['warning-badge'].handlersFor('click').forEach(function (fn) { fn({}); });
  var preview2 = String((byId['unmap-mail-preview'] || {}).textContent || '');
  check('taka report asks for a future-update fix', /Please add them to the SutonnyMJ/.test(preview2), 'ask=' + /Please add them to the SutonnyMJ/.test(preview2));
  check('taka report names the sign with its code point', preview2.indexOf('৳ (U+09F3)') > -1, 'hasTaka=' + (preview2.indexOf('৳ (U+09F3)') > -1));
  fireKey('Escape');
  check('Escape closes the taka report', byId['unmap-modal'].hidden === true, 'hidden=' + byId['unmap-modal'].hidden);

  // --- download format dialog --------------------------------------------
  byId['download-open-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  check('download icon opens the format dialog', byId['download-modal'].hidden === false, 'hidden=' + byId['download-modal'].hidden);
  // The format buttons are wired through ONE delegated listener on the dialog,
  // not per-button, so assert on the markup and on the dialog's own handlers.
  check('markup has exactly three format buttons in order', /id="dl-docx"[\s\S]*id="dl-txt"[\s\S]*id="dl-pdf"/.test(idxSrc), 'docx->txt->pdf');
  check('format dialog holds an ad slot', !!byId['spot-download'], 'adSlot=' + !!byId['spot-download']);
  check('ad slot is a partner-managed box', /class="dlg__ad" id="spot-download"/.test(idxSrc), 'dlg__ad found');
  // backdrop click is a delegated [data-close] handler -> same close path
  check('markup gives the dialog a data-close backdrop', /id="download-modal"[\s\S]*?class="dlg__backdrop" data-close/.test(idxSrc), 'data-close found');
  byId['download-close-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  check('X button closes the format dialog', byId['download-modal'].hidden === true, 'hidden=' + byId['download-modal'].hidden);

  // --- TXT download feedback ---------------------------------------------
  var anchorsBefore = createdAnchors.length;
  byId['download-open-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  // simulate the delegated handler picking TXT
  byId['output-textarea'].value = 'converted bangla text';
  byId['download-modal'].handlersFor('click').forEach(function (fn) {
    fn({ target: { getAttribute: function (n) { return n === 'data-format' ? 'txt' : null; }, closest: function () { return { getAttribute: function (n) { return n === 'data-format' ? 'txt' : null; } }; } } });
  });
  check('TXT click paints "Building TXT file…"', statusText() === 'Building TXT file\u2026', 'status="' + statusText() + '"');
  await tick(40);
  var txtAnchor = createdAnchors[createdAnchors.length - 1] || {};
  check('TXT blob handed to the browser', createdAnchors.length === anchorsBefore + 1 && txtAnchor.download === 'LipiLab_converted.txt' && txtAnchor.href === 'blob:fake', 'download="' + txtAnchor.download + '", href="' + txtAnchor.href + '"');
  check('TXT download reports success', statusText() === 'Download started successfully', 'status="' + statusText() + '"');
  check('TXT success row shows the green check (no spinner)', byId['processing-spinner'].hidden === true && byId['processing-success-icon'].hidden === false, 'spinnerHidden=' + byId['processing-spinner'].hidden);
  check('TXT click closes the format dialog', byId['download-modal'].hidden === true, 'hidden=' + byId['download-modal'].hidden);

  // --- DOCX download feedback (no template -> blank docx from the output) --
  byId['download-open-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  byId['download-modal'].handlersFor('click').forEach(function (fn) {
    fn({ target: { closest: function () { return { getAttribute: function (n) { return n === 'data-format' ? 'docx' : null; } }; } } });
  });
  check('DOCX click paints "Building DOCX file…"', statusText() === 'Building DOCX file\u2026', 'status="' + statusText() + '"');
  await tick(60);
  var docxAnchor = createdAnchors[createdAnchors.length - 1] || {};
  check('DOCX blob handed to the browser', docxAnchor.download === 'Converted_Document.docx' && docxAnchor.href === 'blob:fake', 'download="' + docxAnchor.download + '"');
  check('DOCX download reports success', statusText() === 'Download started successfully', 'status="' + statusText() + '"');
  check('PDF is wired as a format and still says coming soon', /id="dl-pdf" data-format="pdf"/.test(idxSrc), 'pdf wired');

  // --- clear confirmation dialog -----------------------------------------
  byId['input-textarea'].value = 'doomed text';
  byId['clear-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  check('clear asks for confirmation first', byId['confirm-modal'].hidden === false, 'hidden=' + byId['confirm-modal'].hidden);
  check('clear did NOT wipe the text before confirming', byId['input-textarea'].value === 'doomed text', 'value="' + byId['input-textarea'].value + '"');
  check('markup gives the confirm dialog a data-close backdrop', /id="confirm-modal"[\s\S]*?class="dlg__backdrop" data-close/.test(idxSrc), 'data-close found');
  byId['confirm-cancel-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  check('Cancel keeps the text', byId['confirm-modal'].hidden === true && byId['input-textarea'].value === 'doomed text', 'value="' + byId['input-textarea'].value + '"');
  byId['clear-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  byId['confirm-ok-btn'].handlersFor('click').forEach(function (fn) { fn({}); });
  check('Confirm clears the text', byId['input-textarea'].value === '', 'value="' + byId['input-textarea'].value + '"');

  // --- static guards for the stale-status bug ----------------------------
  var cssSrc = fs.readFileSync(APP.replace(/app\.js$/, 'styles.css'), 'utf8');
  check('styles.css makes the status row honour [hidden]', /#processing-indicator\[hidden\]\s*\{\s*display:\s*none/.test(cssSrc), 'rule found=' + /#processing-indicator\[hidden\]/.test(cssSrc));
  check('styles.css hides the report dialog with [hidden]', /\.unmap-modal\[hidden\]\s*\{\s*display:\s*none/.test(cssSrc), 'rule found=' + /\.unmap-modal\[hidden\]/.test(cssSrc));
  check('markup gives the report dialog a separate scrolling body under the header', idxSrc.indexOf('unmap-modal__body') > -1 && /\.unmap-modal__body\s*\{[^}]*overflow:\s*auto/.test(cssSrc), 'body=' + (idxSrc.indexOf('unmap-modal__body') > -1));
  check('the header is a fixed bar outside the scroll area (text can never enter it)', /\.unmap-modal__card\s*\{[^}]*overflow:\s*hidden/.test(cssSrc) && !/\.unmap-modal__header\s*\{[^}]*position:\s*sticky/.test(cssSrc), 'cardHidden=' + /\.unmap-modal__card\s*\{[^}]*overflow:\s*hidden/.test(cssSrc));
  check('report dialog heading wears a flat surface band, not a gradient', /\.unmap-modal__header\s*\{[^}]*background:\s*var\(--surface-alt\)/.test(cssSrc) && !/\.unmap-modal__header\s*\{[^}]*linear-gradient/.test(cssSrc), 'band=' + /\.unmap-modal__header\s*\{[^}]*background:\s*var\(--surface-alt\)/.test(cssSrc));
  check('branded colours live only in the token block', (cssSrc.match(/--(?:primary|secondary|tertiary):#[0-9a-f]{3,8};/g) || []).length <= 6 && !/#[0-9a-f]{6}/i.test(cssSrc.split('@font-face')[0].split(':root{')[0] || ''), 'brandTokens=' + (cssSrc.match(/--(?:primary|secondary|tertiary):#[0-9a-f]{3,8};/g) || []).length);
  var ctaDur = /animation:\s*bnCtaPulse\s+([0-9.]+)s/.exec(cssSrc);
  check('banner Try Free pulse slowed down (>=3s, gentle scale)', !!ctaDur && parseFloat(ctaDur[1]) >= 3 && /50%\s*\{[^}]*scale\(1\.03/.test(cssSrc), 'dur=' + (ctaDur ? ctaDur[1] + 's' : 'none'));
  check('styles.css keeps no chips or bottom-button rules', !/\.unmap-modal__(chip|chars|actions|btn)/.test(cssSrc), 'found=' + /\.unmap-modal__(chip|chars|actions|btn)/.test(cssSrc));
  check('no stale showProcessing(false) calls remain', (src.match(/showProcessing\(false\)/g) || []).length === 0, 'count=' + (src.match(/showProcessing\(false\)/g) || []).length);

  var failed = results.filter(function (r) { return !r.ok; }).length;
  console.log('\nRESULT pass=' + (results.length - failed) + ' fail=' + failed);
  process.exit(failed ? 1 : 0);
})();

