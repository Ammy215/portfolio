// Where each project links to. Live URLs checked 2026-09-25 (all returned 200).
// No live link: HoneyShield (its deployment is private to Ammar), Intelligent Log Analyzer (not deployed yet),
// phishguard-ai (never deployed; runs locally on localhost, confirmed by Ammar 2026-09-25 and its README).
// Those point to their public GitHub repos instead.
// Once case-study pages exist, cards link there and these become the "Live demo" / "Code" links.

export interface ProjectLinks {
  liveUrl?: string;
  repoUrl?: string; // absent = private repo
}

export const projectLinks: Record<string, ProjectLinks> = {
  'mini-siem': { liveUrl: 'https://mini-siem-five.vercel.app', repoUrl: 'https://github.com/Ammy215/Mini-SIEM' },
  netsentinel: {
    liveUrl: 'https://network-anomaly-detector-inky.vercel.app',
    repoUrl: 'https://github.com/Ammy215/Network-Anomaly-Detector',
  },
  threathunter: { liveUrl: 'https://threat-hunter-dashboard.vercel.app' },
  fileshield: {
    liveUrl: 'https://metadata-and-file-analyzer.vercel.app',
    repoUrl: 'https://github.com/Ammy215/Metadata-and-File-Analyzer',
  },
  'phishguard-ai': { repoUrl: 'https://github.com/Ammy215/phishguard-ai' },
  honeyshield: { repoUrl: 'https://github.com/Ammy215/Honeypot-system' },
  'intelligent-log-analyzer': { repoUrl: 'https://github.com/Ammy215/Intelligent-Log-Analyzer' },
};

/** Primary destination for a project: the live site if public, otherwise the code. */
export function projectHref(slug: string): string {
  const l = projectLinks[slug];
  return l?.liveUrl ?? l?.repoUrl ?? 'https://github.com/Ammy215';
}

/** Short label describing where the primary link goes. */
export function projectHrefLabel(slug: string): 'Live site' | 'Code' {
  return projectLinks[slug]?.liveUrl ? 'Live site' : 'Code';
}
