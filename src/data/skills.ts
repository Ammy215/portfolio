// Three honest tiers, not binary — master brief §7, with the tier moves agreed 2026-09-25:
// RAG, LangGraph and vector DBs (ChromaDB) moved Exploring -> Familiar once NetSentinel's
// README-documented RAG pipeline made them "used", not just "read about". LangChain stays
// Exploring — it was deliberately dropped from two projects in favor of calling provider
// SDKs directly (master brief §8), so it was tried and set aside, not adopted.
export interface SkillTier {
  id: 'comfortable' | 'familiar' | 'exploring';
  label: string;
  description: string;
  skills: string[];
}

export const skillTiers: SkillTier[] = [
  {
    id: 'comfortable',
    label: 'Comfortable',
    description: 'Used repeatedly, could explain or demo confidently.',
    skills: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'React',
      'Git / GitHub',
      'REST API design',
      'JWT auth patterns',
      'Linux fundamentals',
    ],
  },
  {
    id: 'familiar',
    label: 'Familiar',
    description: "Used it, know what it's for, not fluent yet.",
    skills: [
      'Nmap / Zenmap',
      'Wireshark',
      'Next.js / TypeScript',
      'MongoDB',
      'scikit-learn',
      'Scapy / PyShark',
      'RAG pipelines',
      'LangGraph',
      'Vector databases (ChromaDB)',
      'Docker concepts',
    ],
  },
  {
    id: 'exploring',
    label: 'Exploring',
    description: "Reading and learning, haven't hands-on built with it yet.",
    skills: ['LangChain', 'Deeper ML (beyond Isolation Forest / One-Class SVM)', 'Three.js / WebGPU'],
  },
];

// Master brief §7: "I deliberately avoid Docker in my own builds so far — manual config, for
// the learning." README (FileShield) documents Docker Compose for local dev on that one
// project. Both are true; this note reconciles them without softening either into vagueness.
export const dockerNote =
  'Docker Compose runs local dev on one project (FileShield). Everywhere else I stick to manual config, on purpose — for the learning.';
