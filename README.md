# affgo-cdn

Auto-generated CDN assets for the Affiliate GO Canvas deployment.

Source of truth: `kode.html` in the private repo `arulbarker/affgogeminifree`.
Built by `scripts/build-cdn.mjs` in that repo. Do not edit files here by hand —
changes will be overwritten on the next build.

Files:
- `bundle-classic.js` — concatenated inline classic <script> blocks
- `bundle-module.js` — inline type="module" script (Firebase + main app)
- `styles.css` — extracted <style> contents

Served via jsDelivr at:
```
https://cdn.jsdelivr.net/gh/arulbarker/affgo-cdn@main/<file>
```

Canvas shell references the `@main` branch URL and stays stable across
releases — paste once. Build pipeline purges jsDelivr cache after each push
so updates propagate within seconds.

Last build: 2026-06-03T13:20:27.692Z
