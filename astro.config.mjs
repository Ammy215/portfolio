// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // First live deploy, 2026-09-27 (Vercel-assigned; a cleaner custom domain can replace this later).
  site: 'https://ammar-portfolio-pi-puce.vercel.app',
  integrations: [mdx(), sitemap()],
  // Always external CSS files, never inlined — keeps the CSP's style-src to 'self' with no
  // per-build inline-style hashes to maintain (see vercel.json).
  build: { inlineStylesheets: 'never' },
  fonts: [
    {
      // One variable family for everything readable: condensed Black for display, normal width for body.
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial Narrow', 'system-ui', 'sans-serif'],
      options: {
        experimental: {
          variableAxis: { wdth: [['62', '125']] },
        },
      },
    },
    {
      // Self-hosted: not on Google/Fontsource. MIT licensed, see src/assets/fonts/DepartureMono-LICENSE.txt
      provider: fontProviders.local(),
      name: 'Departure Mono',
      cssVariable: '--font-departure',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/DepartureMono-Regular.woff2'],
            weight: '400',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
