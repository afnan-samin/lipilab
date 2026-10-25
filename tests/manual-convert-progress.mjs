import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

const convertClick = (js.match(/els\.convertBtn\.addEventListener\('click', function \(\) \{[\s\S]*?\n  \}\);/) || [''])[0];
const liveModeChange = (js.match(/input\[name="conversion-direction"\][\s\S]{0,500}if \(appState\.liveMode\) convertPlainText\(\)/) || [''])[0];
const syncFn = (js.match(/function convertPlainTextSync[\s\S]*?function convertLeavingUnicodeBangla/) || [''])[0];
const chunkedFn = (js.match(/function convertPlainTextChunked[\s\S]*?function ASK_KEY|function convertPlainTextChunked[\s\S]*?SPOTS/) || [''])[0];

check(
  'live mode-change converts with convertPlainText',
  /if \(appState\.liveMode\) convertPlainText\(\)/.test(liveModeChange),
  liveModeChange.slice(0, 180)
);
check(
  'Convert click uses convertPlainText like live mode-change',
  /convertPlainText\(\)/.test(convertClick) && !/startManualConvert\('Converting…', convertPlainText\)/.test(convertClick),
  convertClick.slice(0, 280)
);
check(
  'Convert click still uses startManualConvert for DOCX',
  /startManualConvert\('Converting DOCX…', convertDocxTemplate\)/.test(convertClick)
);
check(
  'sync convert has no fake progress animation',
  /showConversionSuccess\(mode\)/.test(syncFn) && !/playManualConvertProgress/.test(syncFn) && !/easeOutCubic/.test(syncFn),
  'fake bar still in sync path'
);
check(
  'chunked convert reports real work percent like live',
  /showProcessing\(true, 'Converting…', 0\)/.test(chunkedFn)
  && /showProcessing\(true, 'Converting…', total \? \(idx \/ total\) \* 100 : 100\)/.test(chunkedFn)
  && !/if \(appState\.liveMode\) showProcessing\(true, 'Converting…', 0\)/.test(chunkedFn)
  && !/playManualConvertProgress/.test(chunkedFn),
  'chunked path still branches on liveMode'
);
check(
  'no fake ease-out convert bar helper',
  !/function playManualConvertProgress/.test(js) && !/function easeOutCubic/.test(js)
);
check(
  'progress fill keeps live transition',
  /\.processing-progress__fill\{[^}]*transition:width 0\.12s linear/.test(css)
);
check('html cache-bust app.js v=59', /app\.js\?v=59/.test(html));

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
