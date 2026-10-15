import fs from 'fs';
import { createContext, runInContext } from 'vm';

const src = fs.readFileSync('/tmp/lipilab-live/engine.js', 'utf8');
const ctx = createContext({ console });
runInContext(src + '\nthis.ConvertToUnicode = ConvertToUnicode;\nthis.ConvertToASCII = ConvertToASCII;\n', ctx);

function assertEq(a, b, msg) {
  if (a !== b) throw new Error('FAIL: ' + msg + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a));
}

const tests = [
  ['ফিল্ম', 'wdj¥'],
  ['গুল্মা', '¸j¥v'],
  ['ষাণ্মাসিক', 'lvY¥vwmK'],
  ['সাইক্লোন', 'mvB‡Køvb'],
  ['কোম্পানি', '†Kv¤cvwb'],
  ['অলিম্পিক', 'Awjw¤cK'],
  ['সম্পদ', 'm¤c`'],
  ['সম্প্রচার', 'm¤cÖPvi'],
  ['সম্পাদন', 'm¤cv`b'],
  ['সম্পন্ন', 'm¤cbœ'],
  ['টেম্পারা', '†U¤cviv'],
  ['প্ল্যান্ট', 'c­v›U'],
  ['গুপ্তা', '¸c&Ív']
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
console.log('file2-b2u: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
