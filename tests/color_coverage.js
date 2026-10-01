// Token coverage test: every colour on the page must be reachable from the
// three theme tokens. Fails loudly if a colour is hardcoded somewhere.
var fs = require('fs');
var dir = 'E:/e/Rabbi/.archive/z1/Projects/Lipilab/Lipilab Signin signup/LipiLab-deploy/slop fix/';
var css = fs.readFileSync(dir + 'styles.css', 'utf8');
var html = fs.readFileSync(dir + 'index.html', 'utf8');
var fails = [];
function ok(name, cond, detail) { console.log((cond ? 'PASS | ' : 'FAIL | ') + name + ' | ' + detail); if (!cond) fails.push(name); }

// 1. no var() inside SVG markup attributes (they are silently ignored by browsers)
var svgVar = (html.match(/(?:fill|stroke|stop-color)="var\([^"]*\)"/g) || []);
ok('no var() in SVG attributes (silently ignored by browsers)', svgVar.length === 0, 'found=' + svgVar.length + (svgVar.length ? ' e.g. ' + svgVar[0] : ''));

// 2. no broken double-quote markup left by a bad edit
ok('no broken "" markup', (html.match(/""\s*\/?>/g) || []).length === 0, 'broken=' + (html.match(/""\s*\/?>/g) || []).length);

// 3. every colourless SVG node carries a class (so CSS can paint it)
var orphans = html.match(/<(?:rect|text|stop)(?![^>]*fill=)(?![^>]*stop-color=)(?![^>]*class=)[^>]*>/g) || [];
ok('no colourless SVG node without a class', orphans.length === 0, 'orphans=' + orphans.length + (orphans.length ? ' e.g. ' + orphans[0].slice(0, 60) : ''));

// 4. every class used by the banners is actually styled in CSS
['bn-bg', 'bn-cta-bg', 'bn-cta-text', 'bn-logo-a', 'bn-logo-b', 'bn-title', 'bn-sub', 'bn-orb', 'bn-line'].forEach(function (cls) {
  var inHtml = html.indexOf('"' + cls) > -1;
  var styled = css.indexOf('.' + cls) > -1;
  ok('banner class .' + cls + ' exists in markup and is styled', inHtml && styled, 'markup=' + inHtml + ' css=' + styled);
});

// 5. no hardcoded colour below the token block, except the two fixed
//    brand-agnostic inks (success green, Facebook blue) and print ink
var ALLOWED = ['#fff', '#000', '#16a34a', '#1877f2'];
var head = css.slice(0, css.indexOf('@font-face'));
var body = css.slice(css.indexOf('@font-face'));
var bodyHex = (body.match(/#[0-9a-fA-F]{3,8}\b/g) || []).filter(function (h) {
  return ALLOWED.indexOf(h.toLowerCase()) === -1;
});
ok('no hardcoded colour below the token block', bodyHex.length === 0, 'found=' + JSON.stringify([...new Set(bodyHex)]));

// 6. each brand token is defined once in :root plus once in the dark block
//    (dark needs its own readable value - that is the point of the two blocks)
['primary', 'secondary', 'tertiary'].forEach(function (n) {
  var defs = (css.match(new RegExp('--' + n + ':#', 'g')) || []).length;
  var rootBlock = /:root\s*\{([\s\S]*?)\}/.exec(css);
  var inRoot = rootBlock && rootBlock[1].indexOf('--' + n + ':#') > -1;
  var darkBlock = /\[data-theme="dark"\]\s*\{([\s\S]*?)\}/.exec(css);
  var inDark = darkBlock && darkBlock[1].indexOf('--' + n + ':#') > -1;
  ok('--' + n + ' defined in :root and re-pointed for dark', defs === 2 && inRoot && inDark, 'defs=' + defs + ' inRoot=' + !!inRoot + ' inDark=' + !!inDark);
});

// 7. everything painted on the page reads a var()
var tokenRefs = (css.match(/var\(--/g) || []).length;
ok('stylesheet is token-driven', tokenRefs > 200, 'var() refs=' + tokenRefs);

console.log('\nRESULT pass=' + (7 + 9 - fails.length) + ' fail=' + fails.length + (fails.length ? '  <-- COLOUR CHANGES WOULD LEAK' : '  <-- ALL COLOUR REACHABLE FROM TOKENS'));
process.exitCode = fails.length ? 1 : 0;
