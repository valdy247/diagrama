# VMV Business ↔ VMV Call integration readiness

## Phase boundaries

**Phase 1 (now):** polished marketing website and separate product pages; public service catalog, web workspace prototype, responsive navigation and foundation for future shared identity. This is NOT a live authenticated backend.
**Phase 2 (next):** integrate the existing mobile app from valdy247/smartjob with the new web management platform. The mobile app remains a straightforward business phone; deep service settings are handled on the web. Audit existing Supabase Auth before building any login integration.
**Phase 3 (later):** decide which account questions are essential at registration and which business/service setup questions to defer. Do not implement the full onboarding form yet.

## Public service module registry

- /service-catalog.json is a versioned static registry (schemaVersion 1.0.0) with stable module id, group, publicPath, workspacePath, state, mobile.surface/actions and web.surface/actions.
- Marketing site uses public product pages; /workspace/?service=smart-call (or another id) is a disconnected interactive preview.
- The future app can reuse the same stable module identifiers to discover applicable quick-use screens.
- The catalog carries no secrets, personal details, user entitlements, account IDs, payment data or live API URLs.

## App vs web responsibilities

| Product | Mobile app | Web platform |
| --- | --- | --- |
| Smart Call | Answer/receive calls, history, contacts, mute, speaker, keypad, optional interpreted transcript | Business numbers, routing, IVR, greetings, hours, languages, translation settings, reporting, billing |
| AI Agents | Active agents, quick status, alerts | Build agents, instructions, voice/channels, knowledge, review |
| Web Services | Activity and incoming inquiries | Site builder, editor, domains, forms |
| Inventory | Lookup, adjustments, low-stock notices | Product catalog, imports, suppliers, rules |
| Scheduling | Agenda, appointment actions | Service/employee availability and booking rules |
| CRM & Leads | Contacts, quick notes, follow-up | Pipelines, segmentation, imports, assignments |
| Business Management | Orders, tasks, alerts | Order flow, staff permissions, billing |
| Marketing & Analytics | Summaries and alerts | Campaigns, reports, targets |
| Automations | Status, reviews, approvals | Triggers, rules, workflow editor, audit log |

Do not overburden the simple calling app with advanced website editing, agent configuration or subscription administration. Preserve the app's optional translation UX without adding a separate complicated translator administrator.

## Shared authentication and security requirements (not implemented)

1. Audit the existing Supabase Auth on the mobile app; reuse it rather than introduce a second user database.
2. An authenticated backend must verify user_id, business_id, role, memberships and module entitlements for every request.
3. Configure proper row-level security / tenant isolation for private call records, leads, numbers, subscription state and site/agent settings.
4. Web/mobile deep links contain only a safe route and module ID. Never include tokens, personal data, session IDs or numbers in URLs. Destination must authorize independently.
5. Handle phone providers, AI keys and payments only server-side. Nothing in the public service catalog grants access.
6. All app-visible module status and settings must come from real authenticated backend APIs, not static demo values.
7. If a module is not entitled, not active, or still in development, explain it clearly rather than show controls that pretend to work.

## Proposed interface contracts — NOT live endpoints

- GET /api/me/context : verified user/business/memberships
- GET /api/businesses/:businessId/modules : server-authorized module entitlements
- GET /api/businesses/:businessId/services/:serviceId/summary : authorized app/web summary
- GET /api/businesses/:businessId/services/:serviceId/settings : web configuration
- PATCH /api/businesses/:businessId/services/:serviceId/settings : validated, auditable updates
- GET /api/businesses/:businessId/navigation : authorized services and app quick actions

These paths are an initial proposal, not existing production APIs. First reconcile them with the active Supabase schema, Twilio bridge, existing app branch and backend. Reuse existing endpoints when possible.

## Deep links

- Public service pages: /smart-call/, /web-services/, etc.
- Proposed protected web destination: /workspace/?service=smart-call.
- App opens web destination for advanced settings with no secrets in the URL. Web verifies the shared session and business permissions.
- Unauthenticated navigation should use a safe future sign-in return route. Do not build this account/signup flow until its requirements are agreed.

## Readiness checklist before the next phase

- Product names and module IDs stable.
- Responsive and accessible product pages and navigation deployed.
- Service catalog accessible at /service-catalog.json.
- Workspace clearly identified as a nonfunctional preview.
- Documented app/web responsibilities.
- Shared identity and real integration NOT claimed to be complete.
- During phase 2: test authenticated handoff, permissions, calling UX, deep links and real backend responses before claiming service readiness.
