# turboIDE website — source

Maintainable source for the turboIDE marketing site.

## Files

- **`Turbo Website.dc.html`** — the source you edit. All copy, layout, colours,
  the recreated editor window, feature cards, keybindings, downloads, credits and
  footer live in this single file. It is a "Design Component": the markup and a
  small logic class (the live clock + the accent/scanline theme options) are
  inside `<script data-dc-script>` at the bottom.
- **`support.js`** — the runtime that renders a `.dc.html` file in the browser.
  Keep it next to the `.dc.html`. Do not edit it.
- **`index.html`** — the built, single-file version (fonts + runtime
  inlined). This is what you deploy/host. Regenerate it from the source whenever
  you change the `.dc.html` (see below).

## Editing

Open `Turbo Website.dc.html` in a browser to preview. Edit the file directly:

- **Text / links** — search for the copy or URL and change it in place.
- **Colours** — hex values are inline (deep navy `#0a1428`, window blue `#13285a`,
  amber accent `#f2a93b`). The accent is driven by the `--accent` CSS variable at
  the top of the root `<div>`, with a literal fallback everywhere it's used.
- **Theme options** — the `data-props` JSON near the bottom exposes an `accent`
  (amber / cyan / green) and a `scanlines` toggle.
- **Live clock** — in the `class Component` logic block.

The download links point at `https://github.com/aestubbs/turboIDE/releases`, and the
footer links to `https://sauvesolutions.co.uk/`.

## Deploying

Host **`index.html`** — it's fully self-contained (works offline, no
build step, no external assets).

## Rebuilding the single file

The standalone `index.html` was produced by inlining the `.dc.html`
plus its runtime and fonts into one file. If you change the source and want a
fresh single-file build outside this environment, any HTML-inlining tool works —
or ask here and it'll be regenerated.

## Credits

Fork of [magiblot/turbo](https://github.com/magiblot/turbo). Built on
[Turbo Vision](https://github.com/magiblot/tvision) and
[Scintilla](https://www.scintilla.org/). Site by Sauve Solutions.
