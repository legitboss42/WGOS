# Mission: Cinematic Route System V2

- Mission ID: `20260710-CINEMATIC-ROUTE-SYSTEM-V2`
- Type: `FULL_WEBSITE_TRANSFORMATION_CONTINUATION`
- Status: `IN_PROGRESS`
- Objective: Replace reskinned public layouts with distinct cinematic compositions by page type while preserving routes, metadata, structured data, content sources, and analytics wiring.

## Composition audit

- Home: no; the prior pass already changed composition and integrated cinematic imagery.
- Hub pages: yes; most retained the former light paired-card/grid grammar and require direct client-level rebuilds.
- Service details: yes; the shared template retained the former paired-card hero. Rebuilt in this batch.
- Article template: yes; the masthead resembled a marketing page. Rebuilt in this batch.
- Tool details: yes; the hero competed with the utility. Rebuilt in this batch.
- About and Contact: yes; About rebuilt in this batch, Contact remains queued.
- Legal: no structural change required; restraint is intentional.

## Batch result

- Added configurable `CinematicHero` variants and reduced-motion-safe `SectionReveal`.
- Rebuilt all shared service-detail routes through `ServiceDetailTemplateClient`.
- Rebuilt all six public tool-detail routes and the tools hub.
- Rebuilt the shared Academy article masthead and reading composition.
- Rebuilt About; upgraded the shared `PageHero` used by Pricing and FAQ.
- Preserved route metadata, canonical helpers, structured data, and root analytics scripts.
- Added tracked hero/final CTAs at shared template seams.

## Known gaps

- `/portfolio/[slug]` does not exist in the current route inventory; only `/portfolio` is public.
- Services, Academy, Portfolio, and Contact hub clients still need direct composition rebuilds.
- A full plain-Link CTA migration remains for non-template supporting cards and inline editorial links.

## Hub redesign batch - 2026-07-11

- Services: replaced the pale orbit hero with a growth-architecture dossier and continuous dark service matrix.
- Academy: replaced the generic two-column marketing hero with an editorial masthead, editor selection, publication ledger, and continuous topic index.
- Portfolio: replaced the white gallery hero with an image-led featured-project stage and a unified challenge/strategy/implementation strip.
- Contact: replaced floating decorative audit cards with a quieter consultation masthead and made the review form the dominant product surface.
- QA: all four routes returned 200, rendered one H1, exposed tracked hero CTAs, and passed 1440px/375px screenshot inspection with reduced motion enabled.
- Runtime: a stale `next dev` process was found mutating `.next` during the first production build. The process was stopped, `.next` was safely regenerated, and the clean production server returned 200.
