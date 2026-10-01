# RaQuel Synths — Creative Technology Platform

RaQuel Synths is an independently developed **creative technology and transmedia web platform** that combines music, interactive storytelling, digital publishing, affiliate commerce, technical SEO and serverless integrations.

The application is built with Angular and Firebase and serves as the main public web ecosystem around the RaQuel Synths project. It also acts as the portfolio and product layer that preceded the separate RQS Studio audio-software repositories.

> **Project status:** actively maintained independent product. The `master` branch contains public-facing features, server-rendered/prerendered routes, Firestore-backed content, serverless APIs and experimental/brand-specific modules. This README documents what is supported by the audited codebase and intentionally separates implemented functionality from marketing language or future-product claims.

## What is implemented

### Core stack

The audited repository currently uses:

- Angular 20.3.x
- TypeScript 5.9.x
- Angular Standalone Components
- Angular Router
- Angular SSR / prerender
- Angular Signals
- RxJS 7.8
- Angular Material / CDK
- Angular Service Worker
- AngularFire
- Firebase / Cloud Firestore
- Firebase Analytics
- Express 5 for SSR runtime support
- Vercel serverless API functions
- Brevo API
- Google Tag Manager / analytics integrations
- Google AdSense integration

The project also contains Firebase Hosting configuration, although the repository metadata and serverless API structure show that the application has also been prepared for Vercel-style deployment paths.

## Product architecture

The site is not a single-page marketing landing page. It contains multiple product/content modules under one Angular application:

```text
RaQuel Synths Web Platform
│
├── Public application
│   ├── landing / creator / bio
│   ├── discography / musical archives
│   ├── transmedia saga / lore / logs
│   ├── store / affiliate catalogue
│   └── public contact / compliance flows
│
├── Private RQS Admin
│   ├── System Logs
│   ├── Lore preview
│   ├── Global Sagas importer
│   ├── Streaming Importer
│   ├── Social Publishing
│   └── Store Catalog Updater [planned]
│
└── Serverless API layer
    ├── public contact / subscribe / sitemap
    └── protected admin operations
```

The application uses lazy-loaded standalone route components for the main experiences.


## RQS Admin — editorial, catalog and distribution operations

The repository now includes a private administrative layer under `/admin` that is being developed as the internal operations surface for the RaQuel Synths ecosystem.

Its purpose is not to replace the public application. Instead, it separates **content creation, ingestion, review, catalog management and external distribution** from the public-facing reading, discovery and commerce experiences.

The current admin routes include:

- `/admin` — control hub;
- `/admin/system-logs` — editorial creation and management for System Logs / channel updates;
- `/admin/lore` — preview shell for the separate Broklin and Jonah lore sources;
- `/admin/global-sagas` — Google Drive to Firestore ingestion workflow for Global Sagas;
- `/admin/stream-importer` — streaming-catalog importer for the public discography;
- `/admin/social-publishing` — downstream social publishing workflow for content already owned by the RQS ecosystem.

### Module boundaries

The admin architecture deliberately keeps source ownership separated by domain:

```text
RQS Admin
│
├── 01. System Logs
│   └── creates and manages technical/editorial updates and channel announcements
│
├── 02. Lore
│   ├── Broklin source
│   └── Jonah source
│      status: preview / not yet released for import or publication
│
├── 03. Global Sagas
│   └── Google Drive → validation/dry run → Firestore `global-sagas`
│
├── 04. Streaming Importer
│   └── streaming source data → Firestore `discography` → public `/discografia`
│
└── 05. Social Publishing
    └── eligible RQS content → draft → validation → approval → Instagram/Facebook
```

This separation avoids turning the social module into a second content source. Social Publishing is a **distribution layer**, while editorial and catalog modules remain responsible for canonical content.

### Global Sagas ingestion workflow

The implemented Global Sagas importer reads supported source documents from a configured Google Drive folder in read-only mode.

