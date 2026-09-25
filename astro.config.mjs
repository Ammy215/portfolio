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
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: ['300', '400', '500', '600', '700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
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
