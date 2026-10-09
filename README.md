# The Shop @ Coolum

An editorial, responsive six-page website built with Astro. It ships static HTML, self-hosted fonts and responsive WebP images; no client framework or third-party services are needed to browse it.

## Run

Use Node.js 24 (tested with 24.19.0) and npm.

```sh
npm ci
npm run dev -- --port 4321
```

For a production preview:

```sh
npm run build
npm run preview -- --port 4322
```

`dist/` is deployable to a static host. Set `PUBLIC_SITE_URL` to the real public origin when building for launch; canonical URLs and absolute social-image URLs are then generated. No deployment has been performed.

## Content

- `src/data/site.ts`: address, phone, hours, verified social links, navigation, film configuration.
- `src/pages/`: Home, Coffee + Food, Groceries, Local, Our Story, Visit, imagery disclosure, 404.
- `src/components/`: shared header, footer, photos, visit section, coffee/video story.
- `src/styles/global.css`: visual system, responsive layouts, motion fallbacks.
- `public/js/motion.js`: navigation, image parallax, drawn paths, reveals, motion preference and true scroll-to-video seeking.
- `public/images/`: four original AI-generated illustrations, each in three responsive sizes.

## Validate

Start the production preview on port 4322, then:

```sh
npm test
npm run test:motion
npm run test:performance
```

Tests use Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` if needed. Set `TEST_URL` to test another running instance. The motion test needs FFmpeg and generates a separate synthetic fixture in ignored `test-results/`. That fixture is not used by the website. Screenshots, accessibility findings and performance measurements also go into `test-results/`.

## Preview limitations

The Higgsfield plugin was not exposed to this session. No Higgsfield video has been generated or integrated. The coffee feature therefore remains a normal, attractive image section; it is **not** represented as completion of the required video sequence. Its genuine scroll-video controller is ready and fixture-tested. The actual film must still be generated, reviewed, optimised, integrated and tested.

Business contact details and broad product categories come from the supplied brief. The three requested business-source websites were blocked by the environment network policy. Hours, social accounts, supplier partnerships and the 2004 history claim were omitted pending verification. All imagery is explicitly disclosed as illustrative; no official logo or actual shop photographs were supplied.

See [the handoff](docs/HANDOFF.md) for the creative decisions, remaining verification and film integration instructions.
