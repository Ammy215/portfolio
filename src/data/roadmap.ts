// Not-yet-built ideas — master brief §6. Direction, not deliverables: no status badge here,
// ever. The 3D visualizer gets its own longer framing (an independent ambition, not a promise);
// everything else is a flat list.
export interface RoadmapItem {
  slug: string;
  title: string;
  blurb?: string;
}

export const flagshipRoadmap: RoadmapItem = {
  slug: '3d-network-topology-visualizer',
  title: '3D Network Topology Visualizer',
  blurb:
    "My own independent project — not affiliated with any client or company work. Visualizing connected devices and network topology as an animated 3D scene mapped to a real physical space. I'm building this myself, and may eventually explore turning it into its own product. That's an ambition, not a promise.",
};

export const roadmap: RoadmapItem[] = [
  { slug: 'ai-soc-analyst-assistant', title: 'AI SOC Analyst Assistant' },
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
];
