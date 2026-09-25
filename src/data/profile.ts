// Real profile data, from the master brief §2. One source for header, contact and footer.
export const profile = {
  name: 'Ammar Badlawala',
  tagline: 'Cybersecurity × Networking × AI',
  email: 'ammar.badlawala@gmail.com',
  lookingFor: 'Entry-level role in security engineering, SOC / detection, or networking',
  openTo: 'Open to entry-level security engineering, SOC / detection and networking roles.',
  // What's on the bench right now. Update this line when it changes (shown in hero + footer).
  nowBuilding: {
    text: 'Intelligent Log Analyzer, enterprise rebuild',
    href: 'https://github.com/Ammy215/Intelligent-Log-Analyzer',
  },
  // Resume: set to a real file path (e.g. '/Ammar-Badlawala-Resume.pdf' in public/) once the PDF exists.
  // While null, no resume link or button renders anywhere.
  resume: null as string | null,
};

export const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ammar-badlawala-a38ba739a/' },
  { label: 'GitHub', href: 'https://github.com/Ammy215' },
  { label: 'TryHackMe', href: 'https://tryhackme.com/p/ammar.badlawala' },
  { label: 'Email', href: 'mailto:ammar.badlawala@gmail.com' },
];

// GitHub profile README. Repo renamed readme-profile -> Ammy215 on 2026-09-25 so it shows on the profile page.
export const readme = { label: 'GitHub README', href: 'https://github.com/Ammy215/Ammy215' };

export const certifications = [
  {
    issuer: 'Cisco',
    items: ['Endpoint Security', 'Network Defense', 'Networking Basics', 'Introduction to Cybersecurity'],
  },
  {
    issuer: 'Coursera',
    items: [
      'AI For Everyone',
      'Launching into Machine Learning',
      'Introduction to AI and Machine Learning on Google Cloud',
      'Getting Started with Linux Terminal',
      'Foundations of Cybersecurity',
      'Introduction to Networking and Cloud Computing',
    ],
  },
];
