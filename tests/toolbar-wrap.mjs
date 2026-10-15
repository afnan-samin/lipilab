import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

function block(re) {
  const m = css.match(re);
  return m ? m[0] : '';
}

const desktopToolbar = block(/\.app-toolbar\{[^}]+\}/);
check(
  'desktop toolbar nowrap so direction/Live/fonts/Convert stay one row',
  /flex-wrap:\s*nowrap/.test(desktopToolbar),
  desktopToolbar.replace(/\s+/g, ' ').slice(0, 180)
);

const mobile640 = block(/@media \(max-width:640px\)\{[\s\S]*?\.app-toolbar\{[^}]+\}/);
const mobileToolbar = (mobile640.match(/\.app-toolbar\{[^}]+\}/) || [''])[0];
check(
  'mobile 640 toolbar stacks as a column so rows stay coherent',
  /flex-direction:\s*column/.test(mobileToolbar),
  mobileToolbar.replace(/\s+/g, ' ').slice(0, 180)
);

check(
  'mobile 640 still puts Live+Convert on one row',
  /@media \(max-width:640px\)[\s\S]*\.toolbar-live-convert\{[^}]*display:\s*flex/.test(css)
);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('All toolbar-wrap checks passed');
