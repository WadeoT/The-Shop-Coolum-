const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.TEST_URL || 'http://127.0.0.1:4322';
const routes = ['/', '/coffee-food/', '/groceries/', '/local/', '/our-story/', '/visit/', '/image-notes/', '/404.html'];
const results = [];
(async () => {
  fs.mkdirSync('test-results', { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'], headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [], failed = [], links = new Set();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/404.html')) failed.push(response.status() + ' ' + response.url()); });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (const img of document.images) { img.loading = 'eager'; await img.decode(); }
      document.querySelectorAll('[data-reveal],[data-thread],.steam').forEach(el => el.classList.add('is-visible'));
    });
    assert.equal(await page.locator('h1').count(), 1, route + ' should have one h1');
    assert(await page.title(), route + ' needs a title');
    const broken = await page.evaluate(() => [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src));
    assert.deepEqual(broken, [], route + ' broken images');
    const found = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
    found.filter(link => link.startsWith('/') || link.startsWith('#')).forEach(link => links.add(new URL(link, base + route).href));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const violations = axe.violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}));
    results.push({route,accessibility:violations});
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, viewport: innerWidth, elements: [...document.querySelectorAll('main *,header *,footer *')].filter(el => {const r=el.getBoundingClientRect(); return r.width>0 && (r.right > innerWidth+1 || r.left < -1) && !el.closest('.brand-strip') && getComputedStyle(el).position !== 'absolute' && !el.closest('.photo') && !el.closest('.coastal-lines')}).map(el=>el.tagName+'.'+el.className)}));
      assert(overflow.doc <= width + 1, `${route} overflows at ${width}: ${JSON.stringify(overflow)}`);
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(150);
    await page.screenshot({path:`test-results/${route === '/' ? 'home' : route.replaceAll('/','').replace('.html','')}-desktop.png`, fullPage:true});
  }
  for (const link of links) {
    const url = new URL(link);
    const response = await page.request.get(url.origin + url.pathname);
    assert(response.ok(), 'Broken internal link: ' + link);
    if (url.hash) {
      const html = await response.text();
      assert(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), 'Broken fragment: ' + link);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base, {waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
  assert(await page.locator('#main').evaluate(el=>el.inert));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  assert(await page.locator('.menu-toggle').evaluate(el=>el === document.activeElement));
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.locator('.mobile-nav').getByRole('link',{name:'Coffee + Food'}).click();
  await page.waitForURL('**/coffee-food/');
  await page.goto(base + '/visit/', {waitUntil:'networkidle'});
  await page.locator('summary').first().click();
  assert(await page.locator('details').first().getAttribute('open') !== null);
  assert.equal(await page.locator('.phone-link').getAttribute('href'),'tel:+61400301078');
  assert((await page.getByRole('link',{name:'Get directions',exact:true}).getAttribute('href')).includes('api=1&destination='));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Pause decorative motion'}).click();
  assert.equal(await page.locator('.strip-track').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  await page.reload();
  assert(await page.locator('html').evaluate(el=>el.classList.contains('motion-paused')));
  await page.getByRole('button',{name:'Resume decorative motion'}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.strip-track').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('#discover').scrollIntoViewIfNeeded();
  assert(await page.locator('#discover').isVisible());
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)});
  await page.evaluate(async()=>{for(const img of document.images){img.loading='eager';await img.decode()}scrollTo({top:0,behavior:'instant'})});
  await page.waitForTimeout(1000);
  await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
  const violations = results.flatMap(r=>r.accessibility.map(v=>({route:r.route,...v})));
  fs.writeFileSync('test-results/a11y.json',JSON.stringify(violations,null,2));
  assert.deepEqual(errors,[],'Browser errors');
  assert.deepEqual(failed,[],'Failed requests');
  console.log(JSON.stringify({pages:routes.length,responsiveChecks:routes.length*5,internalLinks:links.size,browserErrors:errors,failedRequests:failed,accessibilityViolations:violations.length,mobileNavigation:'passed',contactLinks:'passed',reducedMotion:'passed',motionPreference:'passed'},null,2));
  await browser.close();
  assert.equal(violations.length,0,'Accessibility violations; see test-results/a11y.json');
})().catch(error=>{console.error(error);process.exit(1)});
