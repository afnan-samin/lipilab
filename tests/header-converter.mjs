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
check('header button starts on Features label', /id="features-btn-label">ফিচার সমূহ</.test(btnHtml), btnHtml.slice(0, 260));
check('header button has no icon, text only', !/<svg/.test(btnHtml));
check('header button points at info-box', /aria-controls="info-box"/.test(btnHtml));
check('info-box id exists', /id="info-box"/.test(html));

const navSections = js.match(/var NAV_SECTIONS = \[[\s\S]*?\n\];/);
const navBody = navSections ? navSections[0] : '';
check(
  'section chain runs converter to support',
  ['view-converter', 'info-box', 'howto-box', 'word-box', 'faq-box', 'support-box']
    .every(function (id) { return navBody.indexOf("id: '" + id + "'") !== -1; }),
  navBody.slice(0, 220)
);
check('header click advances to the next section', /featuresOpenBtn\.addEventListener\('click', goToNextSection\)/.test(js));
check('full section names, no abbreviations', /label: 'ফাইল আপলোড নিয়মাবলী'/.test(js) && !/short:/.test(js));
check('header labels are Bangla', /label: 'ফিচার সমূহ'/.test(js) && /label: 'কীভাবে ব্যবহার করবেন'/.test(js) && /label: 'সাধারণ প্রশ্ন'/.test(js));
check('header labels have no ! or ?', !/label: '[^']*[!?]'/.test(js));
check('click targets the label the user sees', /var destination = navTargetIndex;/.test(js));
check(
  'scroll spy picks the next card after the current one',
  /function syncNavFromScroll[\s\S]*?navCurrentIndex\(\) \+ 1/.test(js)
);
check('width transition is declared', /\.features-btn\{[^}]*transition:[^}]*width/.test(css));
check('measurement twin is off-screen', /\.nav-measure\{[^}]*left:-9999px/.test(css));
check('back-to-top button exists', /id="to-top-btn"/.test(html));
check('back-to-top shows after scroll', /function updateToTopButton[\s\S]*?pageYOffset > 600/.test(js));
check('page end counts as the last section', /function navAtPageEnd[\s\S]*?navAtPageEnd\(\)\) return NAV_SECTIONS.length - 1/.test(js));
check('to-top grows and uses surface on hover', /\.to-top\{[^}]*width:54px/.test(css) && /\.to-top:hover\{[^}]*background:var\(--surface\)/.test(css));
check('to-top default is primary fill', /\.to-top\{[^}]*background:var\(--primary\)/.test(css));
check('toast radius is 5px and desktop text is compact', /\.notif\{[^}]*border-radius:5px/.test(css) && /\.notif__msg\{[^}]*font-size:13\.5px/.test(css));
check('desktop toast keeps leading icon', /\.notif__icon\{/.test(css) && /NOTIF_ICONS/.test(js));
check('one --radius token is 10px', /--radius:10px/.test(css) && /--radius-sm:var\(--radius\)/.test(css) && /--radius-md:var\(--radius\)/.test(css) && /--radius-lg:var\(--radius\)/.test(css) && /--radius-pill:var\(--radius\)/.test(css));
check('toast inverts: primary fill, contrast text', /\.notif\{[^}]*background:var\(--primary\)/.test(css) && /\.notif__msg\{[^}]*color:var\(--primary-contrast\)/.test(css));
check('dark header nav uses white text', /\[data-theme="dark"\] \.features-btn\{[^}]*color:#ffffff/.test(css));
check('header nav button uses Bangla face', /\.features-btn\{[^}]*font-family:var\(--font-kalpurush\)/.test(css));
check('header nav button does not clip glyphs', /\.features-btn\{[^}]*overflow:visible/.test(css) && /\.features-btn__label\{[^}]*overflow:visible/.test(css));
check('ask card reappears every 12 hours', /ASK_REASK_MS = 12 \* 60 \* 60 \* 1000/.test(js));
check('swap button is a circle', /\.swap-btn\{[^}]*border-radius:50%/.test(css));
check('drop shadows are off', /--shadow-sm:none/.test(css) && /--shadow-md:none/.test(css) && /--shadow-lg:none/.test(css));

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
