# LipiLab — SEO Implementation Tasks

Repo: `afnan-samin/lipilab` (GitHub Pages, static site — `index.html`, `app.js`, `styles.css`, `partner.js`)
Domain: lipilab.pro.bd

**Precondition:** DOCX conversion bugs (format flatten, silent no-op, textbox loss — see separate bug list) must be verified fixed and merged to `main` before publishing new landing pages. Multiple pages pointing at a broken converter multiplies negative first impressions, it doesn't reduce them.

---

## Phase 1 — Technical foundation (do first, blocks everything else)

### 1.1 Fix `<html lang>`
- Current: `<html lang="en">` on a Bangla-first site. Change to `<html lang="bn">`.
- If any page/section is pure English (e.g. an English-language help doc), scope `lang="en"` to that specific element instead.

### 1.2 Create separate static landing pages (same engine, new HTML shells)
Do NOT rewrite the converter engine. Each page below loads the same `app.js`/`styles.css` and pre-fills the direction toggle via a URL param or a small init flag. Content differs; underlying tool is shared.

Pages to create:
- `/unicode-to-bijoy/index.html` — targets "unicode to bijoy converter"
- `/bijoy-to-unicode/index.html` — targets "bijoy to unicode converter"
- `/docx-converter/index.html` — targets "bangla docx converter", "bijoy docx to unicode"
- `/sutonnymj-to-unicode/index.html` — targets "sutonnymj to unicode" (specific font-name searches are common and low-competition)

Each page needs, at minimum:
- Unique `<title>` (50–60 chars, primary keyword near the front)
- Unique `<meta name="description">` (140–160 chars, includes a call to action)
- One `<h1>` matching the page's target keyword (not "LipiLab" — put the brand in a subtitle instead)
- 150–300 words of original Bangla body copy explaining what the tool does and who it's for (students, government offices, publishers — reuse the use-case angles from the earlier positioning notes)
- The live converter widget, pre-set to that page's direction
- A page-specific FAQ block (see 2.1)
- Internal links to the other 3 tool pages + homepage (see 1.6)
- `<link rel="canonical" href="https://lipilab.pro.bd/unicode-to-bijoy/">` (adjust per page)

### 1.3 `sitemap.xml`
- List homepage + all tool pages + any blog/guide pages from Phase 2.
- Include `lastmod` dates.
- Reference it in `robots.txt`: `Sitemap: https://lipilab.pro.bd/sitemap.xml`

### 1.4 `robots.txt`
- Allow all crawling of public pages.
- Disallow any admin/internal paths if they exist (check `partner.js` / any `/admin` routes before they go live).

### 1.5 Google Search Console
- Verify domain ownership (DNS TXT record or HTML file method — check which the CNAME/DNS setup allows).
- Submit `sitemap.xml`.
- After ~1 week, check the Coverage report for indexing errors and the Performance report for impressions/clicks — this is the actual ground-truth data, don't guess.

### 1.6 Internal linking
- Every tool page links to the other tool pages and to homepage in the nav/footer.
- Homepage links to all 4 tool pages prominently (not buried in footer only).
- Use descriptive anchor text (e.g. "বিজয় টু ইউনিকোড কনভার্টার", not "এখানে ক্লিক করুন").

### 1.7 Open Graph + Twitter Card tags
For homepage and each tool page:
```html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://lipilab.pro.bd/...">
<meta property="og:image" content="https://lipilab.pro.bd/og-image.png">
<meta name="twitter:card" content="summary_large_image">
```
Needed because the target audience shares links in Facebook groups — a plain link with no preview gets ignored.

### 1.8 Analytics
- Add Cloudflare Web Analytics (privacy-friendly, matches the "browser-based/private" positioning) or GA4 if more detail is needed.
- This is required to know whether any of the below actually works — don't skip it.

---

## Phase 2 — Structured content (ongoing after Phase 1 ships)

### 2.1 FAQ sections + schema
On each tool page, add 5–8 FAQ items relevant to that page's keyword. Suggested pool (adapt per page, don't reuse verbatim across all 4 — that reads as duplicate content to Google):
- ইউনিকোড আর বিজয়ের মধ্যে পার্থক্য কী?
- SutonnyMJ ফন্ট কী এবং কেন এখনো ব্যবহার হয়?
- Avro থেকে Bijoy-তে কীভাবে রূপান্তর করব?
- Word ফাইলের ফরম্যাটিং (bold, table) কি অক্ষত থাকবে?
- এই টুল কি মোবাইলে কাজ করে?
- আমার ডেটা কোথায় যায়? এটা কি সার্ভারে আপলোড হয়?

Mark up with `FAQPage` JSON-LD schema:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "ইউনিকোড আর বিজয়ের মধ্যে পার্থক্য কী?",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
</script>
```
Validate with Google's Rich Results Test before publishing.

### 2.2 Guide / blog content
Create a `/guide/` or `/blog/` section. Suggested first 3 posts (pick topics with actual search demand — check via Google autocomplete / free tier of a keyword tool before committing):
- "SutonnyMJ থেকে ইউনিকোডে রূপান্তরের সম্পূর্ণ গাইড (স্ক্রিনশটসহ)"
- "বিজয় কীবোর্ড লেআউট: সম্পূর্ণ গাইড"
- "Word ডকুমেন্টের বাংলা ফরম্যাটিং সমস্যা এবং সমাধান"

Each post: 800+ words, original, includes 2–3 internal links to the tool pages, one relevant image with descriptive `alt` text.

### 2.3 WebApplication schema on homepage
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "LipiLab",
  "applicationCategory": "Utility",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0" }
}
</script>
```

---

## Phase 3 — Off-page (ongoing, low technical effort)

### 3.1 Community distribution
- Share tool pages (not just homepage) in relevant Bangla Facebook groups (DTP operators, publishers, teachers, coaching centers).
- Direct traffic + potential backlinks from group members' own posts/blogs.

### 3.2 Competitor backlink check
- Run `bijoyunicode.com` and `banglaconvert.org` through a free backlink checker (Ahrefs free tier, Ubersuggest, or Moz Link Explorer free tier).
- Note where their links come from — likely candidates: tech blogs, forum answers, university resource pages. Target the same or similar sources.

---

## Explicitly do NOT do
- Do not keyword-stuff the footer as a substitute for real content pages — it doesn't move rankings on its own.
- Do not buy backlinks — Google penalty risk.
- Do not apply for AdSense until Phase 1 + at least 3 Phase 2 posts are live — thin content plus the existing adblock-detection wall increases rejection risk.
- Do not publish the new landing pages before the DOCX conversion bug fixes are verified merged — see precondition at top.

---

## Order of execution for the agent
1. Phase 1.1 → 1.4 (foundation files, one PR)
2. Phase 1.2 (4 landing pages, can be one PR per page or one combined PR)
3. Phase 1.5, 1.8 (Search Console + analytics — manual dashboard setup, not code, flag for human to do)
4. Phase 1.6, 1.7 (internal links + OG tags — can go in the same PR as 1.2)
5. Phase 2.1 (FAQ + schema — one PR per page or combined)
6. Phase 2.2, 2.3 (ongoing content, no fixed deadline)
7. Phase 3 (manual/human task, not agent work)

After each PR: run `python scripts/office/validate.py` equivalent check isn't applicable here (that's for DOCX), but DO run the site through Google's Rich Results Test and Mobile-Friendly Test before merging.
