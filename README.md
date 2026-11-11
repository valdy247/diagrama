# VMV Business — Homepage UI concept

Minimal, white-and-black editorial hero inspired by a clean creative-agency layout, adapted to the VMV Business identity.

- Compact visual navigation (no functional links)
- Left-side brand message, copy, and service categories
- Right-side custom monochrome SVG illustrating Calls, AI Agents, Websites, Calendar, Inventory, and CRM
- Bottom monochrome VMV product strip
- Responsive desktop and mobile styles; reduced-motion support
- **Design only**: no app features, backend, authentication, active menus or CTAs

## Local development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
```

Vercel serves the generated `dist/` from Vite. The old Three.js rotating cube prototype was removed. No external imagery or runtime dependencies are necessary.
