import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

function idx(id) {
  const i = html.indexOf('id="' + id + '"');
  if (i < 0) throw new Error('missing id=' + id);
  return i;
}

function sliceBetween(startId, endId) {
  const a = html.indexOf('id="' + startId + '"');
  const b = endId ? html.indexOf('id="' + endId + '"') : html.length;
  if (a < 0) throw new Error('missing ' + startId);
  return html.slice(a, b < 0 ? html.length : b);
}

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

const order = [
  'spot-top', 'info-box', 'view-converter', 'howto-box', 'spot-bottom',
  'word-box', 'spot-after-word', 'faq-box', 'spot-mid', 'support-box', 'spot-after-support'
];
for (let i = 1; i < order.length; i++) {
  check('order ' + order[i - 1] + ' before ' + order[i], idx(order[i - 1]) < idx(order[i]));
}

check('features before converter', idx('info-box') < idx('view-converter'));
check('howto after converter', idx('view-converter') < idx('howto-box'));

const howto = sliceBetween('howto-box', 'spot-bottom');
check('howto title', howto.includes('কীভাবে ব্যবহার করবেন'));
check('howto intro', howto.includes('বাংলা লেখা বা Word ফাইল রূপান্তর করতে নিচের ধাপগুলো অনুসরণ করুন।'));
check('step 1 heading', howto.includes('বাংলা লেখা পেস্ট করুন'));
check('step 2 heading', howto.includes('কনভার্সন মোড বেছে নিন'));
check('step 3 heading', howto.includes('কনভার্ট করে ফলাফল দেখুন'));
check('step 4 heading', howto.includes('কপি করুন বা ডাউনলোড করুন'));
check('howto lists DOCX and TXT', /DOCX/.test(howto) && /TXT/.test(howto));
check('howto does not list PDF as supported', !/\bPDF\b/.test(howto));
check('four step articles', (howto.match(/class="howto-box__step"/g) || []).length === 4);

const word = sliceBetween('word-box', 'spot-after-word');
check('word title', word.includes('Word ফাইল কীভাবে কনভার্ট করবেন!'));
check('word CTA', word.includes('id="word-cta-btn"') && word.includes('Convert a Word File'));
check('word CTA is a button', /<button[^>]*id="word-cta-btn"/.test(word));

const faq = sliceBetween('faq-box', 'spot-mid');
check('faq title', faq.includes('সাধারণ জিজ্ঞাসা'));
const details = faq.match(/<details\b/g) || [];
check('seven FAQ details', details.length === 7, 'count=' + details.length);
check('details start closed (no open attr)', !/<details[^>]*\sopen\b/.test(faq));
check('faq account question', faq.includes('LipiLab ব্যবহার করতে কি অ্যাকাউন্ট খুলতে হবে?'));
check('faq privacy answer is browser-side', faq.includes('আপনার ব্রাউজারেই সম্পন্ন হয়'));
check('faq mixed word', faq.includes('একই Word ফাইলে বাংলা ও ইংরেজি'));
check('faq spell/related coming', faq.includes('Spell Check ও Related ফিচারগুলো কোথায় পাব?'));

check('features copy untouched', html.includes('LipiLab দিয়ে কী কী করা যায়?'));
check('support copy untouched', html.includes('unknownacone@gmail.com'));
check('css has howto-box', css.includes('.howto-box'));
check('css has faq summary', css.includes('.faq-box__item'));
check('css 640px stacks howto steps', /@media \(max-width:640px\)[\s\S]*howto-box__steps\{ grid-template-columns:1fr; \}/.test(css));
check('css 860px stacks howto like converter', /@media \(max-width:860px\)[\s\S]*howto-box__steps\{ grid-template-columns:1fr; \}/.test(css));
check('no new breakpoint 768', !/@media \(max-width:768px\)/.test(css));
check('upload nudge keyframes', css.includes('@keyframes upload-nudge'));
check('nudge uses transform', /upload-nudge[\s\S]{0,120}translateY/.test(css));

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
