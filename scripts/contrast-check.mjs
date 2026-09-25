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

// Every surface that carries text. Text on them is ink or ink-2; white only on ink.
const surfaces = ['paper', 'white', 'cyan', 'cyan-deep', 'cyan-pale', 'mint', 'amber', 'amber-deep', 'amber-pale'];
const pairs = [];
for (const bg of surfaces) {
  pairs.push(['ink', bg, 4.5]);
  pairs.push(['ink-2', bg, 4.5]);
}
pairs.push(['white', 'ink', 4.5]);
pairs.push(['cyan', 'ink', 4.5]); // cyan text/underline on ink blocks
pairs.push(['mint', 'ink', 4.5]);
pairs.push(['amber', 'ink', 4.5]);

let failed = 0;
for (const [fg, bg, min] of pairs) {
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${fg.padEnd(6)} on ${bg.padEnd(10)} ${r.toFixed(2).padStart(5)}:1  (min ${min})`);
}

process.exit(failed ? 1 : 0);
