#!/usr/bin/env node
/**
 * Compiles "Turbo Website.dc.html" (the design source) into a static index.html.
 *
 * The old index.html was a JS bundle: it shipped the page as a JSON string and
 * built the DOM in the browser, so a crawler with no JS saw ~100 characters of
 * "Unpacking...". This emits real HTML instead — every word of copy is in the
 * markup, and no JavaScript is required to render any of it.
 *
 * The design source is a "Design Component", so three things need resolving:
 *   {{ accent }} / {{ time }}  template interpolations
 *   <sc-if>                    conditional block (scanlines, default off)
 *   style-hover="..."          hover styles the runtime applied via JS listeners
 *
 * style-hover becomes real CSS. Because the elements carry inline `style`, and
 * inline styles outrank a class selector, the generated :hover declarations need
 * !important to win.
 *
 *   node build.js
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'Turbo Website.dc.html');
const OUT = path.join(DIR, 'index.html');

const SITE = 'https://turboide.co/';
const ACCENT = '#f2a93b'; // renderVals(): accentMap.amber, the default prop
const SHOW_SCANLINES = false; // renderVals(): props.scanlines ?? false

const src = fs.readFileSync(SRC, 'utf8');

/* ---------- head content lifted from the source <helmet> ---------- */

const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`source is missing ${what}`);
  return m;
};
const title = pick(/<title>([\s\S]*?)<\/title>/, '<title>')[1].trim();
const description = pick(/<meta name="description" content="([^"]*)"/, 'meta description')[1];
// the base stylesheet in <helmet> (box-sizing, smooth scroll, tvblink, ::selection)
const baseCss = pick(/<helmet>[\s\S]*?<style>([\s\S]*?)<\/style>[\s\S]*?<\/helmet>/, 'helmet <style>')[1].trim();

/* ---------- body markup ---------- */

const start = src.indexOf('<div style="--accent:');
const end = src.indexOf('</x-dc>');
if (start < 0 || end < 0) throw new Error('could not locate the root <div> inside <x-dc>');
let body = src.slice(start, end).trimEnd();

// The thumbnail is bundler metadata, not page content.
body = body.replace(/<template id="__bundler_thumbnail">[\s\S]*?<\/template>\s*/, '');

// <sc-if> renders its children only when the prop is truthy.
body = body.replace(/<sc-if[\s\S]*?<\/sc-if>\s*/g, () => {
  if (SHOW_SCANLINES) throw new Error('scanlines on: inline the <sc-if> body by hand');
  return '';
});

body = body.replace(/\{\{\s*accent\s*\}\}/g, ACCENT);
// The clock is decorative chrome. Ship a static value in the markup and let a
// few lines of JS tick it — the page is complete and readable without them.
body = body.replace(/\{\{\s*time\s*\}\}/g, '<span class="clock">00:00:00</span>');

if (/\{\{/.test(body)) {
  throw new Error('unresolved interpolation: ' + body.match(/\{\{[^}]*\}\}/)[0]);
}

/* ---------- style-hover -> real CSS ---------- */

const hoverRules = [];
body = body.replace(/\s*style-hover="([^"]*)"/g, (_, decls) => {
  const important = decls
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => `${d} !important`)
    .join('; ');
  const cls = `hv${hoverRules.length + 1}`;
  hoverRules.push(`.${cls}:hover { ${important}; }`);
  return ` class="${cls}"`;
});

if (/style-hover=/.test(body)) throw new Error('style-hover attributes survived the rewrite');

/* ---------- fonts (self-hosted, only the faces this page uses) ---------- */

const faces = JSON.parse(fs.readFileSync(path.join(DIR, 'fonts', 'fonts.json'), 'utf8'));
for (const f of faces) {
  if (!fs.existsSync(path.join(DIR, 'fonts', f.file))) throw new Error('missing font file: ' + f.file);
}
const fontCss = faces
  .map((f) =>
    [
      '@font-face {',
      `  font-family: '${f.family}';`,
      `  font-style: ${f.style};`,
      `  font-weight: ${f.weight};`,
      '  font-display: swap;',
      `  src: url("fonts/${f.file}") format('woff2');`,
      `  unicode-range: ${f.unicodeRange};`,
      '}',
    ].join('\n')
  )
  .join('\n');

// Preload the two faces the first screenful actually paints with: the hero
// wordmark (Plex Mono 700) and body copy (Plex Sans 400).
const preloads = ['ibm-plex-mono-700-latin.woff2', 'ibm-plex-sans-400-latin.woff2']
  .map((f) => `<link rel="preload" href="fonts/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n');

/* ---------- structured data ---------- */

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'turboIDE',
  description,
  url: SITE,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Linux, macOS, Windows',
  softwareVersion: '0.2.2',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
  license: 'https://github.com/aestubbs/turboIDE/blob/master/LICENSE',
  codeRepository: 'https://github.com/aestubbs/turboIDE',
  author: { '@type': 'Organization', name: 'Sauve Solutions Limited', url: 'https://sauvesolutions.co.uk/' },
};

/* ---------- emit ---------- */

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE}">
<meta name="theme-color" content="#0a1428">

<meta property="og:type" content="website">
<meta property="og:site_name" content="turboIDE">
<meta property="og:url" content="${SITE}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${SITE}og.png">

${preloads}
<style>
${fontCss}

${baseCss}

${hoverRules.join('\n')}
</style>

<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
</head>
<body>
${body}

<script>
  // Decorative only: the page is fully rendered without this.
  (function () {
    var els = document.querySelectorAll('.clock');
    if (!els.length) return;
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      var d = new Date();
      var t = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      for (var i = 0; i < els.length; i++) els[i].textContent = t;
    }
    tick();
    setInterval(tick, 1000);
  })();
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);

const noJsText = html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

console.log(`index.html  ${(html.length / 1024).toFixed(0)} KB`);
console.log(`  ${hoverRules.length} hover rules, ${faces.length} font faces`);
console.log(`  ${noJsText.length} chars of copy readable with JavaScript disabled`);
