// Real profile data, from the master brief §2. One source for header, contact and footer.
export const profile = {
  name: 'Ammar Badlawala',
  tagline: 'Cybersecurity × Networking × AI',
  email: 'ammar.badlawala@gmail.com',
  lookingFor: 'Entry-level role in security engineering, SOC / detection, or networking',
  openTo: 'Open to entry-level security engineering, SOC / detection and networking roles.',
  // Resume link stays hidden until the file exists.
  resume: null as string | null,
};

export const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ammar-badlawala-a38ba739a/' },
  { label: 'GitHub', href: 'https://github.com/Ammy215' },
  { label: 'TryHackMe', href: 'https://tryhackme.com/p/ammar.badlawala' },
  { label: 'Email', href: 'mailto:ammar.badlawala@gmail.com' },
];

// GitHub profile README. Lives in Ammy215/readme-profile (GitHub redirects this URL if the repo is renamed).
export const readme = { label: 'GitHub README', href: 'https://github.com/Ammy215/readme-profile' };

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
