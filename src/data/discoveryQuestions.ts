export interface MarketQuestion {
  id: string;
  question: string;
  options: string[];
  popular: string;  // The majority answer
  explanation: string;
}

export interface ThemeQuestion {
  id: string;
  question: string;
  options: string[];
  popular: string;
  explanation: string;
}

export interface ThemeData {
  themeId: string;
  themeName: string;
  icon: string;
  questions: ThemeQuestion[];
}

// Market questions - 10 core financial literacy questions
export const marketQuestions: MarketQuestion[] = [
  {
    id: "market-1",
    question: "The Fed says they'll 'keep rates higher for longer.' Who gets hurt the most?",
    options: ["Tech companies that borrowed a lot to grow", "Oil companies that generate cash", "About the same for everyone"],
    popular: "Tech companies that borrowed a lot to grow",
    explanation: "Higher rates = expensive debt. Companies that rely on borrowing to grow (like unprofitable tech) feel the most pain. Cash-rich companies care less."
  },
  {
    id: "market-2",
    question: "Jobs report comes in strong — economy added 300K jobs. The stock market drops. Why?",
    options: ["Strong economy = Fed won't cut rates = bad for stocks", "More jobs = higher wages = companies make less profit", "Investors are just irrational"],
    popular: "Strong economy = Fed won't cut rates = bad for stocks",
    explanation: "Wall Street is obsessed with rate cuts. A strong economy means the Fed has no reason to cut rates, so stocks sell off. Weird, but that's how it works."
  },
  {
    id: "market-3",
    question: "The VIX jumps from 12 to 25 in one day. What just happened?",
    options: ["Something scared the market — people are buying protection", "The market is about to rally", "Nothing important, it's just a number"],
    popular: "Something scared the market — people are buying protection",
    explanation: "VIX measures fear. When it spikes, it means traders are panic-buying options to protect themselves. Usually means a big drop happened or is expected."
  },
  {
    id: "market-4",
    question: "Inflation is at 3%, and your savings account pays 1%. What's actually happening to your money?",
    options: ["It's growing slowly", "It's losing purchasing power", "It's staying the same"],
    popular: "It's losing purchasing power",
    explanation: "If prices rise 3% but you only earn 1%, you're losing 2% in real terms. This is why people invest — to beat inflation."
  },
  {
    id: "market-5",
    question: "A company beats earnings by 20%, but the stock drops 8%. What's going on?",
    options: ["The market expected even more — 'buy the rumor, sell the news'", "Investors are stupid", "Earnings don't matter"],
    popular: "The market expected even more — 'buy the rumor, sell the news'",
    explanation: "Stock prices reflect expectations, not just results. If everyone expected a 30% beat, a 20% beat is a disappointment. The stock was 'priced for perfection.'"
  },
  {
    id: "market-6",
    question: "Everyone knows AI is the future. Is it a good idea to buy AI stocks now?",
    options: ["Yes, AI will keep growing", "Maybe not — if everyone knows, the price already reflects it", "Definitely not, AI is overhyped"],
    popular: "Maybe not — if everyone knows, the price already reflects it",
    explanation: "If something is 'obvious,' the stock price already includes that expectation. The question isn't 'is AI big?' — it's 'is AI bigger than what's already priced in?'"
  },
  {
    id: "market-7",
    question: "10-year Treasury yield rises from 4% to 5%. What happens to growth stocks?",
    options: ["They usually drop — bonds become more attractive", "They usually rise — higher yields mean confidence", "No connection"],
    popular: "They usually drop — bonds become more attractive",
    explanation: "When bonds pay more, investors have less reason to take risks on stocks. Growth stocks (which promise future profits) get hit hardest because that future money is worth less today."
  },
  {
    id: "market-8",
    question: "When people say 'the market is up 20% this year,' what are they usually talking about?",
    options: ["The S&P 500 — an index of 500 big US companies", "Every stock in America", "The Dow Jones"],
    popular: "The S&P 500 — an index of 500 big US companies",
    explanation: "'The market' usually means the S&P 500. It's market-cap weighted, so big companies like Apple and Microsoft move it more than smaller ones."
  },
  {
    id: "market-9",
    question: "Interest rates are at 5%. A hedge fund manager says 'cash is king.' What does he mean?",
    options: ["You can earn 5% risk-free — why take stock market risk?", "He's scared of inflation", "He wants to buy real estate"],
    popular: "You can earn 5% risk-free — why take stock market risk?",
    explanation: "When cash earns 5% with zero risk, stocks have to offer way better returns to be worth it. High rates make investors pickier."
  },
  {
    id: "market-10",
    question: "The market crashed 30% last year, and everyone is depressed. Historically, what usually happens next?",
    options: ["The best buying opportunities are when everyone is scared", "It keeps crashing", "It stays flat for years"],
    popular: "The best buying opportunities are when everyone is scared",
    explanation: "Markets are cyclical. After big crashes, historically you see big rebounds — because prices got too cheap. But timing it is hard, which is why most people just stay invested."
  }
];

