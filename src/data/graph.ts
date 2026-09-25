// Data for the hero scene and its accessible twin.
// Layers run outside-in: where traffic first touches a defense, down to where it is correlated.
// Hubs are real shared dependencies; every link cites where the fact comes from.
// These are separate apps — the diagram shows coverage and shared infrastructure, not live integration.

export type Channel = 'signal' | 'link';

export interface Layer {
  id: string;
  label: string;
}

export interface ProjectNode {
  slug: string;
  name: string;
  layer: string;
  channel: Channel;
  inProgress?: boolean;
}

export interface Hub {
  id: string;
  label: string;
  projects: string[];
  source: string;
}

export const layers: Layer[] = [
  { id: 'deception', label: 'Deception' },
  { id: 'network', label: 'Network traffic' },
  { id: 'web', label: 'Web and URLs' },
  { id: 'files', label: 'Files' },
  { id: 'logs', label: 'Logs' },
  { id: 'intel', label: 'Threat intel' },
  { id: 'correlation', label: 'Correlation' },
];

export const nodes: ProjectNode[] = [
  { slug: 'honeyshield', name: 'HoneyShield', layer: 'deception', channel: 'link' },
  { slug: 'netsentinel', name: 'NetSentinel', layer: 'network', channel: 'link' },
  { slug: 'phishguard-ai', name: 'phishguard-ai', layer: 'web', channel: 'link' },
  { slug: 'fileshield', name: 'FileShield', layer: 'files', channel: 'signal' },
  { slug: 'intelligent-log-analyzer', name: 'Intelligent Log Analyzer', layer: 'logs', channel: 'signal', inProgress: true },
  { slug: 'threathunter', name: 'ThreatHunter', layer: 'intel', channel: 'link' },
  { slug: 'mini-siem', name: 'Mini SIEM', layer: 'correlation', channel: 'signal' },
];

export const hubs: Hub[] = [
  {
    id: 'abuseipdb-otx',
    label: 'AbuseIPDB + AlienVault OTX enrichment',
    projects: ['honeyshield', 'intelligent-log-analyzer', 'mini-siem', 'threathunter'],
    source: 'Master brief §5 (HoneyShield, Log Analyzer); profile README (Mini SIEM, ThreatHunter)',
  },
  {
    id: 'groq',
    label: 'Groq LLM calls',
    projects: ['mini-siem', 'threathunter', 'netsentinel'],
    source: 'Master brief §8 (Mini SIEM); profile README (ThreatHunter, NetSentinel)',
  },
  {
    id: 'supabase',
    label: 'Supabase Postgres',
    projects: ['netsentinel', 'threathunter', 'intelligent-log-analyzer'],
    source: 'Master brief §5 stacks',
  },
];