The current flow includes:

1. list available source documents;
2. load and parse a selected document;
3. detect and confirm language;
4. validate saga, season and episode structure;
5. perform a required dry run;
6. generate a Firestore write plan;
7. require explicit owner confirmation;
8. import episodes into the `global-sagas` collection.

The source document is not mutated by the importer. Public availability remains gated by each episode's `releaseDate`.

The current code also supports PT-BR / EN-US pairing status and distinguishes blocking validation errors from non-blocking observations.

### Social publishing workflow

The Social Publishing module works on top of eligible existing RQS content instead of accepting arbitrary standalone social posts as its primary source model.

The current source types are:

- `system_log`;
- `saga_episode`;
- `music_release`.

A social package can carry:

- Instagram caption;
- Facebook caption;
- CTA;
- destination URL;
- UTM campaign and content values;
- one or more destinations;
- image/video/reel-related asset metadata.

The package lifecycle is stateful and validated before publication. The codebase includes draft validation, dry-run requirements, approval checks, source-revision checks and per-destination delivery reconciliation.

Supported social destinations in the current model are:

- Instagram;
- Facebook.

A package is reconciled to `PUBLISHED` only when all selected destinations have recorded successful delivery with a remote post identifier.

This is best described as a **content-operations and publishing workflow**, not as a generalized social-media management SaaS.

### Admin authentication and safeguards

The administrative flows restore a private session before allowing actions and use CSRF validation on protected server-side operations.

The Global Sagas workflow also enforces read-only Google Drive access for source retrieval and requires a dry run before import.

The repository should not be interpreted as proof of a fully audited enterprise authorization model; the admin layer is a private product-specific control surface and continues to evolve.

### Planned Module 06 — affiliate store catalog operations

A sixth admin module is planned for the affiliate `/store` experience.

Its intended responsibility is to move store catalog maintenance out of the large static `store-data.ts` workflow and toward a dedicated internal catalog-update process for affiliate content.

This module is **planned, not implemented**, and should therefore be treated as roadmap rather than current functionality.

## Routing and rendering strategy

The browser router contains routes for, among others:

- `/` — public landing page
- `/dossier` — project/persona dossier
- `/logs-archive`
- `/log-reader/:id`
- `/musical-archives`
- `/saga`
- `/visual-novel/:mode/:season`
- `/visual-novel`
- `/hybrid-saga`
- `/hybrid-reader/:id`
- `/lore/:mode/:id`
- `/creator`
- `/compliance`
- `/store`
- `/store/:dept`
- `/contato`
- `/discografia`
- `/play/:id`
- `/bio`

Angular SSR is used selectively rather than uniformly.

The server-route configuration currently includes:

- prerendering for the home page, compliance, dossier, creator, contact, discography, hybrid-saga and bio;
- prerender parameters for Broklin/Jonah visual-novel seasons;
- prerendered lore routes with a server fallback;
- prerendered known log entries with a server fallback;
- server rendering for dynamic readers, archives, musical archives, deep-link playback and store routes;
- server fallback for unmatched routes.

This is a meaningful part of the project architecture because content discoverability and dynamic Firestore content are handled differently depending on route type.

## Firebase and content architecture

`ContentService` is the primary content-access layer for dynamic project data.

The codebase uses Firestore collections for content such as:

- `discography`
- `lore`
- `lore-jonah`
- `logs`
- `deeplinks`

Other project data is represented locally in typed/static data files under `src/app/data/`, including larger application and store datasets.

For browser execution, the application uses AngularFire/Firestore APIs. For selected SSR/prerender paths, `ContentService` can fetch Firestore documents through the public Firestore REST API and map Firestore REST value types back into application data structures.

The lore service also contains in-memory caching for retrieved episode sets.

## Dual-mode experience

The project contains a global state model for two creative modes:

- `broklin`
- `jonah`

`TranslationService` stores both the active language and active narrative mode using Angular Signals.

