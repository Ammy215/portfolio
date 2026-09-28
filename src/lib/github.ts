// Build-time-only GitHub activity: last push date + main language, straight from the API.
// Runs exclusively in Astro frontmatter (server/build context) — never shipped to the client,
// so an optional token here is never exposed in frontend code or the repo.
//
// Resilience: a slow, rate-limited, or unreachable API must never fail the build or leave a
// broken/empty label. Each repo falls back independently to the last known-good value checked
// into src/data/github-activity-cache.json; if that's also missing, the field is just omitted
// (components decide whether to render anything, never a blank/undefined-looking label).
import cache from '../data/github-activity-cache.json';

export interface RepoActivity {
  pushedAt: string; // ISO date, straight from the API's pushed_at
  language: string | null;
}

const FETCH_TIMEOUT_MS = 6000;
const cacheData = cache as unknown as Record<string, RepoActivity>;

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

async function fetchOne(owner: string, repo: string): Promise<RepoActivity | null> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (typeof json.pushed_at !== 'string') return null;
    return { pushedAt: json.pushed_at, language: json.language ?? null };
  } catch {
    return null; // network error, timeout, rate limit — caller falls back to the cache
  }
}

// Memoized so every page importing this during the same build shares one fetch pass instead of
// each case-study page (plus the home Work section) re-fetching the same 6 repos independently.
let inFlight: Promise<Record<string, RepoActivity>> | null = null;

/**
 * slugToRepoUrl: e.g. { 'mini-siem': 'https://github.com/Ammy215/Mini-SIEM', ... } — only
 * entries with a real github.com URL get fetched (private/local-only projects are naturally
 * excluded by having no repoUrl at all).
 */
export function getGithubActivity(slugToRepoUrl: Record<string, string>): Promise<Record<string, RepoActivity>> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const entries = Object.entries(slugToRepoUrl);
    const results = await Promise.all(
      entries.map(async ([slug, url]) => {
        const parsed = parseGithubUrl(url);
        if (!parsed) return [slug, null] as const;
        const live = await fetchOne(parsed.owner, parsed.repo);
        return [slug, live ?? cacheData[slug] ?? null] as const;
      })
    );
    const out: Record<string, RepoActivity> = {};
    for (const [slug, activity] of results) if (activity) out[slug] = activity;
    return out;
  })();

  return inFlight;
}
