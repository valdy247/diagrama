# VMV Business — Hero UI prototype

Only the hero is implemented. It is a white-and-black editorial design with three equal horizontal bands. The middle band is a genuine Three.js / WebGL cuboid with four illuminated vertical faces, rotating 90° about the Y axis every 2 seconds. Top and bottom bands remain fixed.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Vercel builds with `npm run build`, outputting `dist/`.

No live links, authentication, business features or backend are included. Reduced-motion users see the static first face, and browsers without WebGL get a static word fallback.
