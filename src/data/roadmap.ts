// Not-yet-built ideas — master brief §6. Direction, not deliverables: no status badge here,
// ever. The AI SOC Analyst gets its own longer framing (the capstone that ties the shipped
// projects together); everything else, including the 3D visualizer, is a flat list.
export interface RoadmapItem {
  slug: string;
  title: string;
  blurb?: string;
}

export const flagshipRoadmap: RoadmapItem = {
  slug: 'ai-soc-analyst-assistant',
  title: 'AI SOC Analyst Assistant',
  blurb:
    "The intelligence layer over everything I've already shipped: it pulls incidents from Mini SIEM, HoneyShield and NetSentinel, then uses RAG, AI agents and tool calling to investigate them — retrieving context, correlating evidence, and drafting a report. The AI investigates and recommends; I stay the one approving any action. Deliberately last to build, not first: it needs the SIEM, honeypot and anomaly detector underneath it to already exist before it has anything real to investigate.",
};

export const roadmap: RoadmapItem[] = [
  { slug: 'ai-threat-report-generator', title: 'AI Threat Report Generator' },
  { slug: 'malware-analysis-sandbox', title: 'Malware Analysis Sandbox' },
  { slug: 'fileless-malware-detector', title: 'Fileless Malware Detector' },
  { slug: 'usb-ransomware-detection', title: 'USB-based threat detection / Ransomware detection & response' },
  { slug: 'lightweight-server', title: 'A lightweight server, built from scratch' },
  { slug: 'version-control-tool', title: 'A Git/GitHub-style version control tool, built from scratch' },
  { slug: 'shell-from-scratch', title: 'A shell, built from scratch' },
  { slug: 'cyber-escape-room', title: 'Cyber Escape Room Platform' },
  { slug: 'personal-cyber-lab-manager', title: 'Personal Cyber Lab Manager' },
  { slug: 'digital-forensics-toolkit', title: 'Digital Forensics Lite Toolkit' },
  { slug: 'room-based-learning-platform', title: 'A TryHackMe-style room-based learning platform, my own version' },
  { slug: '3d-network-topology-visualizer', title: '3D Network Topology Visualizer' },
];
