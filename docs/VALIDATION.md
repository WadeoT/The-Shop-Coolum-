# Validation record — 9 October 2026

## Passed in this workspace

- Frozen installation: `npm ci --no-audit --no-fund --cache /workspace/.npm`.
- Production build: `npm run build`, eight generated routes.
- Browser smoke test: eight routes; all tested images decoded; one h1 per page; page titles present; 29 unique internal URLs/fragments checked.
- Responsive overflow: eight pages at 1440, 1024, 768, 390 and 320 pixels (40 checks).
- Automated axe WCAG A/AA scans: zero detected violations across eight pages. This is not a claim of comprehensive accessibility certification.
- Mobile navigation open/close, Escape, focus restoration, background inertness and page navigation.
- Native visit FAQ, telephone URL and directions URL construction.
- Decorative motion pause/resume, persisted session preference and reduced-motion CSS.
- No page-script errors or failed page/asset requests during the production smoke run.
- Synthetic QA film: scroll advanced time from 0.791 to 3.167 seconds, reversed to 1.385 seconds, remained paused, and did not advance independently. Reduced-motion, mobile unpinning and failed-media fallback passed. Fixture is ignored and is never included in website output.
- Visual review: actual desktop homepage and supporting-page screenshots; mobile hero and full-page layout; a second review after visual and performance refinements.
- Packaged relative-path review copy: six main pages, decoded images, navigation and mobile menu verified using a plain local HTTP server. Direct `file://` navigation could not be tested because managed Chromium blocks it.
- `git diff --check` passed.

## Performance sample

Chromium, 390 × 844, 4× CPU slowdown, 150ms network latency, 1.6Mbps download, cold page load:

- LCP: 1,324ms.
- CLS: 0.042 (improved from 0.108 before font/preload changes).
- Resource transfer in the recorded load: approximately 260KB, including an image prefetched below the fold.
- Main motion script transfer: approximately 3.2KB.

These are one-run local lab measurements, not real-user production Core Web Vitals, Lighthouse scores or a guarantee for other devices/networks. They do not include the missing Higgsfield film.

## Review artifacts

`/workspace/previews/Desktop-preview.png`, `Mobile-preview.png`, `Website-motion-walkthrough.mp4` and `The-Shop-Coolum-preview.zip`.

The walkthrough is a recording of the implemented website. It is not a generated food film. The ZIP is a separate relative-path review copy; the original `dist/` remains suitable for normal static hosting. No public site URL, deployment or environment publication is claimed.

## Still outstanding

Actual Higgsfield generation, real-film integration and narrative/decode validation; original external motion reference; verification of supplied business information; actual business photographs and official logo; confirmed hours/social accounts; real domain and public deployment. See HANDOFF.md.
