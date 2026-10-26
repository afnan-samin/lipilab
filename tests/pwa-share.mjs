import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

check('html links manifest', /rel="manifest"[^>]*href="manifest\.json"/.test(html));
check('manifest short_name is LipiLab', manifest.short_name === 'LipiLab');
check('manifest display standalone', manifest.display === 'standalone');
check('manifest has 512 icon', (manifest.icons || []).some(function (i) { return i.sizes === '512x512'; }));
check('sw precaches index and engine', /index\.html/.test(sw) && /engine\.js\?v=1/.test(sw));
check('sw cache version is v75', /lipilab-v75/.test(sw));
check('sw skips waiting on install', /skipWaiting/.test(sw));
check('app registers sw.js', /serviceWorker\.register\('sw\.js'\)/.test(js));
check('share button in output header', /id="share-btn"/.test(html));
check('share uses native share then WhatsApp', /navigator\.share/.test(js) && /wa\.me/.test(js));
check('copy email helper exists', /function copySupportEmail/.test(js));
check('support copy button styled', /\.support-copy\{/.test(css));

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
