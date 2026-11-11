# VMV Smart Call — Control Center (preview)

## Routes
- English: `/workspace/smart-call/`
- Español: `/es/workspace/smart-call/`
- Both are private account pages. Neither shows customer information until the browser independently authenticates an existing VMV account.

## Data ownership
- The existing Supabase project is shared with the native calling pilot. No new Supabase project, accounts, or tables were created.
- All browser reads are restricted to the authenticated user's owner-scoped rows in `smartjob_profiles`, `smartjob_phone_routes`, `smartjob_call_settings`, `smartjob_call_sessions`, and `smartjob_billing_accounts`.
- Language and assistant-name updates write only `desired_language`, `caller_language`, `assistant_name`, and `updated_at` to the owner's pre-existing settings row under RLS.
- Premium greetings and voice preferences use the authenticated `/api/billing/preferences` endpoint in smartjob; the backend checks Pro/Premium eligibility, sanitizes input, and writes using server-side credentials.
- The preview branch's Vercel environment variable `VITE_SMARTCALL_API_URL` selects the matching smartjob preview API. The production fallback is `https://smartjob-xi.vercel.app`. This is a public API origin, never a secret.
- CORS on the smartjob endpoint allows only VMV Business production and project preview origins. The origin check is **not** authorization; the bearer token + server-side billing/ownership checks remain required.

## Explicitly out of scope
- No route enabling, phone forwarding, number provisioning, IVR switches, or live Twilio mutations from the website.
- A configured route is not a verified incoming-call delivery. Real calls must be tested separately on an authorized iPhone.
- Other eight modules remain marked planned. Their cards must not advertise working services.
- No multi-tenant employee access or business-wide permissions; this iteration continues owner-scoped access.

## Acceptance checklist
1. Build Vite on the review branch and confirm both localized pages return successful status.
2. Test an existing account login, refresh, sign out, and browser-session isolation from iOS.
3. With two authorized test accounts, verify each sees ONLY its own business, line, history, and settings.
4. Change the assistant name and languages from the website; verify iOS reflects them and vice versa.
5. Verify same-language selection, invalid assistant name, and missing settings record cannot be saved.
6. With Starter, verify voice controls are disabled and backend POST returns 403. With Pro/Premium, verify valid voices/greetings persist, and invalid greetings are rejected.
7. Test network/API errors and mobile widths including 320px, keyboard navigation, and screen reader labels.
8. Verify the branch-specific public API origin before merging, and coordinate the backend CORS release before the website is promoted.

**This page is an authenticated preview pending real-account testing, not a statement that phone provisioning or iPhone incoming calls have passed QA.**
