// Master brief §14, verbatim. "Use where a personal-brand line fits... not stacked all in one
// place" — Phase 3 spreads these across About, a section break, and the footer rather than
// pulling from one array in sequence. `id` lets a component ask for one specific line
// (the footer, for instance, always uses 'consistency') without depending on array order.
export interface Quote {
  id: string;
  text: string;
}

export const quotes: Quote[] = [
  { id: 'showing-up', text: "Showing up when it's easy was never the test — showing up when it isn't, is." },
  { id: 'no-vote', text: "The version of me that started this doesn't get a vote on whether I finish it." },
  { id: 'decided', text: "I'm not chasing motivation. I already decided, and decisions don't need to feel good every day." },
  { id: 'skipped-day', text: "Every skipped day makes tomorrow's the one that matters more — so I don't skip." },
  { id: 'whole-thing', text: "I didn't sign up for the parts that were easy. I signed up for the whole thing." },
  { id: 'consistency', text: "Consistency doesn't ask how I feel about it. It just asks if I showed up." },
];

export const quoteById = (id: string) => quotes.find((q) => q.id === id)!;
