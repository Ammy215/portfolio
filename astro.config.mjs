// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO(phase 7): replace with the real production domain once Vercel assigns it.
  site: 'https://ammar-badlawala.vercel.app',
  integrations: [
    mdx(),
    sitemap({
      // Internal style tile is never indexed.
      filter: (page) => !page.includes('/design'),
    }),
  ],
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
