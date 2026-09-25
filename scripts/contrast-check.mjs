// WCAG 2.x contrast check for the token palette.
// Reads hex values straight from src/styles/tokens.css so there is one source of truth.
// Exits 1 if any required pair fails.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(([, name, hex]) => [name, hex])
);

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum] — 4.5 for body text, 3 for non-text UI (focus rings, borders).
const pairs = [];
for (const bg of ['ground', 'panel']) {
  for (const fg of ['ink', 'ink-2', 'signal', 'link', 'alert']) pairs.push([fg, bg, 4.5]);
  pairs.push(['link', bg, 3]); // focus ring
}
pairs.push(['ground', 'ink', 4.5]); // inverted chips

let failed = 0;
for (const [fg, bg, min] of pairs) {
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(
    `${ok ? 'pass' : 'FAIL'}  ${fg.padEnd(7)} on ${bg.padEnd(6)} ${r.toFixed(2).padStart(5)}:1  (min ${min})`
  );
}
// Informational: decorative noise is exempt from text contrast but shouldn't vanish.
console.log(`info  noise   on ground  ${ratio(tokens.noise, tokens.ground).toFixed(2)}:1  (decorative)`);

process.exit(failed ? 1 : 0);
