# Web Services Studio — isolated MVP (2026-11-11)

## Branch and non-interference
- Repository: `valdy247/diagrama`.
- Branch: `feat/vmv-web-services-studio`, created from `main`.
- Other web work: Smart Call in `feat/vmv-smart-call-control-center` (draft PR #1).
- **Changes here only**: `web-services/index.html`, `es/web-services/index.html`, `src/web-services-studio.js`, `src/web-services-studio.css`, and this document.
- Does not edit shared workspace, Vite routing/config, navigation, service catalog, iOS application, Twilio, Stripe, Supabase schema, credentials, or phone workflows.
- Keep as a draft PR for review. Do not merge over the Smart Call feature without reconciling both PRs.

## Current functionality
- Dedicated section inside the existing Web Services product page, for English and Spanish routes.
- Editable business name, headline, introductory text, About section, up to six services, contact details and opening hours.
- Three page layouts and four color palettes.
- Desktop/mobile website preview inside a script-disabled, sandboxed iframe.
- SEO title and description included in exported standalone static HTML.
- Export an actual HTML document suitable for manual hosting; separately export the draft JSON.
- Local browser draft persistence, separate per language and per device (no account sync).
- Reset with explicit confirmation.
- All user text HTML-escaped. Email and telephone links are validated/normalized. Palette and layout values are from fixed allowlists.

## Explicit exclusions
- No website publishing or deployment button.
- No custom domain connection.
- No lead capture endpoint, form submission or simulated visitor statistics.
- No Supabase database writes or user data synced between devices.
- No iOS editing screen in this branch; the intended app counterpart is a quick activity/inquiry summary, once a real backend exists.
- No entitlements or subscription charges.

## Next production stages (not implemented)
1. Design `web_service_sites`, `web_service_pages`, `web_service_inquiries` with owner/business membership and proper RLS, separate from Smart Call tables.
2. Authenticate the editor with existing Supabase identity; authorize business ownership/roles/entitlements server-side.
3. Version draft/published revisions with safe publishing/rollback, throttling and asset validation.
4. Domain verification, HTTPS provisioning, SEO sitemap/robots and configurable forms with spam defense and retention policies.
5. App-facing authenticated service summary and notifications; web-only advanced editing, following VMV responsibilities.

## QA
- Vercel preview build for the bilingual pages should reach READY.
- Manual browser verification still required for editable fields, all layout/color combinations, export, local persistence/reset, narrow viewports and screen readers.
- Real account access, tenant isolation, hosted sites, web forms, domains and native app integration are **not** tested because they are not part of this local-only MVP.
