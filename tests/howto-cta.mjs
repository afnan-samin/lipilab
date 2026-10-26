import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

let failed = 0;
function check(name, cond) {
  if (cond) console.log('PASS  ' + name);
  else { failed++; console.log('FAIL  ' + name); }
}

check('scrollToConverterInput exists', /function scrollToConverterInput\s*\(/.test(js));
check('scrolls to file-upload-btn', /scrollToConverterInput[\s\S]{0,500}file-upload-btn/.test(js));
check('nudgeUploadBtn exists', /function nudgeUploadBtn\s*\(/.test(js));
check('nudge adds is-nudging', /classList\.add\('is-nudging'\)/.test(js));
check('nudge respects reduced motion', /prefers-reduced-motion/.test(js));
check('wordCtaBtn wired', /wordCtaBtn/.test(js) && /scrollToConverterInput/.test(js));
check('upload btn id in html', /id="file-upload-btn"/.test(html));
check('html cache-bust app.js v=61', /app\.js\?v=61/.test(html));
check('engine.js still v=1', /engine\.js\?v=1/.test(html));
check('nudge keyframes 3 times', /animation:\s*upload-nudge\s*\.28s\s*ease-out\s*3/.test(css));
check('nudge uses translateY', /@keyframes upload-nudge[\s\S]{0,180}translateY/.test(css));

if (failed) { console.log(failed + ' failed'); process.exit(1); }
console.log('all passed');
