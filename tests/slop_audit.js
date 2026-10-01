/* Slop audit for the `slop fix` folder — checks the 7 rules from
   Prompt/new_version_prompt.md. Usage: node slop_audit.js */
var fs = require('fs');
var dir = __dirname;
var css = fs.readFileSync(dir + '/styles.css', 'utf8');
var html = fs.readFileSync(dir + '/index.html', 'utf8');
var fails = [], passes = [];
function ok(name, cond, detail) {
  (cond ? passes : fails).push(name + ' | ' + detail);
  console.log((cond ? 'PASS | ' : 'FAIL | ') + name + ' | ' + detail);
}
function all(src, re) { return (src.match(re) || []).length; }

// Rule 1 — banned AI-default fonts in font-family context only
var bannedFonts = /(?:font-family\s*:[^;}]*\b(?:Inter|Geist|Space Grotesk|Instrument Serif)\b|family=(?:Inter|Geist|Space\+Grotesk|Instrument\+Serif))/g;
ok('R1 no banned AI-default font', all(css, bannedFonts) + all(html, bannedFonts) === 0,
   'hits=' + (all(css, bannedFonts) + all(html, bannedFonts)));

// Rule 2 — no filled CTA in HSL 240-295 (purple band)
var purple = /#6c63ff|#8b5cf6|#a855f7|#6366f1|#8b80ff|#c084fc|#2a2450|#ece9ff/gi;
var purpleHits = (css.match(purple) || []).length + (html.match(purple) || []).length;
ok('R2 no VibeCode purple tokens', purpleHits === 0, 'purpleTokens=' + purpleHits);

// Rule 3 — at most one gradient element
var cssGrad = all(css, /linear-gradient\(|radial-gradient\(|conic-gradient\(/g);
var svgGrad = all(html, /<linearGradient|<radialGradient/g);
ok('R3 gradients <= 1', cssGrad + svgGrad <= 1, 'css=' + cssGrad + ' svg=' + svgGrad + ' total=' + (cssGrad + svgGrad));

// Rule 4 — no backdrop-filter blur
var bdf = all(css, /backdrop-filter\s*:/g) + all(html, /backdrop-filter\s*:/g);
ok('R4 no backdrop-filter', bdf === 0, 'backdropFilter=' + bdf);

// Rule 5 — no saturated box-shadow, no colored glow
var satShadow = /box-shadow\s*:[^;}]*rgba?\(\s*(?!30\s*,\s*27\s*,\s*46|0\s*,\s*0\s*,\s*0)(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g;
function shadowIsSaturated(m) {
  var r = +m[1], g = +m[2], b = +m[3];
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx - mn < 12) return false;          // grey / near-grey
  return true;                             // any real hue
}
var shadowLines = css.split('\n').filter(function (l) { return l.indexOf('box-shadow') > -1; });
var badShadows = shadowLines.filter(function (l) { return satShadow.test(l); }).length;
satShadow.lastIndex = 0;
ok('R5 no saturated box-shadow', badShadows === 0, 'badShadows=' + badShadows + '/' + shadowLines.length);
var glowKeys = all(css, /@keyframes\s+\w*[Gg]low/g) + all(css, /rgba\(\s*108,\s*99,\s*255/g) + all(css, /rgba\(\s*168,\s*85,\s*247/g);
ok('R5b no purple glow keyframes/tints', glowKeys === 0, 'glowRefs=' + glowKeys);

// Rule 6 — dark theme body text luminance >= 0.85
function lum(hex) {
  var m = hex.replace('#', '');
  if (m.length === 3) m = m[0] + m[0] + m[1] + m[1] + m[2] + m[2];
  var v = [0, 2, 4].map(function (i) {
    var c = parseInt(m.substr(i, 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
// merge every dark block (the token switcher splits dark values across two
// rules, so collect them all instead of reading only the first)
var darkBlock = (css.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/g) || []).join('\n');
function darkVar(name) {
  var m = new RegExp('--' + name + '\\s*:\\s*(#[0-9a-fA-F]{3,6})').exec(darkBlock);
  return m ? m[1] : null;
}
['text', 'text-secondary', 'text-faint'].forEach(function (name) {
  var hex = darkVar(name);
  var L = hex ? lum(hex) : 0;
  ok('R6 dark --' + name + ' L >= 0.85', L >= 0.85, hex + ' L=' + L.toFixed(3));
});

// Rule 7 — no card-like container inside another
var nested = 0, nestDetail = [];
var panelInner = ['panel__header', 'panel__footer', 'panel__stats', 'icon-btn', 'font-size-btn'];
panelInner.forEach(function (cls) {
  // an inner element that still raises itself with a real shadow token
  var re = new RegExp('\\.' + cls.replace(/[-]/g, '\\-') + '[^{]*\\{[^}]*box-shadow\\s*:\\s*var\\(--shadow-', 'g');
  var n = (css.match(re) || []).length;
  if (n) { nested += n; nestDetail.push(cls + 'x' + n); }
});
var bandInBox = all(css, /\.(info-box__title|support-box__title|unmap-modal__header)\s*\{[^}]*background\s*:\s*linear-gradient/g);
ok('R7 no nested card shadows', nested === 0, 'innerShadows=' + nested + (nestDetail.length ? ' [' + nestDetail.join(', ') + ']' : ''));
ok('R7b no filled band inside a bordered box', bandInBox === 0, 'bandsInBox=' + bandInBox);

console.log('\nRESULT pass=' + passes.length + ' fail=' + fails.length + (fails.length ? '  <-- NOT CLEAN YET' : '  <-- CLEAN'));
process.exitCode = fails.length ? 1 : 0;