The dual mode is a real application-state feature used by the visual identity and narrative experience. It should be described as a **theme/narrative state system**, not as a separate application runtime.

## Internationalization

The application provides an internal PT/EN language state using Angular Signals.

The routing metadata contains bilingual SEO titles and descriptions for major pages, and project content is structured to support Portuguese and English presentation.

This is a custom project-level internationalization approach; the audited code does not show Angular's full compile-time `@angular/localize` workflow as the primary mechanism.

## Transmedia storytelling

The project includes several distinct narrative interfaces rather than a single static lore page:

- visual-novel catalogue routes;
- lore readers;
- hybrid saga / reader flows;
- logs archive and individual log readers;
- separate Broklin and Jonah content paths.

Known lore episode IDs are explicitly prerendered for both narrative modes, while dynamic fallback rendering remains available.

The content model is therefore best described as a **data-driven transmedia storytelling layer backed by Angular routing and Firestore content**, not as a traditional CMS product.

## Discography and musical links

The project contains dedicated discography and musical-archive experiences.

`MusicalLinksService` resolves musical records from Firestore by checking `discography` and then `deeplinks`. The model supports streaming and social destinations including fields for Spotify, SoundCloud, YouTube, Apple Music and other services.

The `/play/:id` route is used as a dedicated deep-link/player entry point, while `/bio` serves as a centralized music/profile link experience.

The current implementation is specific to the RaQuel Synths ecosystem; it should not be presented as a generalized commercial link-management SaaS.

## Creator portfolio

`/creator` is a dedicated technical/creative portfolio route inside the main product.

It is implemented as its own standalone Angular page with dedicated template and styling, rather than being only an external résumé link. This makes the main website itself part of the project's developer portfolio surface.

## Store and affiliate commerce

The repository contains a store experience with department-based routing (`/store` and `/store/:dept`) and a sizeable local `store-data.ts` dataset.

The store is positioned as an affiliate/curated commerce layer rather than a stock-owning transactional e-commerce backend.

The repository also contains affiliate click tracking hooks. This means the implemented capability is best described as **affiliate catalogue + outbound conversion tracking**, not as a full e-commerce platform with inventory, checkout, orders or fulfillment.

## Contact API

`api/contact.js` implements a serverless contact workflow.

The endpoint currently:

- accepts `POST` requests;
- uses a honeypot field for basic bot filtering;
- validates required fields and email format;
- normalizes incoming values;
- escapes user-controlled data before inserting it into the generated HTML email;
- writes submitted messages to a Firestore `mensagens` collection through the Firestore REST API;
- reads Brevo and email configuration from environment variables;
- sends formatted contact notifications through the configured email provider flow.

The API does not expose private provider keys in the source code; provider credentials referenced by this path are expected through environment variables.

## Newsletter / subscription API

`api/subscribe.js` integrates newsletter signup with Brevo.

The current implementation:

- accepts `POST`;
- requires an email field;
- reads `BREVO_API_KEY` from the environment;
- creates or updates a Brevo contact.

### Audit limitation

The Brevo list identifier is currently hard-coded as `2`, and the source itself contains a comment indicating that this value may need to be replaced with the correct list ID.

For a more maintainable deployment, the list ID should be moved to an environment variable and input validation should be strengthened to match the contact endpoint.

## Dynamic sitemap

`api/sitemap.js` generates an XML sitemap dynamically.

The implementation:

- emits static public routes;
- includes known visual-novel routes;
- queries Firestore for Broklin lore, Jonah lore and logs;
- filters unpublished/future content before including dynamic entries;
- escapes XML values;
- adds cache-control headers.

This is an important SEO capability because dynamic narrative content can be represented in the sitemap without manually editing a static XML file for every published entry.

## SEO architecture

`SeoService` manages runtime SEO metadata including:

- page titles;
- meta descriptions;
- canonical URLs;
- Open Graph tags;
- Twitter cards;
- structured data / JSON-LD;
- Ahrefs analytics-script injection.

