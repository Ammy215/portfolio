// @ts-check
import { defineConfig } from 'astro/config';
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
});
