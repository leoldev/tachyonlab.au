// Minimal CDP driver: navigate, wait, screenshot, evaluate.
// usage: node cdp.mjs <url> <out.png> <width> <height> <waitMs> [evalFile]
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const CHROME = '/Users/ldpleo/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const [url, out, w = '1440', h = '900', waitMs = '6000', evalFile, scrollSteps = '0', scrollPx = '0'] = process.argv.slice(2);
const port = 9333 + Math.floor(Math.random() * 400);

const proc = spawn(CHROME, [
  `--remote-debugging-port=${port}`,
  '--headless=new', '--hide-scrollbars', '--mute-audio',
  '--no-first-run', '--no-default-browser-check',
  '--disable-dev-shm-usage', '--force-device-scale-factor=1',
  `--window-size=${w},${h}`,
  '--user-data-dir=/tmp/cdp-' + port,
  'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getWS() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error('no debugger');
}

const wsUrl = await getWS();
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));

let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  else if (m.method) events.push(m);
});
function send(method, params = {}, sessionId) {
  const msgId = ++id;
  return new Promise(res => {
    pending.set(msgId, res);
    ws.send(JSON.stringify({ id: msgId, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);

await S('Page.enable');
await S('Runtime.enable');
await S('Emulation.setDeviceMetricsOverride', {
  width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 500,
});
await S('Page.navigate', { url });

// wait for load event or timeout
const loadStart = Date.now();
while (Date.now() - loadStart < 30000) {
  if (events.some(e => e.method === 'Page.loadEventFired')) break;
  await sleep(100);
}

await sleep(+waitMs);

// optional stepped scroll captures: out gets -0..-n suffix
const steps = +scrollSteps, px = +scrollPx;
if (steps > 0) {
  const { writeFileSync: wf } = await import('node:fs');
  for (let i = 0; i <= steps; i++) {
    if (i > 0) {
      await S('Input.dispatchMouseEvent', { type: 'mouseWheel', x: +w/2, y: +h/2, deltaX: 0, deltaY: px, pointerType: 'mouse' });
      await sleep(1200);
    }
    const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    if (shot.result?.data) wf(out.replace(/\.png$/, '') + '-' + i + '.png', Buffer.from(shot.result.data, 'base64'));
  }
}

// optional eval
let evalOut = null;
if (evalFile && existsSync(evalFile)) {
  const expr = readFileSync(evalFile, 'utf8');
  const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  evalOut = r.result?.result?.value ?? r.result?.exceptionDetails ?? null;
}

if (out && out !== '-') {
  const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  if (shot.result?.data) writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
}

console.log(JSON.stringify({ url, waitMs: +waitMs, evalOut }, null, 2));
ws.close();
proc.kill('SIGKILL');
process.exit(0);
