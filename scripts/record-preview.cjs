const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:4322/',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';await img.decode()}});
 await page.waitForTimeout(900);
 const encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','image2pipe','-framerate','14','-vcodec','mjpeg','-i','pipe:0','-vf','scale=1024:720','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-an','-y','/workspace/previews/Website-motion-walkthrough.mp4'],{stdio:['pipe','ignore','pipe']});
 let error='';encoder.stderr.on('data',data=>error+=data);
 const full=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 for(let frame=0;frame<280;frame++){
   const progress=Math.min(1,Math.max(0,(frame-22)/238));
   await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),Math.round(full*progress));
   await page.waitForTimeout(30);
   const shot=await page.screenshot({type:'jpeg',quality:85});
   if(!encoder.stdin.write(shot))await once(encoder.stdin,'drain');
 }
 encoder.stdin.end();const [code]=await once(encoder,'exit');
 await browser.close();if(code!==0)throw Error(error);
 console.log('20-second actual browser walkthrough created; no Higgsfield footage is represented.');
})().catch(error=>{console.error(error);process.exit(1)});
