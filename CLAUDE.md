# Ammar Badlawala — portfolio site

Personal portfolio: Home, one case-study page per shipped project, Roadmap. Source brief: `portfolio-website-master-prompt.md` (local only, git-ignored). Where it conflicts with the GitHub profile README (github.com/Ammy215/Ammy215, renamed from `readme-profile` on 2026-09-25), **the README wins** (confirmed by Ammar). Corrections Ammar gives directly beat both.

## Stack
- Astro 7 (static output), MDX for case studies, `@astrojs/sitemap`, Astro Fonts API (Archivo from Google, Departure Mono self-hosted)
- Vanilla Three.js, loaded only by the home hero via dynamic `import()` (~140 KB gzipped; budget 180 KB)
- Hand-written CSS with design tokens in `src/styles/tokens.css` (no Tailwind, no UI kit)
- No Docker. Free-tier Vercel deploy target.

## Commands
- `npm run dev` — dev server (or `npx astro dev --background`, then `astro dev stop`)
- `npm run build` — static build to `dist/` (does NOT type-check; always also run `npm run check`)
- `npm run check` — `astro check` type/diagnostics
- `npm run preview` — serve `dist/`
- `node scripts/contrast-check.mjs` — WCAG AA check on every text/background token pair

## Layout
- `src/pages/` — routes. Now: `design` (internal style tile, noindex, not in sitemap). Planned: `index`, `roadmap`, `projects/[slug]`, `404`
- `src/components/` — `Hero` (3D + copy), `About`, `Contact`, `Footer` (in BaseLayout, every page), `UptimeDot`
- `src/data/profile.ts` — name, email, links, certifications, `openTo`, `nowBuilding`, `resume` (null = hidden everywhere)
- `src/data/projects.ts` — where each project links (live URL or repo); `projectHref()` is the single source
- `src/data/graph.ts` — layers, zones, shared-dependency hubs (each with a `source`)
- `src/scripts/hero/scene.ts` — the diorama
- `src/content/projects/*.mdx` — planned for Phase 2

## Content rules (non-negotiable)
- Never invent jobs, internships, certs, stats, GitHub numbers, percentages, or skills. Missing info → placeholder + ask Ammar.
- Statuses are exact: Log Analyzer = in progress; HoneyShield = HTTP honeypot live, SSH/FTP/Telnet built & tested but not deployed (live deployment is private, link the repo); phishguard-ai = runs locally, never deployed (overrides the brief's "Live"); ThreatHunter = live, private repo.
- About wording (Ammar-approved): "a multi-protocol honeypot with its HTTP trap live in production".
- Job search: entry-level security engineering, SOC / detection, or networking roles.
- ThreatHunter repo is private: "happy to walk through the code or share access on request."
- Graph edges in `src/data/graph.ts` only from documented shared facts.
- Blocked until Ammar supplies real input: TryHackMe stats card (needs screenshot), resume link (needs PDF), photo + pixel character (placeholders in About).

## Design (locked 2026-09-25)
- World colour **cyan** (#38bdf8) floods the hero; amber is the accent (quote band). Not dark. Type on colour is always ink.
- Type: Archivo condensed (wdth 62) Black uppercase for display, normal width for body; Departure Mono for data/tags only.
- Hero headline "Build it. Break it. Fix it."; the name appears large only in the top bar mark, not as the h1 text.
- Hero 3D is the **engineered** variant: abstract modules (rack, decoy cage, slatted filter, scanner ring, file plates, log strata), thin panel firewall with gates, survey grid. No literal icons or puns (no bees, fish, cones, trees) — reads as "toy".
- "Now building" appears in the hero only. Never duplicate it elsewhere.
- Project cards are colour blocks; elevation/stripes encode status. Live cards show a browser-side reachability dot (`UptimeDot`), never a static claim.
- One bold moment (the 3D hero). Everything else quiet. No fade-up-on-every-card.
- Avoid: cream+terracotta, near-black+neon, hairline broadsheet, SaaS card kit, ALL-CAPS eyebrows, middle-dot meta strings, "→" on buttons, visual puns.

## Process
Phased build, verification gate after each phase, one commit per phase, ask before every push. Status: Phases 0–1 done and approved (2026-09-25). Next: Phase 2 (content layer + fact-check table), Phase 3 (real pages: index from the style tile, case studies, roadmap, 404).
