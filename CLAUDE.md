# Ammar Badlawala — portfolio site

Personal portfolio: Home, one case-study page per shipped project, Roadmap. Source brief: `portfolio-website-master-prompt.md` (local only, git-ignored). Where it conflicts with the GitHub profile README (github.com/Ammy215/Ammy215, renamed from `readme-profile` on 2026-09-25), **the README wins** (confirmed by Ammar). Corrections Ammar gives directly beat both.

## Stack
- Astro 7 (static output), MDX for case studies, `@astrojs/sitemap`, Astro Fonts API (Archivo from Google, Departure Mono self-hosted)
- Vanilla Three.js, loaded only by the home hero via dynamic `import()` (~140 KB gzipped; budget 180 KB)
- Hand-written CSS with design tokens in `src/styles/tokens.css` (no Tailwind, no UI kit)
- No Docker. Free-tier Vercel deploy target (not yet deployed; `astro.config.mjs`'s `site` is still a placeholder domain — replace at deploy time).

## Commands
- `npm run dev` — dev server (or `npx astro dev --background`, then `astro dev stop`)
- `npm run build` — static build to `dist/` (does NOT type-check; always also run `npm run check`)
- `npm run check` — `astro check` type/diagnostics
- `npm run preview` — serve `dist/`
- `node scripts/contrast-check.mjs` — WCAG AA check on every text/background token pair

## Layout
- `src/pages/` — `index` (home), `roadmap`, `projects/[slug]` (case study, from the content collection), `404`. No internal style-tile page anymore — it was superseded by the real pages and deleted.
- `src/content/projects/*.mdx` + `src/content.config.ts` — one file per shipped project; frontmatter has status/stack/links/stats, MDX body is the narrative. Single source of truth for project facts — nothing about a project is hardcoded elsewhere.
- `src/components/` — `Hero` (3D + copy), `Work` (bento, reads the content collection), `Skills`, `About`, `RoadmapTeaser`, `Contact`, `Footer` (in BaseLayout, every page), `UptimeDot` (browser-side reachability check, no static "live" claims)
- `src/data/profile.ts` — name, email, links, certifications, `openTo`, `nowBuilding`, `resume` (null = hidden everywhere), `readme` link
- `src/data/graph.ts` — layers, zones, shared-dependency hubs for the 3D diorama (each hub cites its `source`)
- `src/data/skills.ts`, `roadmap.ts`, `quotes.ts` — tiered skills, roadmap items, the 6 brand quotes (`quoteById()`)
- `src/scripts/hero/scene.ts` — the diorama (engineered variant only; illustrated variant was removed once cyan/engineered was locked)

## Content rules (non-negotiable)
- Never invent jobs, internships, certs, stats, GitHub numbers, percentages, or skills. Missing info → placeholder + ask Ammar.
- Statuses are exact: Log Analyzer = in progress; HoneyShield = HTTP honeypot live, SSH/FTP/Telnet built & tested but not deployed (live deployment is private, link the repo); phishguard-ai = runs locally, never deployed (overrides the brief's "Live"); ThreatHunter = live, private repo.
- About wording (Ammar-approved): "a multi-protocol honeypot with its HTTP trap live in production".
- Job search: entry-level security engineering, SOC / detection, or networking roles.
- ThreatHunter repo is private: "happy to walk through the code or share access on request."
- Graph edges in `src/data/graph.ts` only from documented shared facts.
- Blocked until Ammar supplies real input: TryHackMe stats card (needs screenshot), resume link (needs PDF), photo + pixel character (placeholders in About).
- GitHub repo links (Mini-SIEM, Honeypot-system, Intelligent-Log-Analyzer, Metadata-and-File-Analyzer, Network-Anomaly-Detector, phishguard-ai, Ammy215/Ammy215) were all confirmed public earlier in the build; a later re-check hit a local network failure reaching github.com specifically (not a real site problem — re-verify opportunistically, don't block on it).

## Design (locked 2026-09-25)
- World colour **cyan** (#38bdf8) floods the hero; amber is the accent (quote band). Not dark. Type on colour is always ink.
- Type: Archivo condensed (wdth 62) Black uppercase for display, normal width for body; Departure Mono for data/tags only.
- Hero headline "Build it. Break it. Fix it."; the name appears large only in the top bar mark, not as the h1 text.
- Hero 3D is the **engineered** variant: abstract modules (rack, decoy cage, slatted filter, scanner ring, file plates, log strata), thin panel firewall with gates, survey grid. No literal icons or puns (no bees, fish, cones, trees) — reads as "toy".
- "Now building" appears in the hero only. Never duplicate it elsewhere.
- Project cards are colour blocks; elevation/stripes encode status. Live cards show a browser-side reachability dot (`UptimeDot`), never a static claim.
- One bold moment (the 3D hero). Everything else quiet. No fade-up-on-every-card.
- Avoid: cream+terracotta, near-black+neon, hairline broadsheet, SaaS card kit, ALL-CAPS eyebrows, middle-dot meta strings, "→" on buttons, visual puns.
- `.wrap`'s width MUST stay `width: min(100% - 2 * var(--gutter), var(--page-max))` (not a max-width+padding rewrite) — the two are not visually equivalent for left-aligned flex/grid children; a max-width+padding version was tried and reverted 2026-09-27 after it shifted the hero headline into the 3D diorama.

## Testing notes (this machine)
- The local headless-Edge screenshot setup (`Start-Process msedge.exe --headless=new --window-size=W,H`) has a **hard floor around ~496px** — requesting a narrower window silently snaps to ~496–500px CSS viewport while the saved screenshot PNG keeps the requested (narrower) dimensions, making real content look like it overflows when it doesn't. Confirmed via a direct `document.documentElement.clientWidth` probe. Verify "mobile" layouts at **520px or wider** instead of true phone widths (360–430px) until better tooling (e.g. Playwright) is set up — don't re-diagnose this from scratch if a narrow screenshot looks broken, check width first.
- Bare `curl` to github.com (not api.github.com) gets blocked/returns nothing useful; use `gh api` for GitHub checks instead.

## Process
Phased build, verification gate after each phase, one commit per phase, ask before every push. Status: Phases 0–3 done (2026-09-27) — scaffold, design system, content layer + real pages (Home, 7 case studies, Roadmap, 404), plus JSON-LD and robots.txt pulled forward from Phase 6. All local commits, not yet pushed. Next: Phase 4 (3D hero polish — mostly already solid, revisit perf/reduced-motion/no-WebGL on a real device), Phase 5 (live GitHub data at build time — TryHackMe stays blocked on Ammar's screenshot), Phase 6 (remaining SEO/accessibility/Lighthouse pass), Phase 7 (Vercel deploy).
