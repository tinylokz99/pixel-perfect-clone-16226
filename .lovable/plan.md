## Jalapeño Peptides Homepage Build Plan

### What I’ll build
A premium, mobile-first dark homepage for Jalapeño Peptides with smooth motion, polished hover states, and a biotech-meets-label-art aesthetic.

### Visual direction
- Keep the site in **dark mode** overall for a premium biotech feel.
- Lock product imagery and key brand accents to the **uploaded label color scheme**:
  - off-white / white label backgrounds
  - black typography and outlines
  - saturated jalapeño green
  - vivid warning red
- Blend this label palette with subtle lab-style glow effects in the surrounding UI so the site feels clean and premium rather than cartoonish.

### Page structure
1. **Hero section**
   - Large headline: Premium Research Peptides
   - Supporting copy for laboratory research use only
   - Glowing chemistry/lab background with restrained energy effects
   - Primary CTA to shop products
   - Your mascot/bottle artwork featured prominently

2. **Featured products**
   - Product cards with image, short description, purity percentage, badge, and CTA
   - Product card styling will echo the white-label artwork palette while sitting inside a darker luxury UI
   - Existing generated product shots will be replaced or refined so they follow the new white/black/red/green scheme

3. **Why choose us**
   - Third-party testing
   - Fast shipping
   - Secure checkout
   - Premium quality / laboratory-grade standards

4. **Compliance / disclaimer section**
   - Clear research-use-only messaging
   - Not for human consumption disclaimer

5. **Footer**
   - Brand, navigation, support links, legal/disclaimer copy

### Motion and interaction
- Smooth section reveal animations
- Premium hover lift/glow on cards and buttons
- Subtle floating/parallax feel on hero visuals
- Motion will stay restrained and polished on mobile

### SEO and structure
- Route-level metadata for the homepage
- Better title and description than the default placeholder values
- Semantic HTML with one H1
- Open Graph metadata
- Canonical URL and structured data

### Assets to use
- Use your uploaded artwork as the main brand visual references
- Copy the hero/badge art into project assets
- Use the newer uploaded white-label references to guide all product image color treatment

### Technical details
- Update `src/routes/index.tsx` from the placeholder into the full homepage
- Extend `src/styles.css` with semantic tokens, gradients, glow/shadow utilities, and animation helpers
- Adjust `src/routes/__root.tsx` metadata defaults so the app is no longer using generic Lovable placeholders
- Keep the build frontend-only and React + Tailwind-based
- Ensure the layout is responsive for the current mobile viewport first, then scales cleanly to desktop

### Result
You’ll get a complete homepage with a premium biotech storefront feel, but with the product visuals and label treatments anchored to the exact red/green/black/white scheme from your new references.