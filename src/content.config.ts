// Content collection for project case studies.
// Schema fields map directly to the case-study template (Phase 3): hero facts, then the
// what/architecture/decisions/problems narrative sections, in `body` as MDX.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    // Matches src/data/graph.ts `slug` and src/data/projects.ts keys — kept as one field,
    // not re-derived from the filename, so a rename can't silently break a cross-reference.
    slug: z.string(),
    order: z.number(), // display order on the home page, 1 = flagship
    layer: z.enum(['deception', 'network', 'web', 'files', 'logs', 'intel', 'correlation']),
    status: z.enum(['live', 'partial', 'local', 'in-progress']),
    // One line shown on the status chip. Kept in content, not computed, so wording stays exact
    // and auditable per CLAUDE.md's content rules (e.g. HoneyShield's HTTP-only nuance).
    statusLabel: z.string(),
    tagline: z.string(), // one-sentence summary for cards/meta description
    stack: z.array(z.string()),
    liveUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(), // absent = private repo, no dead link
    repoNote: z.string().optional(), // e.g. ThreatHunter's "happy to walk through the code..."
    // Every non-obvious claim traces to one of these. Checked off in the Phase 2 fact-check table.
    source: z.enum(['master-brief', 'readme', 'ammar-direct']),
  }),
});

export const collections = { projects };
