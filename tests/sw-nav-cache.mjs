import fs from 'fs';
import { createContext, runInContext } from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'http://localhost';

function makeResponse(status) {
  const ok = status >= 200 && status < 300;
  return {
    ok,
    status,
    clone() { return makeResponse(status); }
  };
}

let failed = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS  ' + name);
  else {
    failed++;
    console.log('FAIL  ' + name + (detail ? ' | ' + detail : ''));
  }
}

async function runNavigate(status) {
  const puts = [];
  const cache = {
    put(req, res) {
      puts.push({ url: req.url, status: res.status, ok: res.ok });
      return Promise.resolve();
    },
    match() { return Promise.resolve(undefined); },
    addAll() { return Promise.resolve(); }
  };
  const listeners = {};
  const sandbox = createContext({
    URL,
    caches: {
      open() { return Promise.resolve(cache); },
      match() { return Promise.resolve(undefined); },
      keys() { return Promise.resolve([]); },
      delete() { return Promise.resolve(true); }
    },
    fetch() { return Promise.resolve(makeResponse(status)); },
    self: {
      location: { origin },
      skipWaiting() {},
      clients: { claim() {} },
      addEventListener(type, fn) {
        (listeners[type] = listeners[type] || []).push(fn);
      }
    }
  });
  sandbox.self.caches = sandbox.caches;
  sandbox.self.fetch = sandbox.fetch;
  runInContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), sandbox);

  const req = { method: 'GET', mode: 'navigate', url: origin + '/index.html' };
  let responded;
  const event = {
    request: req,
    respondWith(p) { responded = Promise.resolve(p); }
  };
  (listeners.fetch || []).forEach((fn) => fn(event));
  if (!responded) throw new Error('navigate fetch did not call respondWith');
  await responded;
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((r) => setTimeout(r, 10));
  return puts;
}

const puts500 = await runNavigate(500);
check(
  '500 navigation response is not cached',
  puts500.length === 0,
  'puts=' + puts500.length
);

const puts200 = await runNavigate(200);
check(
  '200 navigation response is cached',
  puts200.length === 1 && puts200[0].ok === true && puts200[0].status === 200,
  'puts=' + JSON.stringify(puts200)
);

if (failed) {
  console.log(failed + ' failed');
  process.exit(1);
}
console.log('all passed');
