# Darja Shop source

This is the React source of the shop published at `/shop/`. The original Arcada layout and concept resources are retained. The published Survival Guide uses the official cover, existing book information, Payhip link and the free audio collection.

To rebuild from this source, restore `public/images`, `public/media`, and `public/fonts` from the sibling published `../shop/` directory, then run `npm ci` and `VITE_STATIC_SHOP=true npm run build`. Copy the resulting `dist/` contents into `../shop/`. The published book preview is linked to its existing hosted PDF rather than duplicated here. No service credentials are needed for this static build.
