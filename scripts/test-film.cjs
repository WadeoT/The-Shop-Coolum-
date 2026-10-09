// The synthetic fixture tests seeking only; it is never a website asset.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
fs.mkdirSync('test-results',{recursive:true});
execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','testsrc2=duration=4:size=320x180:rate=24','-c:v','libx264','-preset','fast','-crf','30','-g','1','-pix_fmt','yuv420p','-movflags','+faststart','-an','-y','test-results/qa-seek.mp4']);
const base=process.env.TEST_URL || 'http://127.0.0.1:4322';
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 const buffer=fs.readFileSync('test-results/qa-seek.mp4');
 let requests=0;
 await p.route('**/__qa__/seek.mp4',async route=>{
  requests++;
  const range=route.request().headers()['range'];
  if(range){const [a,z]=range.replace('bytes=','').split('-');const start=Number(a),end=z?Math.min(Number(z),buffer.length-1):buffer.length-1;await route.fulfill({status:206,headers:{'content-type':'video/mp4','accept-ranges':'bytes','content-range':`bytes ${start}-${end}/${buffer.length}`,'content-length':String(end-start+1)},body:buffer.subarray(start,end+1)});}
  else await route.fulfill({status:200,contentType:'video/mp4',body:buffer});
 });
 await p.goto(base,{waitUntil:'networkidle'});
 await p.evaluate(async()=>{const m=await import('/js/motion.js');window.filmCleanup=m.initScrollFilm(document.querySelector('[data-film-story]'),'/__qa__/seek.mp4')});
 await p.locator('[data-film-story]').scrollIntoViewIfNeeded();
 await p.waitForFunction(()=>document.querySelector('[data-film-story]').classList.contains('film-ready'));
 const seek=async fraction=>{
  await p.evaluate(f=>{const el=document.querySelector('[data-film-story]');const h=document.querySelector('header').getBoundingClientRect().height;const top=el.getBoundingClientRect().top+scrollY-h;const distance=el.offsetHeight-(innerHeight-h);scrollTo({top:top+distance*f,behavior:'instant'})},fraction);
  await p.waitForFunction(f=>{const v=document.querySelector('.scroll-film');return !v.seeking && Math.abs(v.currentTime-f*(v.duration-.04))<.08},fraction);
  return await p.locator('video').evaluate(v=>({time:v.currentTime,paused:v.paused,duration:v.duration}));
 };
 const first=await seek(.2),last=await seek(.8),reverse=await seek(.35);
 assert(last.time>first.time);assert(reverse.time<last.time);assert(first.paused&&last.paused&&reverse.paused);
 const held=reverse.time;await p.waitForTimeout(350);assert.equal(await p.locator('video').evaluate(v=>v.currentTime),held,'must not autoplay');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>!document.querySelector('.film-ready'));assert.equal(await p.locator('.film-ready').count(),0);
 await p.emulateMedia({reducedMotion:'no-preference'});await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>!document.querySelector('.film-ready'));assert.equal(await p.locator('.film-ready').count(),0);
 await p.evaluate(()=>window.filmCleanup());
 await p.setViewportSize({width:1440,height:1000});
 await p.route('**/__qa__/missing.mp4',r=>r.fulfill({status:404,body:'Missing QA file'}));
 await p.evaluate(async()=>{const m=await import('/js/motion.js');m.initScrollFilm(document.querySelector('[data-film-story]'),'/__qa__/missing.mp4')});
 await p.locator('[data-film-story]').scrollIntoViewIfNeeded();await p.waitForTimeout(500);
 assert.equal(await p.locator('.film-ready').count(),0);assert(await p.locator('#coffee-heading').isVisible());assert(await p.locator('.coffee-photo img').isVisible());
 console.log(JSON.stringify({forward:first.time+' -> '+last.time,backward:last.time+' -> '+reverse.time,autoplay:false,reducedMotion:'passed',mobileUnpinned:'passed',failureFallback:'passed',fixtureOnly:true},null,2));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
