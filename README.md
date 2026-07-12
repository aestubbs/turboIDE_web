# turboIDE website — source

Source for the turboIDE marketing site at [turboide.co](https://turboide.co/).

`index.html` is **static, pre-rendered HTML**: every word of copy is in the
markup and no JavaScript is needed to render any of it. That is deliberate — the
site used to ship as a JS bundle that assembled the page in the browser, so a
crawler without JS saw about 100 characters of "Unpacking…". Search engines,
social previews and AI crawlers now get the whole page straight from the HTML.

## Files

- **`Turbo Website.dc.html`** — the source you edit. All copy, layout, colours,
  the recreated editor window, feature cards, keybindings, downloads, credits and
  footer live in this single file. It is a "Design Component": markup plus a small
  logic class in `<script data-dc-script>` at the bottom.
- **`build.js`** — compiles the source into `index.html`. Run it after every edit.
- **`index.html`** — the built, static page. **Generated — do not edit by hand.**
- **`fonts/`** — self-hosted IBM Plex woff2 subsets (latin + latin-ext, weights
  400/600/700 — the only faces the page uses) and `fonts.json` describing them.
- **`og.png`** — 1200×630 social card. Regenerate if the hero changes.
- **`robots.txt`**, **`sitemap.xml`** — search-engine plumbing.
- **`support.js`** — the Design Component runtime. Only needed to preview the
  `.dc.html` in a browser; it is *not* used by the built site. Do not edit.

## Editing

Edit `Turbo Website.dc.html`, then rebuild:

```sh
node build.js
```

- **Text / links** — search for the copy or URL and change it in place.
- **Colours** — hex values are inline (deep navy `#0a1428`, window blue `#13285a`,
  amber accent `#f2a93b`). The accent is driven by the `--accent` CSS variable.
- **Page title / meta description** — the `<title>` and `<meta name="description">`
  in the source `<helmet>` block. The build lifts them into the static `<head>`.

Open the `.dc.html` directly in a browser to preview it live (that path uses
`support.js`); open the built `index.html` to see exactly what ships.

## What the build does

The source is a Design Component, so `build.js` resolves the parts the runtime
used to handle in the browser:

- `{{ accent }}` and `{{ time }}` interpolations. The clock is decorative: the
  build emits a static value and a few lines of JS tick it, so the page is
  complete without them.
- `<sc-if>` conditionals (scanlines, off by default).
- `style-hover="…"` attributes, which the runtime applied as JS event listeners.
  These become real CSS `:hover` rules. They carry `!important` because the
  elements have inline `style` attributes, which would otherwise outrank a class.

It then emits the `<head>`: title, description, canonical, Open Graph and Twitter
cards, `SoftwareApplication` JSON-LD, self-hosted `@font-face` rules, and a preload
for the two faces the first screenful paints with.

`build.js` fails loudly rather than shipping something broken — an unresolved
`{{ … }}`, a surviving `style-hover`, or a missing font file all abort the build.

## Deploying

Push to `main`. GitHub Pages serves `index.html` plus `fonts/`, `og.png`,
`robots.txt` and `sitemap.xml` at [turboide.co](https://turboide.co/) (see `CNAME`).

## Credits

Fork of [magiblot/turbo](https://github.com/magiblot/turbo). Built on
[Turbo Vision](https://github.com/magiblot/tvision) and
[Scintilla](https://www.scintilla.org/). Site by Sauve Solutions.
