## Plan: Regenerate product vial images using the Jalapeño Peptides label

Use the uploaded KPV label artwork as the visual + color reference for all three product vial images on the homepage.

### What changes
- Copy uploaded label to `src/assets/label-kpv-reference.png` for use as an image-edit reference.
- Regenerate the 3 product vial photos (`product-bpc157-v3.jpg`, `product-tb500-v3.jpg`, `product-ghkcu-v3.jpg`) so each vial wears a wrap-around label in the exact style of the uploaded artwork:
  - White label background, bold black sketchy "JALAPEÑO" wordmark, red script "PEPTIDES", angry green jalapeño mascot with red flames, red dashed "Xmg" badge, "FOR RESEARCH PURPOSES ONLY" footer with green flask + red stars.
  - Only the peptide name on the label changes per vial: **BPC-157 / 5MG**, **TB-500 / 10MG**, **GHK-Cu / 50MG**.
  - Vial: clear glass with rubber stopper + crimp cap, soft studio lighting, dark moody backdrop with faint green/red rim light to match the site's dark biotech theme.
- Swap the `import` paths in `src/routes/index.tsx` to point at the v3 images. Leave layout, copy, and styling untouched.

### Not changing
- No layout, typography, color token, or component changes.
- Hero, trust strip, why-choose-us, footer, SEO all stay as-is.

### Files touched
- `src/assets/label-kpv-reference.png` (new — copy of upload)
- `src/assets/product-bpc157-v3.jpg`, `product-tb500-v3.jpg`, `product-ghkcu-v3.jpg` (new)
- `src/routes/index.tsx` (3 import lines)
