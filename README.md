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
https://cdn.jsdelivr.net/gh/arulbarker/affgo-cdn@<commit-sha>/<file>
```

Pin to a commit SHA (not a branch) in production so cache is immutable.

Last build: 2026-06-03T12:08:13.941Z