// Theme data with questions for unlocking
export const themesData: ThemeData[] = [
  {
    themeId: "nuclear",
    themeName: "Nuclear Renaissance",
    icon: "⚛️",
    questions: [
      {
        id: "nuclear-1",
        question: "Microsoft, Google, and Amazon are all buying the same thing. What is it?",
        options: ["Solar farms", "Nuclear power plants", "Oil companies"],
        popular: "Nuclear power plants",
        explanation: "AI data centers need 24/7 stable power. Nuclear is the only clean option."
      },
      {
        id: "nuclear-2",
        question: "Who benefits most from this trend?",
        options: ["Uranium miners", "Solar companies", "Oil companies"],
        popular: "Uranium miners",
        explanation: "Uranium is the fuel for nuclear plants, and demand is surging."
      },
      {
        id: "nuclear-3",
        question: "How much have uranium stocks gained this year?",
        options: ["About 20%", "About 50%", "Over 80%"],
        popular: "Over 80%",
        explanation: "Cameco (CCJ) is up 81% this year."
      }
    ]
  },
  {
    themeId: "netflix",
    themeName: "Streaming Wars Winners",
    icon: "📺",
    questions: [
      {
        id: "netflix-1",
        question: "How many ad-tier subscribers does Netflix have now?",
        options: ["10 million", "40 million", "100 million"],
        popular: "40 million",
        explanation: "Ad-tier subscribers grew from 0 to 40 million in just 18 months."
      },
      {
        id: "netflix-2",
        question: "How many subscribers did Netflix add in one quarter after the password crackdown?",
        options: ["5 million", "13 million", "30 million"],
        popular: "13 million",
        explanation: "The password sharing crackdown worked better than expected."
      },
      {
        id: "netflix-3",
        question: "How many streaming winners will there be in the end?",
        options: ["1-2", "3-4", "5 or more"],
        popular: "3-4",
        explanation: "The market is consolidating. Only a few players will be profitable."
      }
    ]
  },
  {
    themeId: "defense",
    themeName: "Defense & Aerospace",
    icon: "🛡️",
    questions: [
      {
        id: "defense-1",
        question: "What is the 2024 US defense budget?",
        options: ["$500 billion", "$886 billion", "$1 trillion"],
        popular: "$886 billion",
        explanation: "An all-time high, and still growing."
      },
      {
        id: "defense-2",
        question: "Where is European defense spending right now?",
        options: ["Post-WWII low", "Highest since Cold War", "About the same as usual"],
        popular: "Highest since Cold War",
        explanation: "After the Ukraine war, NATO countries are ramping up military spending."
      },
      {
        id: "defense-3",
        question: "How far out are major defense contractors booked?",
        options: ["Until 2025", "Until 2028", "Beyond 2030"],
        popular: "Beyond 2030",
        explanation: "Lockheed Martin and others have orders booked past 2030."
      }
    ]
  },
  {
    themeId: "space",
    themeName: "Space Economy",
    icon: "🚀",
    questions: [
      {
        id: "space-1",
        question: "How much has SpaceX reduced launch costs compared to 10 years ago?",
        options: ["50%", "70%", "90%"],
        popular: "90%",
        explanation: "Reusable rockets have completely changed space economics."
      },
      {
        id: "space-2",
        question: "How many Starlink satellites are in orbit?",
        options: ["1,000", "3,000", "7,000"],
        popular: "7,000",
        explanation: "SpaceX is building the world's largest satellite network."
      },
      {
        id: "space-3",
        question: "When will the International Space Station be retired?",
        options: ["2025", "2030", "2035"],
        popular: "2030",
        explanation: "Private space stations will replace the ISS."
      }
    ]
  },
  {
    themeId: "pets",
    themeName: "Pet Economy",
    icon: "🐕",
    questions: [
      {
        id: "pets-1",
        question: "How much do Americans spend on pets annually?",
        options: ["$50 billion", "$100 billion", "$147 billion"],
        popular: "$147 billion",
        explanation: "Pets have become family members, and spending keeps growing."
      },
      {
        id: "pets-2",
        question: "What is the pet insurance penetration rate in the US?",
        options: ["4%", "15%", "25%"],
        popular: "4%",
        explanation: "Compared to 25% in the UK, the US market has huge room to grow."
      },
      {
        id: "pets-3",
        question: "What percentage of Chewy's revenue comes from auto-ship subscriptions?",
        options: ["30%", "55%", "78%"],
        popular: "78%",
        explanation: "The subscription model creates extremely strong customer retention."
      }
    ]
  },
  {
    themeId: "barbell",
    themeName: "Retail Barbell",
    icon: "🛒",
    questions: [
      {
        id: "barbell-1",
        question: "How much is Costco stock up this year?",
        options: ["+15%", "+30%", "+45%"],
        popular: "+45%",
        explanation: "Membership-based retailers are benefiting from consumer bifurcation."
      },
      {
        id: "barbell-2",
        question: "What's happening to mid-tier retailers like Kohl's?",
        options: ["Recovering", "Struggling to survive", "Already bankrupt"],
        popular: "Struggling to survive",
        explanation: "Consumers either want the best value or premium experiences."
      },
      {
        id: "barbell-3",
        question: "What's the future of retail?",
        options: ["Online only", "Polarization", "Back to brick-and-mortar"],
        popular: "Polarization",
        explanation: "Cheap gets cheaper, expensive gets pricier, the middle disappears."
      }
    ]
  },
  {
    themeId: "longevity",
    themeName: "Future of Longevity",
    icon: "🧬",
    questions: [
      {
        id: "longevity-1",
        question: "How much did Jeff Bezos invest in Altos Labs?",
        options: ["$500 million", "$3 billion", "$10 billion"],
        popular: "$3 billion",
        explanation: "Cellular reprogramming is at the frontier of anti-aging research."
      },
      {
        id: "longevity-2",
        question: "Which company's GLP-1 drugs made it the most valuable in Europe?",
        options: ["Novartis", "Novo Nordisk", "Roche"],
        popular: "Novo Nordisk",
        explanation: "Ozempic/Wegovy created the fastest-growing drug category in history."
      },
      {
        id: "longevity-3",
        question: "The FDA has started to recognize what as a treatable condition?",
        options: ["Obesity", "Aging", "Baldness"],
        popular: "Aging",
        explanation: "This is a milestone regulatory shift for the anti-aging field."
      }
    ]
  }
];

// Generate fake percentage - majority answer gets 55-75%, others get lower
export function generatePercentage(isPopular: boolean): number {
  if (isPopular) {
    return Math.floor(Math.random() * 20) + 55; // 55-75%
  }
  return Math.floor(Math.random() * 15) + 15; // 15-30%
}

// Get today's date string for tracking daily limits
export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}
