const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('test-results',{recursive:true});
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 await p.addInitScript(()=>{window.metrics={cls:0,lcp:0,shifts:[]};new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput){window.metrics.cls+=e.value;window.metrics.shifts.push({value:e.value,time:e.startTime,sources:e.sources.map(s=>({node:s.node?.tagName,cls:s.node?.className,previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))})}}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())window.metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});});
 const cdp=await p.context().newCDPSession(p);
 await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.goto(process.env.TEST_URL || 'http://127.0.0.1:4322/',{waitUntil:'networkidle'});await p.waitForTimeout(1500);
 const metrics=await p.evaluate(()=>({...window.metrics,resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').pop(),type:r.initiatorType,bytes:r.transferSize})),navigation:performance.getEntriesByType('navigation').map(n=>({domContentLoaded:n.domContentLoadedEventEnd,load:n.loadEventEnd}))}));
 console.log(JSON.stringify(metrics,null,2));fs.writeFileSync('test-results/performance.json',JSON.stringify(metrics,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