Canonical URLs are normalized to the public `raquelsynths.com` domain and selected tracking/state query parameters are removed before canonicalization.

Route definitions also contain bilingual SEO metadata for many primary routes.

### Audit note

The SEO service contains public analytics identifiers/keys required by client-side analytics scripts. These should be distinguished from private server credentials; client-side analytics identifiers are not equivalent to secrets.

## Analytics and advertising

The application contains explicit integrations for growth/measurement rather than only static marketing pages.

`TrackingService` supports:

- lazy GTM initialization after browser interaction;
- custom `dataLayer` events;
- affiliate click tracking;
- Spotify/SoundCloud interaction events;
- browser-only guards for SSR compatibility.

The repository also contains AdSense-related services/components and a public `ads.txt` file.

These integrations support measurement and monetization workflows. They do not, by themselves, demonstrate measured conversion improvements; performance or conversion metrics should only be documented when backed by actual analytics data.

## PWA and service worker

Angular's service worker is enabled outside development mode.

The current `ngsw-config.json` defines:

- eager caching for the application shell;
- lazy caching for project assets;
- a `freshness` cache strategy for Firestore REST requests;
- a maximum Firestore cache age of one hour.

The application configuration also enables client hydration with event replay.

This supports a PWA-capable web experience, although installability and offline completeness should be verified separately before the product is described as a fully offline application.

## Firebase configuration

The frontend contains the Firebase web configuration required by the client SDK, including project ID, app ID and analytics measurement ID.

Firebase web configuration values are designed to be present in browser applications and should not be treated as server secrets. Actual access control must be enforced through Firebase/Firestore security rules and backend authorization where applicable.

### Audit limitation

The repository audit did not find Firestore security-rule files in the root tree inspected for this README. Therefore this README does **not** claim that Firestore authorization rules have been audited or proven secure from this repository alone.

## Hosting and deployment configuration

The repository includes Firebase Hosting configuration targeting:

`dist/raquel-synths/browser`

with an SPA rewrite to `index.html`.

At the same time, Angular SSR/server route configuration and Vercel-style `api/` serverless functions are part of the repository. These represent multiple deployment concerns in one codebase.

Before presenting the deployment model as a single unified production architecture, the team should document which host is authoritative for:

- SSR runtime;
- static/browser assets;
- serverless API functions;
- canonical production domain.

## Repository structure

```text
.
├── api/
│   ├── contact.js
│   ├── index.js
│   ├── sitemap.js
│   └── subscribe.js
├── public/
│   ├── ads.txt
│   └── assets/
├── src/
│   └── app/
│       ├── app-discography/
│       ├── app-storytelling/
│       ├── app-theme-switcher/
│       ├── app-visual-novel/
│       ├── components/
│       │   ├── ad-article/
│       │   ├── ad-banner/
│       │   ├── author-signature/
│       │   ├── footer/
│       │   ├── header/
│       │   ├── last-releases/
│       │   ├── spotify-playlist/
│       │   └── uplink-terminal/
│       ├── data/
│       │   ├── app-data.ts
│       │   ├── log-data.ts
│       │   ├── lore-data.ts
│       │   └── store-data.ts
│       ├── models/
│       │   └── album.model.ts
│       ├── pages/
│       │   ├── bio-link/
│       │   ├── compliance/
│       │   ├── contato/
│       │   ├── creator/
│       │   ├── deep-link-redirect/
│       │   ├── hybrid-reader/
│       │   ├── hybrid-saga/
│       │   ├── landing-page/
│       │   ├── log-reader/
│       │   ├── logs-archive/
│       │   ├── lore-reader/
│       │   ├── musical-archives/
│       │   ├── sobre/
│       │   ├── store/
│       │   └── visual-novel/
│       └── services/
│           ├── ad-sense.service.ts
│           ├── content.service.ts
│           ├── musical-links.service.ts
│           ├── seo.service.ts
│           ├── tracking.service.ts
│           └── translation.service.ts
├── angular.json
├── firebase.json
├── ngsw-config.json
├── package.json
└── README.md
```

