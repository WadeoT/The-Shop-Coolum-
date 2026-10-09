const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 901px)');
const root = document.documentElement;
let paused = false;
try { paused = sessionStorage.getItem('shop-motion-paused') === 'true'; } catch {}
const isStill = () => reduced.matches || paused;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
root.classList.toggle('motion-enabled', !isStill());
root.classList.toggle('motion-paused', paused);

// The navigation remains ordinary links. The mobile overlay supports Escape,
// focus containment, outside navigation, and restores the trigger's focus.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.mobile-nav');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
function menu(open, restoreFocus = false) {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.menu-word').textContent = open ? 'Close' : 'Menu';
  nav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (main) main.inert = open;
  if (footer) footer.inert = open;
  if (open) nav.querySelector('a')?.focus({ preventScroll: true });
  else if (restoreFocus) toggle.focus();
}
toggle?.addEventListener('click', () => menu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', event => { if (event.target.closest('a')) menu(false); });
document.addEventListener('keydown', event => {
  if (nav?.hidden !== false) return;
  if (event.key === 'Escape') { event.preventDefault(); menu(false, true); }
  if (event.key !== 'Tab') return;
  const items = [toggle, ...nav.querySelectorAll('a[href]')];
  const index = items.indexOf(document.activeElement);
  if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus(); }
  else if (!event.shiftKey && index === items.length - 1) { event.preventDefault(); toggle.focus(); }
});
matchMedia('(max-width: 700px)').addEventListener('change', event => { if (!event.matches) menu(false); });

const motionButton = document.querySelector('.motion-toggle');
function applyPreference() {
  root.classList.toggle('motion-enabled', !isStill());
  root.classList.toggle('motion-paused', paused);
  motionButton?.setAttribute('aria-pressed', String(paused));
  motionButton?.setAttribute('aria-label', paused ? 'Resume decorative motion' : 'Pause decorative motion');
  motionButton?.querySelector('svg')?.replaceChildren();
  if (motionButton) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paused ? 'M2 1L11 7 2 13Z' : 'M3 1v12M9 1v12');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', paused ? '1' : '2');
    path.setAttribute('fill', paused ? 'currentColor' : 'none');
    motionButton.querySelector('svg').append(path);
  }
  document.dispatchEvent(new Event('shop:motion-change'));
  schedule();
}
motionButton?.addEventListener('click', () => {
  paused = !paused;
  try { sessionStorage.setItem('shop-motion-paused', String(paused)); } catch {}
  applyPreference();
});
reduced.addEventListener('change', applyPreference);

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }
}, { threshold: .13 });
document.querySelectorAll('[data-reveal], [data-thread], .steam').forEach(el => observer.observe(el));

// Read active element geometry in one batch; write transforms in another.
// One requested frame per scroll, no permanent RAF loop or scroll hijacking.
const parallax = [...document.querySelectorAll('[data-parallax]')];
const activePhotos = new Set();
const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? activePhotos.add(entry.target) : activePhotos.delete(entry.target));
  schedule();
}, { rootMargin: '80px' });
parallax.forEach(el => activeObserver.observe(el));
let frame = 0;
const header = document.querySelector('[data-header]');
function update() {
  frame = 0;
  const y = scrollY;
  const height = innerHeight;
  const measured = (!isStill() && innerWidth > 700) ? [...activePhotos].map(el => ({el, rect: el.getBoundingClientRect()})) : [];
  header?.classList.toggle('scrolled', y > 20);
  for (const {el, rect} of measured) {
    const progress = clamp((height - rect.top) / (height + rect.height));
    const travel = Math.min(35, rect.height * .045);
    el.style.setProperty('--parallax-y', `${((progress - .5) * travel * 2).toFixed(2)}px`);
  }
}
function schedule() { if (!frame) frame = requestAnimationFrame(update); }
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
applyPreference();

/** Genuine scroll-to-time controller. Empty src leaves an ordinary static
 * coffee feature. Only a decodable, approved film enables the pinned scene.
 * Exported to allow browser verification against a clearly separate QA film.
 */
export function initScrollFilm(section, source = section?.dataset.filmSrc) {
  const video = section?.querySelector('video');
  if (!section || !video || !source) return () => {};
  let ready = false, pendingFrame = 0, target = 0, start = 0, distance = 1;
  let loaded = false, dead = false, seekingTimer;
  const enabled = () => !dead && !isStill() && desktop.matches;
  const measure = () => {
    const rect = section.getBoundingClientRect();
    const headerHeight = header?.getBoundingClientRect().height || 100;
    start = rect.top + scrollY - headerHeight;
    distance = Math.max(1, section.offsetHeight - (innerHeight - headerHeight));
  };
  const seek = () => {
    if (!ready || !enabled() || video.seeking || !Number.isFinite(video.duration)) return;
    if (Math.abs(video.currentTime - target) > .025) {
      try { video.currentTime = target; } catch { fail(); }
    }
  };
  const tick = () => {
    pendingFrame = 0;
    if (!ready || !enabled()) return;
    const progress = clamp((scrollY - start) / distance);
    target = progress * Math.max(0, video.duration - .04);
    section.style.setProperty('--film-progress', String(progress));
    seek();
  };
  const scheduleFilm = () => { if (!pendingFrame) pendingFrame = requestAnimationFrame(tick); };
  function fail() {
    dead = true; ready = false;
    clearTimeout(seekingTimer);
    section.classList.remove('film-ready');
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  const checkReady = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0 || !enabled()) return;
    ready = true;
    clearTimeout(seekingTimer);
    section.classList.add('film-ready');
    measure(); scheduleFilm();
  };
  const onSeeked = () => { if (enabled()) seek(); };
  const preference = () => {
    video.pause();
    if (!enabled()) {
      section.classList.remove('film-ready');
      cancelAnimationFrame(pendingFrame); pendingFrame = 0;
    } else if (ready) { section.classList.add('film-ready'); measure(); scheduleFilm(); }
    else if (!loaded) load();
    else if (video.readyState >= 2) checkReady();
  };
  const load = () => {
    if (loaded || !enabled()) return;
    loaded = true;
    video.muted = true; video.playsInline = true;
    video.preload = 'auto'; video.src = source;
    video.load();
    seekingTimer = setTimeout(() => { if (!ready) fail(); }, 20000);
  };
  const loader = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) load();
  }, { rootMargin: '400px' });
  loader.observe(section);
  const resized = () => { preference(); measure(); scheduleFilm(); };
  video.addEventListener('loadeddata', checkReady);
  video.addEventListener('seeked', onSeeked);
  video.addEventListener('error', fail);
  addEventListener('scroll', scheduleFilm, { passive: true });
  addEventListener('resize', resized, { passive: true });
  document.addEventListener('shop:motion-change', preference);
  desktop.addEventListener('change', preference);
  const resizeObserver = new ResizeObserver(() => { measure(); scheduleFilm(); });
  resizeObserver.observe(document.body);
  return () => {
    dead = true; video.pause(); clearTimeout(seekingTimer); cancelAnimationFrame(pendingFrame);
    loader.disconnect(); resizeObserver.disconnect();
    section.classList.remove('film-ready');
    video.removeEventListener('loadeddata', checkReady); video.removeEventListener('seeked', onSeeked); video.removeEventListener('error', fail);
    removeEventListener('scroll', scheduleFilm); removeEventListener('resize', resized);
    document.removeEventListener('shop:motion-change', preference); desktop.removeEventListener('change', preference);
  };
}
document.querySelectorAll('[data-film-story]').forEach(section => initScrollFilm(section));
