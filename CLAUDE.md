# Ammar Badlawala — portfolio site

Personal portfolio: Home, one case-study page per shipped project, Roadmap. Source brief: `portfolio-website-master-prompt.md`. Where it conflicts with the GitHub profile README (github.com/Ammy215/readme-profile), **the README wins** (confirmed by Ammar, 2026-09-25).

## Stack
- Astro 7 (static output), MDX for case studies, `@astrojs/sitemap`
- Vanilla Three.js, loaded only by the home hero via dynamic `import()`
- Hand-written CSS with design tokens in `src/styles/tokens.css` (no Tailwind, no UI kit)
- No Docker. Free-tier Vercel deploy target.

## Commands
- `npm run dev` — dev server (or `npx astro dev --background`, then `astro dev stop`)
- `npm run build` — static build to `dist/`
- `npm run check` — `astro check` type/diagnostics
- `npm run preview` — serve `dist/`
- `node scripts/contrast-check.mjs` — WCAG AA check on token pairs (Phase 1+)

## Layout
- `src/pages/` — routes (`index`, `roadmap`, `projects/[slug]`, `404`, `design` = internal style tile, not in sitemap)
- `src/content/projects/*.mdx` — one file per shipped project, schema in `src/content.config.ts`
- `src/data/` — skills, certs, roadmap, quotes, graph (network diagram edges, each with a `source`)
- `src/scripts/hero/` — Three.js hero
- `src/styles/` — tokens + global CSS

## Content rules (non-negotiable)
- Never invent jobs, internships, certs, stats, GitHub numbers, percentages, or skills. Missing info → placeholder + ask Ammar.
- Statuses are exact: Log Analyzer = in progress; HoneyShield = HTTP honeypot live, SSH/FTP/Telnet built & tested but not deployed (live deployment is private, link the repo); phishguard-ai = runs locally, never deployed (overrides the brief's "Live").
- Job search: entry-level security engineering, SOC / detection, or networking roles.
- ThreatHunter repo is private: "happy to walk through the code or share access on request."
- Graph edges in `src/data/graph.ts` only from documented shared facts.

## Design rules
- Not dark. Palette = three semantic channels (signal/green = logs, link/cyan = network, alert/amber = status) on a cool light ground.
- One bold moment (the 3D hero). Everything else quiet. No fade-up-on-every-card.
- Avoid: cream+terracotta, near-black+neon, hairline broadsheet, SaaS card kit, ALL-CAPS eyebrows, middle-dot meta strings, "→" on buttons.

## Process
Phased build, verification gate after each phase, one commit per phase, ask before every push.
