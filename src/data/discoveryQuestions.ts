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

// Market questions - show one at a time, daily limit of 10
export const marketQuestions: MarketQuestion[] = [
  {
    id: "market-1",
    question: "The Fed meets next week. How will tech stocks react?",
    options: ["Rally", "Drop", "Stay flat"],
    popular: "Rally",
    explanation: "Rate cuts typically benefit growth stocks, though markets may have priced this in."
  },
  {
    id: "market-2",
    question: "Are AI company valuations a bubble?",
    options: ["Yes, crash coming", "No, room to grow", "Hard to say"],
    popular: "No, room to grow",
    explanation: "AI company revenue growth is faster than during the dot-com bubble."
  },
  {
    id: "market-3",
    question: "How will US stocks perform in 2024?",
    options: ["Keep rising", "Trade sideways", "Major correction"],
    popular: "Keep rising",
    explanation: "Election years have historically been favorable for stocks."
  },
  {
    id: "market-4",
    question: "Will Chinese stocks rebound this year?",
    options: ["Yes, opportunity ahead", "No, wait longer", "Too uncertain"],
    popular: "Too uncertain",
    explanation: "Policy support vs economic fundamentals creates significant market disagreement."
  },
  {
    id: "market-5",
    question: "Is gold still worth buying?",
    options: ["Yes, best safe haven", "No, too expensive", "Small allocation only"],
    popular: "Small allocation only",
    explanation: "Geopolitical uncertainty supports gold prices, but it's already at all-time highs."
  },
  {
    id: "market-6",
    question: "Who will win the EV race?",
    options: ["Tesla", "Chinese automakers", "Legacy automakers"],
    popular: "Chinese automakers",
    explanation: "BYD has already surpassed Tesla in sales with clear cost advantages."
  },
  {
    id: "market-7",
    question: "Would you buy crypto now?",
    options: ["Yes, rare opportunity", "No, too risky", "Watching from sidelines"],
    popular: "Watching from sidelines",
    explanation: "Bitcoin ETF approval brought inflows, but volatility remains high."
  },
  {
    id: "market-8",
    question: "Will the dollar keep strengthening?",
    options: ["Yes", "No", "Stay about the same"],
    popular: "Stay about the same",
    explanation: "Rates have peaked but the pace of cuts remains uncertain."
  },
  {
    id: "market-9",
    question: "Is now a good time to buy a house?",
    options: ["Yes", "No", "Depends on location"],
    popular: "Depends on location",
    explanation: "High rates but tight inventory mean conditions vary widely by market."
  },
  {
    id: "market-10",
    question: "Will tech stocks still lead next year?",
    options: ["Yes", "No", "Rotation to other sectors"],
    popular: "Yes",
    explanation: "The AI wave is just beginning, tech stocks still have momentum."
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
