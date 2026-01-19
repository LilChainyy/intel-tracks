import { InvestorQuestion, Archetype } from '@/types/investorQuiz';

export const investorQuestions: InvestorQuestion[] = [
  {
    id: 1,
    question: "A stock you love drops 20% in price. You:",
    options: [
      { id: 'a', text: "Buy more. It's a bargain.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "Do nothing. I'm waiting 10 years anyway.", scores: { archetype: 'collector' } },
      { id: 'c', text: "Sell. I don't want to lose another penny.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "Check if the business is still \"cool.\" If yes, stay.", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 2,
    question: "How do you pick a company to buy?",
    options: [
      { id: 'a', text: "I look for \"broken\" companies that can be fixed.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "I buy brands everyone knows and loves.", scores: { archetype: 'collector' } },
      { id: 'c', text: "I don't pick. I buy a \"bundle\" of the whole market.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "I look for \"world-changing\" tech.", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 3,
    question: "What is your biggest fear?",
    options: [
      { id: 'a', text: "Overpaying for something.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "Selling a great business too early.", scores: { archetype: 'collector' } },
      { id: 'c', text: "A big market crash.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "Missing out on the \"next big thing.\"", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 4,
    question: "How many stocks do you want to own?",
    options: [
      { id: 'a', text: "Just 5 or 10 that I've studied hard.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "20 to 30 solid, famous names.", scores: { archetype: 'collector' } },
      { id: 'c', text: "Every stock in the world at once.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "5 wild \"moonshots.\"", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 5,
    question: "How long do you plan to hold a stock?",
    options: [
      { id: 'a', text: "Until the price goes back up to what it's worth.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "Basically forever.", scores: { archetype: 'collector' } },
      { id: 'c', text: "For 30+ years until I retire.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "Until the \"hype\" dies down.", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 6,
    question: "What is your \"Superpower\"?",
    options: [
      { id: 'a', text: "Finding \"deals\" in the trash bin.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "Having extreme patience.", scores: { archetype: 'collector' } },
      { id: 'c', text: "Being very safe and steady.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "Seeing the future before others.", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 7,
    question: "Where do you get your info?",
    options: [
      { id: 'a', text: "Reading boring math and spreadsheets.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "Looking at what people are actually buying at the mall.", scores: { archetype: 'collector' } },
      { id: 'c', text: "Listening to what the safest experts say.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "Reading about new inventions and ideas.", scores: { archetype: 'visionary' } }
    ]
  },
  {
    id: 8,
    question: "What does \"winning\" look like?",
    options: [
      { id: 'a', text: "Being smarter than the crowd.", scores: { archetype: 'bargain_hunter' } },
      { id: 'b', text: "Owning the best businesses on earth.", scores: { archetype: 'collector' } },
      { id: 'c', text: "Never having to worry about my money.", scores: { archetype: 'safe_player' } },
      { id: 'd', text: "Betting on a winner that changes the world.", scores: { archetype: 'visionary' } }
    ]
  }
];

export const archetypes: Archetype[] = [
  {
    id: 'bargain_hunter',
    name: 'The Bargain Hunter',
    tagline: 'You hunt for "deals." You buy when others are scared.',
    description: 'You have a keen eye for value and aren\'t afraid to go against the crowd. When others panic and sell, you see opportunity. You believe the best investments are found in places others overlook or dismiss.',
    expectedPercentage: 25,
    famousInvestors: [
      { name: 'Ben Graham', description: 'The father of value investing who taught Warren Buffett' }
    ],
    fallback: 'value_investor',
    strengths: [
      'Finding undervalued opportunities',
      'Staying calm during market panics',
      'Deep analytical thinking',
      'Contrarian mindset'
    ],
    pitfalls: [
      'Value traps - cheap stocks that stay cheap',
      'Being too early on a trade',
      'Missing growth opportunities'
    ]
  },
  {
    id: 'collector',
    name: 'The Collector',
    tagline: 'You buy quality and hold. You win by being patient.',
    description: 'You believe in buying wonderful companies at fair prices and holding them forever. Your patience is your superpower. You understand that time in the market beats timing the market.',
    expectedPercentage: 30,
    famousInvestors: [
      { name: 'Warren Buffett', description: 'The Oracle of Omaha, one of the most successful investors ever' }
    ],
    fallback: 'quality_investor',
    strengths: [
      'Long-term thinking',
      'Emotional discipline',
      'Focus on business quality',
      'Compound growth mindset'
    ],
    pitfalls: [
      'Holding losers too long',
      'Overpaying for "quality"',
      'Missing when fundamentals change'
    ]
  },
  {
    id: 'safe_player',
    name: 'The Safe Player',
    tagline: 'You hate gambling. You win by being simple and steady.',
    description: 'You prefer the tried-and-true approach. Index funds, diversification, and steady contributions are your strategy. You know you can\'t beat the market, so you\'d rather own it all.',
    expectedPercentage: 30,
    famousInvestors: [
      { name: 'Jack Bogle', description: 'Founder of Vanguard and creator of the index fund' }
    ],
    fallback: 'passive_investor',
    strengths: [
      'Low stress investing',
      'Consistent contributions',
      'Minimal fees and taxes',
      'Broad diversification'
    ],
    pitfalls: [
      'Missing out on outsized returns',
      'Inflation erosion of "safe" assets',
      'May be too conservative for your age'
    ]
  },
  {
    id: 'visionary',
    name: 'The Visionary',
    tagline: 'You want the "Future." High risk, but huge potential.',
    description: 'You\'re drawn to innovation and disruption. You want to invest in companies that will change the world, even if it means higher volatility. You see what others don\'t - yet.',
    expectedPercentage: 15,
    famousInvestors: [
      { name: 'Cathie Wood', description: 'CEO of ARK Invest, known for disruptive innovation investing' }
    ],
    fallback: 'growth_investor',
    strengths: [
      'Early trend identification',
      'Comfort with volatility',
      'Forward-thinking mindset',
      'High conviction bets'
    ],
    pitfalls: [
      'Overpaying for hype',
      'Ignoring fundamentals',
      'Holding through major drawdowns'
    ]
  }
];

export const getArchetypeById = (id: string): Archetype | undefined => {
  return archetypes.find(a => a.id === id);
};
