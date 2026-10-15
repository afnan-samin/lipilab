import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

check('logo-full.svg present', exists('logo-full.svg'));
check('favicon.svg present', exists('favicon.svg'));
check('favicon-180.png present', exists('favicon-180.png'));

const fav = exists('favicon.svg') ? fs.readFileSync(path.join(root, 'favicon.svg'), 'utf8') : '';
check('favicon is the new pixel-ল mark', /viewBox="0 0 1024 1024"/.test(fav) && /#0a5c40/.test(fav));
check('old Kalpurush letter favicon is gone', !/<text[\s\S]*ল/.test(fav));

check('header uses logo-full.svg', /class="app-logo"[\s\S]{0,80}logo-full\.svg/.test(html) || /src="logo-full\.svg/.test(html));
check('old inline letter logo is gone', !/app-logo__letter/.test(html));
check('apple-touch-icon is favicon-180.png', /rel="apple-touch-icon"[^>]*href="favicon-180\.png\?v=/.test(html));
check('tab icon is favicon.svg with cache-bust', /rel="icon"[^>]*type="image\/svg\+xml"[^>]*href="favicon\.svg\?v=/.test(html));
check('png favicon fallback with cache-bust', /rel="icon"[^>]*type="image\/png"[^>]*href="favicon-32\.png\?v=/.test(html));
check('header logo cache-bust', /src="logo-full\.svg\?v=/.test(html));

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