## Local development

### Requirements

- Node.js 20+ recommended
- npm

### Install

```bash
npm ci
```

### Development server

```bash
npm start
```

The configured start script runs Angular on `0.0.0.0`.

### Tests

```bash
npm test
```

The script invokes Angular's test runner. The presence of a test command does not establish test coverage; coverage should be measured separately before being used as a project metric.

### Build

```bash
npm run build
```

### SSR runtime

```bash
npm run serve:ssr:raquel-synths
```

This command expects the built server bundle at `dist/raquel-synths/server/server.mjs`.

## Audit findings and hardening priorities

### High priority

1. **Document the authoritative deployment architecture**
   - Firebase Hosting configuration, Angular SSR and Vercel-style serverless APIs coexist in the repository.
   - Production ownership of each runtime should be explicit.

2. **Review and version Firestore security rules**
   - no rules file was identified in the audited repository tree;
   - frontend Firebase configuration is public by design, so data authorization must be enforced elsewhere.

3. **Harden newsletter subscription configuration**
   - move the Brevo list ID out of source code;
   - add stronger email normalization/validation and abuse controls.

4. **Reduce marketing claims that are not benchmarked**
   - terms such as zero latency, perfect performance, production-grade scalability or conversion improvement should not be used in technical documentation without reproducible evidence.

5. **Separate large static content datasets from application logic where practical**
   - `app-data.ts` and `store-data.ts` are sizeable source files;
   - continued growth may justify a clearer content pipeline or CMS/data boundary.

### Medium-term hardening

- automated route and sitemap consistency checks;
- documented Firestore indexes/rules;
- integration tests for serverless APIs;
- rate limiting or stronger abuse protection for public forms;
- environment validation for serverless functions;
- clearer staging/production configuration;
- accessibility audit;
- Core Web Vitals/Lighthouse measurements before publishing performance claims;
- analytics event schema documentation;
- dependency/security scanning in CI;
- documented content publishing workflow — now partially addressed by the RQS Admin architecture documented above;
- expand automated tests around admin import/publishing state transitions and external-delivery failure handling.

## Relationship to RQS Studio

This repository represents the main RaQuel Synths public creative-technology ecosystem: storytelling, music discovery, publishing, portfolio, links, commerce experiments and growth infrastructure.

The later RQS Studio product is separated into dedicated repositories for browser-based audio workflows and backend/DSP processing:

- `anaraquel00/rqs-daw-frontend`
- `anaraquel00/rqs-daw-backend`

Together, the repositories show an evolution from a content- and experience-driven Angular product toward a more specialized web-audio and SaaS-oriented product architecture.

## Evidence policy

This README follows the same evidence-first documentation policy used across the RQS Studio repositories:

- a dependency is not automatically described as an active capability;
- marketing copy is not treated as architecture evidence;
- client-side configuration is distinguished from private server secrets;
- affiliate catalogue functionality is not described as full e-commerce;
- custom internationalization is not described as a full localization platform;
- analytics integration is not presented as proof of conversion improvement;
- SSR/prerender support is documented route by route rather than generalized;
- security is not claimed where repository evidence is incomplete;
- roadmap or architectural intentions are not presented as completed features.

## Current direction

RaQuel Synths is being maintained as a creative technology platform and public product ecosystem while RQS Studio grows into a more specialized audio-software/SaaS product.

The strongest technical signals in this repository are the combination of Angular application architecture, hybrid SSR/prerender routing, Firestore-backed content, controlled Google Drive ingestion, internal admin workflows, social-publishing state management, dynamic sitemap generation, custom SEO infrastructure, multilingual state, analytics/affiliate workflows and serverless APIs.
