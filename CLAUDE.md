# Ammar Badlawala — portfolio site

Personal portfolio: Home, one case-study page per shipped project, Roadmap. Source brief: `portfolio-website-master-prompt.md` (local only, git-ignored). Where it conflicts with the GitHub profile README (github.com/Ammy215/Ammy215, renamed from `readme-profile` on 2026-09-25), **the README wins** (confirmed by Ammar). Corrections Ammar gives directly beat both.

## Stack
- Astro 7 (static output), MDX for case studies, `@astrojs/sitemap`, Astro Fonts API (Archivo from Google, Departure Mono self-hosted)
- Vanilla Three.js, loaded only by the home hero via dynamic `import()` (~140 KB gzipped; budget 180 KB)
- Hand-written CSS with design tokens in `src/styles/tokens.css` (no Tailwind, no UI kit)
- No Docker. Free-tier Vercel deploy target — **first deploy live 2026-09-27**: https://ammar-portfolio-pi-puce.vercel.app (Vercel project `acme-15f2/ammar-portfolio`, linked to `Ammy215/portfolio`; `.vercel/` and `.env*` are git-ignored). Not yet a custom domain — swap `astro.config.mjs`'s `site` if one gets added later.

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
- **Lighthouse on this machine is not trustworthy for the hero's continuous WebGL/rAF loop specifically** (other pages/audits are fine). `--throttling-method=simulate` gave noisy, sometimes backwards results after genuine improvements; `--throttling-method=devtools` (real CPU slowdown) combined with the software-rendered `swiftshader` GPU this machine is stuck on produced a degenerate run (score 0, TTI/TBT undefined) — that combination is slower than any real device by a wide, unrepresentative margin. Don't chase a specific Lighthouse score for the hero here; trust code-level reasoning (draw calls, shadow cost, per-frame work) plus a real device instead.
- Recurring issue: headless Edge instances launched via `Start-Process` sometimes don't exit cleanly and pile up (seen 11+ orphaned `msedge.exe` at once), which caused some of the above noise. Before a round of screenshot/Lighthouse testing: `Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force`.
- **`--virtual-time-budget` does not respect real time for `requestAnimationFrame`-driven content.** Confirmed directly (2026-09-28): a 400ms virtual budget showed the hero's 3.4s intro already fully settled, reproduced twice. This is documented Chromium behaviour — virtual time fast-forwards rAF rather than pacing it — not a bug in the site. For anything timing-sensitive in the hero, either skip `--virtual-time-budget` entirely (plain `--screenshot <url>`, which respects real wall-clock time and can land mid-animation, though not at a chosen instant) or check the code's own timestamps instead of trusting a screenshot's implied timing.
- This machine's installed Edge is a full retail/consumer build (New Tab/MSN feed, sync-confirmation dialogs, several default extensions with background pages) — **not** a clean automation target. Symptoms seen: the default page on a fresh profile varies run to run (`edge://newtab/`, `edge://sync-confirmation-dialog/`, plain `about:blank`); a custom DevTools-Protocol driver (`Target.attachToTarget` + flat sessions) could successfully `Page.navigate` but then failed `Page.captureScreenshot` with "Not attached to an active page"; a local `file://` redirector page's `location.href` JS redirect was not reliably honored (landed on Edge's MSN New Tab page instead once). The plain, already-proven `Start-Process ... --screenshot=<path> <url>` pattern used everywhere else in this project is unaffected and remains reliable — the failures above were specific to building a *custom* same-session CDP driver for precisely-timed captures, not to normal screenshot use.

## Process
Phased build, verification gate after each phase, one commit per phase, ask before every push. Status: Phases 0–3 done; a first Phase 7 deploy pulled forward (2026-09-27) so Phase 4 has a real URL to test on; Phase 4 (hero perf + a real intro-not-playing bug) done (2026-09-28, see below). JSON-LD and robots.txt (Phase 6 items) were also pulled forward. All commits are pushed to `origin/main` and deployed. Next: Ammar's own real-phone check of the live hero (feel/battery/heat — the thing no synthetic tool here can verify), Phase 5 (live GitHub data at build time — TryHackMe stays blocked on Ammar's screenshot), rest of Phase 6 (Lighthouse pass on the non-hero pages, which IS trustworthy here), then confirm the GitHub→Vercel auto-deploy connection fires on the next ordinary push (untested so far — every deploy to date has been a manual `vercel deploy --prod`).
- **Intro-didn't-play bug (2026-09-28, reported from Ammar's phone):** three things checked per his diagnosis request — (1) intro IS gated on `prefers-reduced-motion`, by design, confirmed directly in `Hero.astro`'s boot script; (2) intro is NOT gated by scroll/IntersectionObserver — `start()` runs unconditionally on load regardless of scroll position, so "below the fold" wasn't it; (3) no localStorage/sessionStorage/serviceWorker anywhere (grep confirmed) — ruled out a once-per-visit skip entirely. The actual bug, found while checking: the 3D boot was unconditionally deferred via `requestIdleCallback`/`setTimeout` **even for the one-frame reduced-motion case**, and the accessible fallback was hidden eagerly regardless — leaving a real window (worse on a slow connection) with neither the fallback nor any 3D visible. Fixed in `Hero.astro`: reduced-motion boots immediately (no reason to defer one cheap static frame), and the fallback now only hides once the scene has actually drawn something. Verified with repeated real-time screenshots before/after (3/3 blank → 3/3 correct). Deployed and pushed.
- The GitHub network outage from 2026-09-27 cleared on its own by 2026-09-28; all pending commits are pushed. If `git push` ever hangs again on this machine: DNS resolves fine but TCP to github.com times out at the OS level (confirmed via git, curl, and PowerShell's own HTTP client) while other sites work — it's a local network/firewall issue, not a repo problem. Don't loop retrying; note it and move on, retry next session.
- **Hero perf work (2026-09-28):** the render loop was doing real, measurable wasted work forever, not just at load — fixed in `src/scripts/hero/scene.ts`:
  - Shadow map was recomputing every frame forever (`renderer.shadowMap.autoUpdate`); now throttled to ~10fps idle / every frame during the intro, plus forced on frame 0 (reduced-motion renders exactly one frame — without the frame-0 force, the shadow texture never gets created and every shadow-receiving object renders black; this bit us once, screenshot-verified fixed).
  - Wall-panel matrices (`placeBricks`) were recomputing every frame forever even though the wall finishes building in ~1.6s and never moves again; now stops once settled (via a one-shot `bricksSettled` flag, not the `settled` flag itself, for the same reduced-motion-single-frame reason above).
  - `world.traverse()` walked the entire scene graph (100+ nodes) every frame to find ~4 objects that actually animate (spin/scan/bob); replaced with a flat array collected once at setup.
  - Once the intro settles, the whole render loop is capped to ~18fps instead of running flat-out forever — a decorative background scene doesn't need 60fps once nothing dramatic is happening.
  - Renderer tuned for phones generally: no MSAA (flat-shaded low-poly art doesn't need it), `powerPreference: 'low-power'` (was `'high-performance'` — no reason to force a phone's power-hungry GPU mode for a decorative element), shadow map halved to 1024×1024.
  - Not yet done, and a reasonable next lever if a real phone still shows jank: most station geometry is dozens of separate `Mesh` objects (not instanced), so the main (non-shadow) draw call count is still high. Merging each station's static parts into one `BufferGeometry` would cut that further but is a bigger, riskier change than everything above — worth it only if Ammar's own phone test still shows a problem.
