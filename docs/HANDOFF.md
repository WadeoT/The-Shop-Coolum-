# Preview handoff

## What is implemented

Six main pages, an imagery disclosure page and a custom 404. Warm paper/olive/terracotta design tokens; locally hosted Cormorant Garamond and DM Sans; responsive still-life photography; distinct editorial layouts; location and click-to-call actions; mobile navigation with focus management; a skip link; native FAQ disclosures; metadata and a minimal GroceryStore identity schema.

There is no ecommerce, invented menu, fabricated review, stock guarantee, invented opening schedule or made-up supplier relationship. The typographic business name is a text treatment, not a claimed official logo. No advertising trackers, external fonts, map embeds or remote media dependencies are loaded.

The central concept is “Good things, close to home.” Home uses arrival, coffee, discovery, locality, food and visit chapters. Supporting pages share the same palette and type while using different compositions.

## Asset provenance

Four original images were generated using the available OpenAI image-generation tool and visually inspected before inclusion:

- `hero`: flat white and croissant in morning sunlight on timber.
- `coffee`: close-up flat white in an olive ceramic cup.
- `pantry`: unbranded grocery bag, bread, produce and pantry still life.
- `bread`: croissants and rustic loaves with warm natural light.

They were exported to WebP at 640, 1280 and 1920px. Alt text, a site-wide footer disclosure link and `/image-notes/` explicitly identify the photography as illustration rather than real shop/product documentation. Higgsfield was not available and was not used. No video was generated. No external animation reference file or URL was present; both supplied text briefs were read, including the additional signature-film specification.

## Two refinement passes

1. **Design coherence:** reviewed actual desktop and mobile renders; tuned typographic scale, photographic crops, the home hero, dark coffee chapter, asymmetric discovery area and coastal visit poster; replaced platform-dependent decorative glyphs with the repeated SVG sun motif.
2. **Motion and usability:** tested mobile navigation/Escape/focus handling, anchor destinations, reduced motion, pause persistence, responsive overflow, video seeking and failure behaviour. Removed an unnecessary video-poster download while no film is configured. Preloaded critical fonts and removed an unnecessary serif weight following measured mobile layout shift.

Motion uses ordinary browser scrolling with no scroll hijacking. IntersectionObserver gates image/line reveals; one requested animation frame batches parallax reads/writes. The typographic divider can be paused and the preference persists for the session. No parallax runs on mobile, and the entire site respects reduced motion.

## Finish the actual Higgsfield film

This remains a real external blocker, not a completed deliverable. Enable callable Higgsfield video tools in the session, or supply an approved downloadable Higgsfield film. Generate the brief's 5–8 second continuous landscape shot moving through coffee, pastries, bread and produce. Inspect it for morphing, legibility, continuity and authentic food textures. Use no fake storefront or brand packaging.

When the film exists, optimise it locally (example, adjust quality after visual inspection):

```sh
ffmpeg -i approved-source.mp4 -an -vf 'scale=1280:-2' \
  -c:v libx264 -preset slow -crf 23 -g 1 -pix_fmt yuv420p \
  -movflags +faststart public/images/editorial-journey.mp4
```

Extract and inspect a poster, then set `business.film.src` and `business.film.poster` in `src/data/site.ts`. Do not overwrite the current imagery with unreviewed assets.

`initScrollFilm` in `public/js/motion.js` loads near the viewport, waits for decodable data, and maps scroll progress to currentTime in both directions. It never calls play(). Seeking is serialised around seeked events. Only a ready video enables the 180vh desktop scene. Mobile, reduced motion and failure keep the regular static feature and all text. The section never pins without a usable film. A timeout removes a failed load.

The controller passed tests with an explicitly synthetic test-only clip: forward and backward time mapping, no autonomous playback, reduced-motion transition, mobile unpinning and load failure. Actual Higgsfield footage, its narrative progression, quality, decode performance and real-device smoothness remain untested until supplied.

## Business verification before launch

The brief supplies:

- The Shop @ Coolum.
- Shop 5, 1776/1784 David Low Way, Coolum Beach QLD 4573.
- Opposite Coolum Surf Club.
- 0400 301 078.
- Broad coffee, fresh food, grocery, flower and homeware categories.

Research requests to these sources returned proxy `403 Forbidden`:

- https://www.findglocal.com/AU/Coolum-Beach/202111023136557/The-shop-coolum---coffee-groceries-homewares
- https://www.flyingwest.com.au/cafes/the-shop-coolum
- https://www.visitcoolum.com/the-shop-coolum

The preview uses supplied contact information. Set `contactVerified` only after confirming it; this adds address and telephone to structured data. Populate hours and social links centrally only after verification. No Flying West relationship, establishment year, supplier names, prices, awards or dietary guarantees are asserted. Confirm categories and copy with the owner, obtain actual photographs/official logo, set the public origin and review before public launch.

## Environment

Use the existing `/workspace/The-Shop-Coolum-` checkout. Cloud tasks are already isolated; do not create a Git worktree unless explicitly requested. `npm ci` installs pinned dependencies; `npm run build` generates `dist`. Running server processes do not persist across snapshots and must be restarted. Astro telemetry is disabled in the npm commands to support the cloud filesystem.

The environment has no public-preview publishing tool. Development and production servers can be run internally; static build output and screenshots are provided for review. Do not describe a localhost URL as a public preview or claim deployment.
