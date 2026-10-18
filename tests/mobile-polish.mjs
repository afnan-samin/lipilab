import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

const stepTitle = (css.match(/\.howto-box__step-title\{[^}]+\}/) || [''])[0];
check(
  'step title uses the same Bangla-capable font as body copy',
  /Kalpurush/.test(stepTitle) && /Manrope/.test(stepTitle),
  stepTitle.replace(/\s+/g, ' ')
);

const lastFour = css.lastIndexOf('grid-template-columns:repeat(4');
const last860 = css.lastIndexOf('@media (max-width:860px)');
const after860 = last860 >= 0 ? css.slice(last860) : '';
check(
  '860px 1-col howto rule wins over 4-col (declared later)',
  last860 > lastFour && /howto-box__steps\{\s*grid-template-columns:1fr/.test(after860)
);

const howtoTitle = (css.match(/\.howto-box__title[^}]*\{[^}]+\}/) || [''])[0];
const faqTitle = css.includes('.howto-box__title, .word-box__title, .faq-box__title')
  ? (css.match(/\.howto-box__title, \.word-box__title, \.faq-box__title\{[^}]+\}/) || [''])[0]
  : (css.match(/\.faq-box__title\{[^}]+\}/) || [''])[0];
check('howto + faq titles are extra bold', /font-weight:\s*800/.test(howtoTitle) || /font-weight:\s*800/.test(faqTitle), howtoTitle.replace(/\s+/g, ' '));

const mobile640Blocks = [];
let searchFrom = 0;
while (true) {
  const i = css.indexOf('@media (max-width:640px){', searchFrom);
  if (i < 0) break;
  let depth = 0;
  for (let j = i; j < css.length; j++) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') {
      depth--;
      if (depth === 0) {
        mobile640Blocks.push(css.slice(i, j + 1));
        searchFrom = j + 1;
        break;
      }
    }
  }
}
const mobile = mobile640Blocks.join('\n');
check(
  'mobile brand name keeps original clamp (not logo-sized)',
  !/app-brand-name\{[^}]*font-size:\s*clamp\(34px/.test(mobile)
);
check(
  'mobile LipiLab above tagline beside logo',
  /app-brand-text\{[^}]*flex-direction:\s*column/.test(mobile)
);
check(
  'mobile tagline does not sit under the logo',
  !/grid-template-areas:"logo name" "tag tag"/.test(mobile)
);
check(
  'mobile header actions share the 34px row height',
  /\.app-header__actions #theme-toggle-btn\{[^}]*height:34px/.test(mobile)
    && /\.features-btn\{[^}]*height:34px/.test(mobile)
);
check(
  'header features button label is semibold, not extra-bold',
  /\.features-btn\{[^}]*font-weight:\s*600/.test(css)
);
check('header features button has svg icon', /<svg/.test((html.match(/<button class="features-btn"[\s\S]*?<\/button>/) || [''])[0]));
check('theme toggle has Light/Dark caption', /theme-toggle__label/.test(html) && />(Light|Dark)</.test(html));
check('paste icon is clipboard-with-arrow not lined clipboard', /id="paste-btn"[\s\S]{0,900}M12 11v6/.test(html) && /id="paste-btn"[\s\S]{0,900}polyline points="9 14 12 17 15 14"/.test(html));
check(
  'mobile toast is compact (font 10px, 1.5px padding)',
  /@media \(max-width:600px\)[\s\S]{0,500}max-width:min\(190px/.test(css)
    && /@media \(max-width:600px\)[\s\S]{0,700}notif__msg\{\s*font-size:10px/.test(css)
    && /@media \(max-width:600px\)[\s\S]{0,700}\.notif\{\s*padding:1\.5px/.test(css)
);
check(
  'mobile toast hugs the right edge',
  /@media \(max-width:600px\)[\s\S]{0,500}right:4px/.test(css)
    && /\.notif-container\{[^}]*align-items:flex-end/.test(css)
);
check(
  'mobile toast close button has a large tap target',
  /@media \(max-width:600px\)[\s\S]{0,900}notif__close\{\s*width:20px;\s*height:20px/.test(css)
    && /@media \(max-width:600px\)[\s\S]{0,900}notif__close \.icon\{\s*width:14px/.test(css)
);

check(
  'mobile direction labels say Unicode not Uni',
  /dir-label--short[^<]*Unicode/.test(html)
    || /dir-label--short">Unicode/.test(html)
    || (/Uni → Bijoy/.test(html) === false && /Unicode → Bijoy/.test(html))
);
check(
  'short Uni labels are gone',
  !/dir-label--short">Uni → Bijoy</.test(html) && !/dir-label--short">Bijoy → Uni</.test(html)
);

check(
  'word box title is Bangla how-to',
  html.includes('id="word-box-title">Word ফাইল কীভাবে কনভার্ট করবেন!')
);

const howtoBox = (css.match(/\.howto-box\{[^}]+\}/) || [''])[0];
const howtoTitleRule = (css.match(/\.howto-box__title\{[^}]+\}/) || [''])[0]
  || (css.match(/\.howto-box__title,[^{]*\{[^}]+\}/) || [''])[0];
const stepTitleRule = (css.match(/\.howto-box__step-title\{[^}]+\}/) || [''])[0];
const stepCard = (css.match(/\.howto-box__step\{[^}]+\}/) || [''])[0];
check(
  'howto card title uses header tint',
  /header-tint/.test(howtoTitleRule),
  howtoTitleRule.replace(/\s+/g, ' ')
);
check(
  'howto step titles use header/primary color',
  /--primary|--header-tint/.test(stepTitleRule),
  stepTitleRule.replace(/\s+/g, ' ')
);
check(
  'howto step titles are extra bold',
  /font-weight:\s*800/.test(stepTitleRule),
  stepTitleRule.replace(/\s+/g, ' ')
);
const stepHead = (css.match(/\.howto-box__step-head\{[^}]+\}/) || [''])[0];
check(
  'howto step titles have green tint background',
  /header-tint/.test(stepHead) || /header-tint/.test(stepTitleRule) || /header-tint/.test(stepCard),
  stepHead.replace(/\s+/g, ' ')
);
check(
  'howto card has no brand stroke',
  !/border:[^;]*var\(--(?:accent|primary|tertiary)\)/.test(howtoBox),
  howtoBox.replace(/\s+/g, ' ')
);
check(
  'howto step cards have no brand stroke',
  !/border:[^;]*var\(--(?:accent|primary|tertiary)\)/.test(stepCard),
  stepCard.replace(/\s+/g, ' ')
);
const numRule = (css.match(/\.howto-box__num\{[^}]+\}/) || [''])[0];
check(
  'step number and heading sit on one line',
  /display:\s*(?:inline-flex|flex)/.test(stepHead) || /display:\s*(?:inline-flex|flex)/.test(stepCard) || /display:\s*inline/.test(numRule) && /display:\s*inline/.test(stepTitleRule)
);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
