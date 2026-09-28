\# Landing page slop fix prompt



https://lipilab.pro.bd/ scored 36/100 on the AI-design-slop detector — tier Heavy — triggering 7 of 27 patterns. Reduce the score below 10 (Clean) by addressing each pattern below.



\## Issues to fix (highest weight first)



\### 1. AI-default font stack (Inter / Geist / Space Grotesk) (+8)



Why this reads as AI-slop: Inter, Geist, Space Grotesk, and Instrument Serif (italic) are the four fonts LLMs default to because Stripe/Linear/Vercel standardized them and training data is saturated with them. Using any of these signals 'AI-built' to anyone who's looked at more than 10 landing pages in 2026.



Fix: Replace the body and heading typefaces with something that actually reflects your brand. Pick from foundry sans (Söhne, Aeonik, GT America, Untitled Sans, Suisse Int'l, Pangea, Telegraf, Object Sans) OR a system-font stack (`-apple-system, BlinkMacSystemFont, Segoe UI`) for body + a single distinctive display face for H1.



Hard rule: If you can't name the foundry, don't ship the font. Inter/Geist/Space Grotesk are banned for this site.



\### 2. VibeCode Purple — filled indigo/violet CTAs (+8)



Why this reads as AI-slop: Tailwind's `indigo-600` (#6366f1) and `violet-500` (#8b5cf6) became the de-facto primary color for v0.dev, Cursor, Bolt, and Lovable templates. Any saturated purple/indigo CTA in the HSL 240–295° range reads as 'AI-coded'.



Fix: Pick a primary color anchored to your actual brand, not the LLM default. Avoid HSL hue 240–295 entirely for filled CTAs. High-contrast neutrals (pure black, off-white, rich brown) are the safest reset. If you want color, pick one saturated accent that has \*meaning\* (Stripe purple has a 10-year story; yours probably doesn't yet).



Hard rule: No #6366f1, #8b5cf6, or any HSL hue in 240–295° on filled CTAs.



\### 3. Gradient-heavy backgrounds (5+ elements) (+4)



Why this reads as AI-slop: 5+ gradient-background elements means decorative blobs, glows, conic rainbow swirls, or 'aurora' panels everywhere. This is the AI template equivalent of a 2008 MySpace page.



Fix: Aim for zero decorative gradients. At most ONE subtle gradient if it has structural purpose (a section background that aids hierarchy). Replace decorative gradients with: solid color blocks, a single tasteful photograph, real product UI screenshots, or negative space.



Hard rule: ≤1 gradient element total on the page.



\### 4. Glassmorphism (backdrop-filter blur on translucent layers) (+4)



Why this reads as AI-slop: `backdrop-filter: blur()` on translucent layers is a 2021 trend that AI templates kept reproducing. It always reads as decorative-for-the-sake-of-it and signals 'theme.css from a Bolt starter'.



Fix: Remove all backdrop-filter blur. Use opaque surfaces with strong contrast. If you need depth, a single subtle box-shadow (0 1px 2px rgba(0,0,0,0.05)) does more with less.



Hard rule: No `backdrop-filter: blur()` anywhere on the page.



\### 5. Big colored box-shadow glows (purple/blue/pink) (+4)



Why this reads as AI-slop: Big colored `box-shadow` glows under hero buttons / behind product images / inside cards are the AI template's idea of 'futuristic'. They never have brand justification.



Fix: Remove colored glows entirely. If you need shadow, use neutral grey (0 4px 12px rgba(0,0,0,0.08)) at most. If you want visual interest behind your hero, use a real product screenshot or video, not a glow.



Hard rule: No box-shadow with a saturated color (red/orange/yellow/green/blue/purple/pink). Greys only, ≤8% opacity.



\### 6. Perma dark mode + medium-grey body text (+4)



Why this reads as AI-slop: Dark background + mid-grey body text (#a0a0a0 region, HSL saturation <15%, L 0.35–0.75) is the AI default for 'premium' feel. The mid-grey body text fails WCAG AA and signals 'I let v0 pick the colors'.



Fix: Either: (a) go full light mode with crisp dark text on cream/white, OR (b) keep dark but increase body text contrast to at least #d4d4d8 (L 0.85+). Better: ship both themes and respect `prefers-color-scheme`.



Hard rule: Body text on dark backgrounds must have L ≥ 0.85. No defaulting to dark — the user's system preference is the default.



\### 7. Cards nested inside cards (+4)



Why this reads as AI-slop: Cards inside cards (a bordered/shadowed/rounded container holding more bordered/shadowed/rounded containers) create visual noise and excessive depth — a reflexive AI layout move where every group gets wrapped in its own panel.



Fix: Flatten the hierarchy. Pick ONE level to be the card and use spacing, typography, and dividers for the inner structure instead of nesting more containers. A card holding three sub-cards should usually be a card holding three text blocks separated by space or a hairline.



Hard rule: No card-like container inside another card-like container. One level of elevation, max.



Do not replace one slop pattern with another. Keep everything not listed above — it already passes.

