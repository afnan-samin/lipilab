import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

check(
  'howto steps 1-col at 860px',
  /@media \(max-width:860px\)[\s\S]*howto-box__steps\{ grid-template-columns:1fr; \}/.test(css)
);
check(
  'howto steps 1-col at 640px',
  /@media \(max-width:640px\)[\s\S]*howto-box__steps\{ grid-template-columns:1fr; \}/.test(css)
);

const mobile640 = css.match(/@media \(max-width:640px\)\{[\s\S]*?\.howto-box__steps[\s\S]{0,3500}/);
const hideShortcuts = /#shortcuts-open-btn\{[^}]*display:\s*none/.test(css)
  && /@media \(max-width:640px\)[\s\S]*#shortcuts-open-btn\{[^}]*display:\s*none/.test(css);
check('mobile 640 hides shortcuts-open-btn', hideShortcuts);

const btn = html.match(/<button class="features-btn"[\s\S]*?<\/button>/);
const btnHtml = btn ? btn[0] : '';
check('header button label is Convert', />\s*Convert\s*</.test(btnHtml) && !/>\s*Converter\s*</.test(btnHtml), btnHtml.slice(0, 220));
check('header convert button has an icon above the label', /<svg[\s\S]*Convert/.test(btnHtml));
check('header button does not say Features', !/>\s*Features\s*</.test(btnHtml));
check('header button points at tools-nav', /aria-controls="tools-nav"/.test(btnHtml));
check('tools-nav id exists', /id="tools-nav"/.test(html));

const scrollFn = js.match(/function scrollToFeatures\s*\([^)]*\)\s*\{[\s\S]*?\n\}/);
const body = scrollFn ? scrollFn[0] : '';
check(
  'header click scrolls to tools-nav',
  /toolsNav/.test(body) || /tools-nav/.test(body),
  body.slice(0, 220)
);
check('header click no longer scrolls to info-box', body && !/infoBox/.test(body) && !/info-box/.test(body));
check('header click no longer scrolls to view-converter', body && !/converterView/.test(body) && !/view-converter/.test(body));

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
