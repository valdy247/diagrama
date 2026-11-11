# VMV Business — Marketing Website (Design Preview)

VMV Business is the platform brand. Individual services use descriptive, independent names: **Smart Call**, **AI Agents**, **Web Services**, **Inventory**, **Scheduling**, and **CRM & Leads**. No product is visibly prefixed with VMV.

## Architecture and page paths

| Group | Product / service page | Path |
| --- | --- | --- |
| Communication | Smart Call | `/smart-call/` |
| Intelligence | AI Agents | `/ai-agents/` |
| Digital Presence | Web Services | `/web-services/` |
| Operations | Inventory | `/inventory/` |
| Operations | Scheduling | `/scheduling/` |
| Customers | CRM & Leads | `/crm-leads/` |
| Operations | Orders, teams and billing | `/business-operations/` |
| Growth | Marketing & Analytics | `/marketing-analytics/` |
| Intelligence | Automations | `/automations/` |

The home page at `/` introduces the full ecosystem and links to each product or related group. Related product links inside pages never mix unrelated categories (e.g., Smart Call and Web Services are separate pages). The site uses Vite multipage output (`vite.config.js`) and CSS in `src/site.css` plus `src/product-pages.css`.

## Design

- White, edge-to-edge canvas and monochrome editorial typography.
- Custom SVG illustration, product navigation and category filters on the homepage.
- Independent product landing pages with illustrated interface previews, three product concepts, simple workflows, mobile-vs-web responsibilities and related services.
- Responsive layouts across desktop and mobile.

## Scope / honesty

This is a **public-facing UI/UX concept**, not a live business-management platform. There are no operational CRM, phone, translation, website-builder, payment, scheduling, or AI-agent features connected to this frontend. Sample screens and data are fictional. The phone feature is in a separate pilot; other modules are in development or planned. There is no pricing, customer authentication or backend integration here.

## Develop locally

    npm install
    npm run dev

## Build

    npm run build

Vercel serves the output in `dist/` from the `main` branch. Every product page is included in Vite's static multi-page build.
