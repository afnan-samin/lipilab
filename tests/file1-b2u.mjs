import fs from 'fs';
import { createContext, runInContext } from 'vm';

const src = fs.readFileSync('/tmp/lipilab-live/engine.js', 'utf8');
const ctx = createContext({ console });
runInContext(src + '\nthis.ConvertToUnicode = ConvertToUnicode;\nthis.ConvertToASCII = ConvertToASCII;\n', ctx);

function assertEq(a, b, msg) {
  if (a !== b) throw new Error('FAIL: ' + msg + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a));
}

const tests = [
  ['সাম্রাজ্য', 'mv¤ªvR¨'],
  ['তাম্রলিপি', 'Zv¤ªwjwc'],
  ['সম্রাট', 'm¤ªvU'],
  ['নিম্ন', 'wb¤œ'],
  ['জ্বালা', 'R¦vjv'],
  ['তত্ত্বের', 'Z‡Ë¦i'],
  ['পার্শ্বে', 'cv‡k©¦'],
  ['বঙ্গ', 'e•M'],
  ['আকাঙ্ক্ষা', 'AvKv•ÿv'],
  ['লক্ষ্মণ', 'jÿ¥Y'],
  ['লক্ষ্ণৌ', 'j‡ÿèŠ'],
  ['ব্লু', 'eyø'],
  ['উল্লেখ', 'D‡j&øL'],
  ['বস্তু', 'e¯ÍÍy'],
  ['ত্ত্ব', 'Ë¡'],
  ['প্রত্নতত্ত্ব', 'cÖZœZË¡'],
  ['সন্দ্বীপ', 'm›Øxc'],
  ['নিষ্পত্তি', 'wb®úwË']
];

let pass = 0, fail = 0;
for (const [uni, bij] of tests) {
  try {
    assertEq(ctx.ConvertToUnicode(bij), uni, uni);
    pass++;
    console.log('  PASS  ' + uni);
  } catch (e) {
    fail++;
    console.log('  FAIL  ' + uni);
    console.log('        ' + e.message);
  }
}
console.log('file1-b2u: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
