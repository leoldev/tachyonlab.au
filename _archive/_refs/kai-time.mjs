import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const CHROME='/Users/ldpleo/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const port=9788; const proc=spawn(CHROME,[`--remote-debugging-port=${port}`,'--headless=new','--hide-scrollbars','--mute-audio','--no-first-run','--window-size=1440,900','--user-data-dir=/tmp/cdp-time','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws;
for(let i=0;i<60;i++){try{const j=await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();if(j.webSocketDebuggerUrl){ws=new WebSocket(j.webSocketDebuggerUrl);break;}}catch{} await sleep(150);}
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pend=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}});
const send=(method,params={},sessionId)=>new Promise(res=>{const i=++id;pend.set(i,res);ws.send(JSON.stringify({id:i,method,params,...(sessionId?{sessionId}:{})}));});
const {result:{targetId}}=await send('Target.createTarget',{url:'about:blank'});
const {result:{sessionId}}=await send('Target.attachToTarget',{targetId,flatten:true});
const S=(m,p)=>send(m,p,sessionId);
await S('Page.enable'); await S('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const t0=Date.now();
await S('Page.navigate',{url:'https://www.kai-group.com/global/design/'});
for(let i=0;i<24;i++){
  await sleep(120);
  const shot=await S('Page.captureScreenshot',{format:'png'});
  if(shot.result?.data) writeFileSync(`kai-intro-${String(i).padStart(2,'0')}.png`,Buffer.from(shot.result.data,'base64'));
}
const navEnd=Date.now()-t0;
// now one wheel event, sample settle
await sleep(1500);
const before=await S('Page.captureScreenshot',{format:'png'});
writeFileSync('kai-wheel-before.png',Buffer.from(before.result.data,'base64'));
await S('Input.dispatchMouseEvent',{type:'mouseWheel',x:720,y:450,deltaX:0,deltaY:800,pointerType:'mouse'});
const t1=Date.now(); const times=[];
for(let i=0;i<20;i++){
  await sleep(100);
  const shot=await S('Page.captureScreenshot',{format:'png'});
  if(shot.result?.data) writeFileSync(`kai-wheel-${String(i).padStart(2,'0')}.png`,Buffer.from(shot.result.data,'base64'));
  times.push(Date.now()-t1);
}
console.log(JSON.stringify({navEnd, times}));
ws.close();proc.kill('SIGKILL');process.exit(0);
