<div align="center">

# লিপিল্যাব · LipiLab

### Professional Bangla Text Conversion Suite

**Convert Bangla text between Unicode and legacy Bijoy — plain text *and* full Word (DOCX) files — without breaking a single bit of your formatting.**

<br>

### 🔗 Live site → **[lipilab.pro.bd](https://lipilab.pro.bd)**

<br>

[![Live](https://img.shields.io/badge/live-lipilab.pro.bd-6c63ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://lipilab.pro.bd)
[![Version](https://img.shields.io/badge/version-v1.0.0-6c63ff?style=for-the-badge)](https://lipilab.pro.bd)
[![No Backend](https://img.shields.io/badge/backend-none-22c55e?style=for-the-badge)](https://lipilab.pro.bd)
[![Privacy](https://img.shields.io/badge/privacy-100%25_client--side-22c55e?style=for-the-badge)](#-privacy--security)
[![Free](https://img.shields.io/badge/cost-free_forever-a855f7?style=for-the-badge)](https://lipilab.pro.bd)

**Free forever · No signup · No upload · Works offline**

</div>

---

## 📑 Table of Contents

- [What is LipiLab?](#-what-is-lipilab)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Run It Locally](#-run-it-locally)
- [Deployment](#-deployment)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Privacy & Security](#-privacy--security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Credits](#-credits)

---

## 💡 What is LipiLab?

Bangla has two parallel worlds of digital text:

| Encoding | Where you meet it |
|---|---|
| **Unicode** (ইউনিকোড) | Modern web, WhatsApp, Facebook, mobile keyboards, most new documents |
| **Bijoy** (বিজয়) | Legacy documents, government files, newspapers, old Word templates, printing presses |

Copying text from one world into the other produces garbage — broken conjuncts, misplaced vowel signs, corrupted reph. Fixing it by hand takes hours.

**LipiLab solves that in one click.**

It is a **pure browser application** — no server, no database, no account. You paste or upload, it converts, you copy or download. Your text never leaves your device.

The distinguishing feature is **DOCX round-trip conversion**: instead of dumping text into a new blank file (which destroys your work), LipiLab opens your `.docx` archive, rewrites the Bangla text *inside* the XML, swaps fonts where needed, and hands the file back — **bold stays bold, tables stay tables, columns stay columns, headers stay headers.**

---

## ✨ Features

### 🔄 Conversion Engine

- **Bidirectional** — Unicode → Bijoy **and** Bijoy → Unicode.
- **Auto direction detection** — figures out which way you meant; or pick a direction manually (`Unicode → Bijoy`, `Bijoy → Unicode`, `Auto`).
- **Live mode** — output updates as you type (toggle with `Ctrl + L`), or hit **Convert** to run it manually.
- **Mixed-script safe** — an English sentence inside a Bangla paragraph, phone numbers, e-mails, URLs and digits all survive untouched. Only Bangla content is converted.
- **Conjunct (যুক্তাক্ষর) aware** — a large hand-verified map covers hundreds of conjuncts, `র-ফলা`, `্র` / `্য` fola and nukta forms.
- **Vowel-sign reordering** — Bangla stores `ি ে ৈ ো` *visually* after the consonant while Bijoy stores them *before* it; LipiLab re-arranges them in both directions so nothing ends up on the wrong side of the letter.
- **Unmappable warning badge** — the status bar shows a count of characters it could not map, so you are never silently handed a wrong result.

### 📄 DOCX Round-Trip (the flagship feature)

- **Upload a `.docx`, download a `.docx`** — same file, same layout, converted text.
- **Formatting preserved** — bold, italic, underline, colours, fonts, paragraphs, lists, **tables**, columns, page breaks and numbering all survive.
- **Headers & footers included** — they are patched too, not just the main body.
- **Automatic font switching** — Bijoy output runs get a legacy Bangla font (e.g. `SutonnyMJ`), Unicode output runs get a Unicode Bangla font, so the text is *readable* on the other side as well.
- **Smart run merging** — adjacent runs with identical formatting are merged before conversion to avoid splitting words across runs.
- **Blank DOCX generation** — no template needed if you just want a clean Word file out of your converted text.
- **Template strip** — a small badge shows when a DOCX template is loaded, with a one-click remove button.

### 🧰 Editor & UX

- **Dual panels** with a swap button (and `Ctrl + Shift + S`) to reverse input/output.
- **Undo / Redo** with a real history stack.
- **Paste**, **Upload** (`.txt`, `.docx`), **Clear**, **Copy**.
- **Download** as `.txt`, `.docx`, or `.pdf` *(PDF — coming soon)*.
- **Live stats** — character and word counters for both panels.
- **Three font sizes** for both the input and output panes.
- **Dark & light theme** — follows your system preference, with a manual override (`Ctrl + D`) that is remembered.
- **Keyboard shortcuts panel** (`?`) with a full reference.
- **Features notice-board popup** — bilingual (**বাংলা / English**) feature list, one tap to switch language.
- **Non-blocking toasts** — capped at 3 visible at a time so they never stack off-screen.
- **Offline indicator** in the footer.
- **Fully responsive** — from 360 px phones to ultra-wide desktops.
- **Accessibility-minded** — semantic landmarks, ARIA roles/labels, live regions for status and errors, visible focus rings, `prefers-reduced-motion` support.

### 💸 Monetisation (honest and transparent)

LipiLab is free forever. Server, domain and maintenance costs are covered by small ad slots. `partner.js` keeps every ad slot in **one single file** — five named slots (`top`, `bottom`, `railLeft`, `railRight`, `postNote`) accept either a full ad-network embed script or a plain URL. If a slot is left empty, a neutral "Advertisement here" placeholder is shown instead.

There is also a **blocker-detection gate**: if an ad blocker is detected, a polite card explains why the site needs ads instead of silently breaking the experience.

### 🚧 Coming Soon

These tools already have their UI in place and are wired to a "Coming soon" toast:

- **Spell Check** — Bangla spelling correction (Normal / Advanced modes).
- **MCQ Serial** — generate an MCQ question series from a passage.
- **PDF export** — direct, formatting-preserving PDF download.


---

## 🧠 How It Works

### 1. The conversion engine

The engine lives at the top of `app.js` and is deliberately written in a terse, dependency-free style — it is proven, battle-tested logic and was kept byte-for-byte rather than "cleaned up", to avoid introducing a silent bug in the highest-risk part of the codebase.

```
Unicode input
   │
   ├─ tokenizeMixedText()      → split into Bangla / non-Bangla runs
   │                             (English, digits, punctuation pass through)
   │
   ├─ ConvertToASCII()         → Unicode ➜ Bijoy
   │   ConvertToUnicode()      → Bijoy ➜ Unicode
   │                             driven by the big lookup maps +
   │                             one compiled regex alternation
   │
   ├─ ReArrangeUnicodeText()   → fix pre-vowel (ি ে ৈ ো) + র-ফলা order
   │   ReArrangeUnicodeConvertedText()
   │
   └─ correctBijoy / correctUnicode → patch a handful of known edge cases
```

- `uni2bijoy_string_conversion_map` and `bijoy_string_conversion_map` hold the character/ligature tables.
- `buildConversionPatterns()` compiles them into a single alternation regex once, so conversion is a fast single pass over the string instead of thousands of `replace()` calls.
- `resolveMode()` decides the direction — either from the radio buttons or by analysing the input when **Auto** is selected.

### 2. DOCX round-trip

A `.docx` file is really a ZIP archive of XML parts:

```
mydocument.docx
├── word/document.xml        ← the body text
├── word/header1.xml         ← headers
├── word/footer1.xml         ← footers
├── word/styles.xml, ...
└── [Content_Types].xml, ...
```

LipiLab's flow:

1. `loadDocxFile()` reads the file with **JSZip** and finds the text-bearing parts (`findHeaderFooterParts`).
2. `patchDocxParts()` walks each part and, for every `<w:t>` text node, runs it through the converter — **only the text changes, never the structure**.
3. `ensureRunFonts()` / `setRunFont()` / `mergeSameFontRuns()` decide which font each run must carry, so converted Bangla is actually visible with the right glyph set instead of showing `????`.
4. The patched XML is zipped back up (`buildBlankDocxBlob()` handles the no-template case) and downloaded as a new `.docx`.

Because the XML tree is never rebuilt — only the string content inside text nodes is swapped — Word sees the exact same document it wrote, just with different Bangla text.

### 3. Everything else

- **Theme** — CSS custom properties on `<html data-theme>`; the choice is stored in `localStorage` and applied before first paint.
- **Undo / redo** — a bounded snapshot stack of the input/output pair.
- **Toasts** — a capped queue (`MAX_TOASTS = 3`) that removes the oldest toast before adding a new one.
- **Banners** — inline SVG with a soft ambient animation on the decorative blobs, so there is no image request and no layout shift.


---

## 🗂 Project Structure

```
.
├── index.html    # Markup: header, toolbar, converter panels, modals, SVG banners, ad slots
├── styles.css    # Complete design system: tokens, layout, components, responsive, dark mode
├── app.js        # Conversion engine + DOCX round-trip + PDF pipeline + all UI wiring
├── partner.js    # Ad slots — the ONLY file you edit to change advertising
├── CNAME         # Custom domain for GitHub Pages (lipilab.pro.bd)
└── README.md     # You are here
```

That is the entire application. **No build step, no bundler, no `node_modules`, no server code.**

---

## 🛠 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Hand-written **HTML5** | Semantic, accessible, zero framework overhead |
| Styling | **Vanilla CSS3** | Custom-property design tokens, Grid + Flexbox, dark mode, no preprocessor |
| Logic | **Vanilla JavaScript (ES5-style IIFE)** | Runs everywhere, no transpiler, no build step |
| ZIP / DOCX | [**JSZip 3.10.1**](https://stuk.github.io/jszip/) (CDN) | Read & write the `.docx` archive in the browser |
| Fonts | **Sora**, **Manrope**, **Noto Sans Bengali** (Google Fonts) | Display, UI and Bangla rendering |
| Icons | Inline **SVG** | No icon font, no extra request |
| Banners | Inline **SVG + SMIL** | Scalable, crisp on every DPI, ambient motion at near-zero cost |
| State | **`localStorage`** | Theme and editor state persistence, purely on-device |
| Hosting | **GitHub Pages** | Static, fast, free |

---

## 💻 Run It Locally

Nothing to install — it is a static site.

```bash
# 1. Clone
git clone https://github.com/afnan-samin/lipilab.git
cd lipilab

# 2. Serve it (any static server works)
python -m http.server 8080
#   or:  npx serve .
#   or:  php -S localhost:8080

# 3. Open
#   http://localhost:8080
```

You can also just double-click `index.html` — but a local server is recommended so the DOCX download and clipboard features behave exactly like production.

**Testing checklist**

1. Paste Unicode Bangla → expect correct Bijoy in the output panel.
2. Paste Bijoy Bangla with **Auto** selected → expect it detected as `Bijoy → Unicode`.
3. Upload a formatted `.docx` → convert → download → reopen in Word and confirm tables, bold text and columns are intact.
4. Toggle **Live** mode and type — the output should update as you go.
5. Try `Ctrl + D`, `Ctrl + Enter`, `Ctrl + L`, `Ctrl + Shift + S`, and `?`.

---

## 🚀 Deployment

The site is a static GitHub Pages deployment behind the custom domain **`lipilab.pro.bd`**.

```bash
git add -A
git commit -m "your message"
git push origin main
```

Settings that matter:

| Setting | Value |
|---|---|
| Pages source | Branch `main`, folder `/` (root) |
| Custom domain | `lipilab.pro.bd` (stored in the `CNAME` file) |
| Enforce HTTPS | On |

Because there is **no build step**, a `git push` is the whole deploy. Pages usually refreshes within 1–2 minutes. DNS for `lipilab.pro.bd` points at GitHub Pages, and the apex plus `www` should both resolve with HTTPS enforced.


---

## ⌨ Keyboard Shortcuts

| Keys | Action |
|---|---|
| `Ctrl` + `Enter` | Convert |
| `Ctrl` + `L` | Toggle Live mode |
| `Ctrl` + `Shift` + `C` | Clear input |
| `Ctrl` + `Shift` + `S` | Swap input / output |
| `Ctrl` + `C` | Copy output (while the output pane is focused) |
| `Ctrl` + `S` | Download as `.txt` |
| `Ctrl` + `D` | Toggle dark mode |
| `?` | Open the shortcuts panel |
| `Esc` | Close the open panel |

---

## 🔐 Privacy & Security

- **Nothing is uploaded.** There is no backend, no API, and no analytics on your text.
- **Conversion happens in your browser.** You can disconnect from the internet after the page loads and keep converting — the footer indicator shows you when you go offline.
- **DOCX files are processed in memory** with JSZip and are never transmitted anywhere.
- **External requests are limited to CDNs** — Google Fonts and the JSZip bundle — plus whatever ad code the site owner places in `partner.js`.
- **Local storage only** — the theme choice and editor state live in your own browser and are never synced.
- **Clipboard access** is used only when you press **Paste** or **Copy**.

> If a document is sensitive, let the page load once and then work offline — after that the converter needs no network at all.

---

## 🗺 Roadmap

- [x] Unicode ↔ Bijoy for plain text
- [x] Auto direction detection
- [x] Live conversion mode
- [x] DOCX round-trip with formatting preserved
- [x] Dark mode, shortcuts, undo/redo, live stats
- [ ] PDF export (UI ready)
- [ ] Bangla Spell Check (UI ready)
- [ ] MCQ Serial generator (UI ready)
- [ ] Bulk / batch DOCX conversion

---

## 🤝 Contributing

Found a broken conjunct, a mis-ordered vowel sign, or a DOCX that does not survive the round-trip? That is the most valuable kind of report.

1. Open an issue with a **minimal example** — the exact input text, the expected output and the actual output.
2. For DOCX issues, attach the smallest `.docx` that reproduces it, with any private content removed first.
3. Pull requests are welcome. Keep the conversion tables and the engine untouched unless you are fixing a verified bug — they are intentionally kept in their original form.

---

## 📄 Credits

**Developed by [Afnan Samin](https://www.facebook.com/developer.bap)**

Built with care for the Bangla typing community — for everyone still fighting with Bijoy files that refuse to open properly anywhere else.

<div align="center">
<br>

**LipiLab v1.0.0** · Free forever · Made in Bangladesh 🇧🇩

### [→ Try it live at lipilab.pro.bd](https://lipilab.pro.bd)

</div>

