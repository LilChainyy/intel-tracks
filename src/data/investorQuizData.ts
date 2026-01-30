import { InvestorQuestion } from '@/types/investorQuiz';

export const investorQuestions: InvestorQuestion[] = [
  // RISK TOLERANCE (Q1-Q3)
  {
    id: 1,
    question: "Your portfolio drops 30% in a month. What's your gut reaction?",
    options: [
      {
        id: 'a',
        text: "Panic sell. I can't handle this stress.",
        scores: { risk: 'safe', riskValue: 10 }
      },
      {
        id: 'b',
        text: "Hold steady. I knew volatility was part of the deal.",
        scores: { risk: 'balanced', riskValue: 45 }
      },
      {
        id: 'c',
        text: "Buy more. Discounts are opportunities.",
        scores: { risk: 'growth', riskValue: 75 }
      },
      {
        id: 'd',
        text: "Double down. I'm betting on the comeback.",
        scores: { risk: 'yolo', riskValue: 95 }
      }
    ],
    educationalReveal: "Market corrections are normal. The S&P 500 has dropped 10%+ every 2 years on average. Successful investors use volatility as opportunity, not a reason to exit.",
    showRevealFor: ['a']
  },
  {
    id: 2,
    question: "What kind of returns do you expect from your investments?",
    options: [
      {
        id: 'a',
        text: "5-8% per year. I want steady, reliable growth.",
        scores: { risk: 'safe', riskValue: 15 }
      },
      {
        id: 'b',
        text: "10-15% per year. Better than bonds, not crazy.",
        scores: { risk: 'balanced', riskValue: 40 }
      },
      {
        id: 'c',
        text: "20-30% per year. I'll take the volatility for the upside.",
        scores: { risk: 'growth', riskValue: 70 }
      },
      {
        id: 'd',
        text: "100%+ per year. Go big or go home.",
        scores: { risk: 'yolo', riskValue: 100 }
      }
    ]
  },
  {
    id: 3,
    question: "If you lost 50% of your investment tomorrow, how would it affect your life?",
    options: [
      {
        id: 'a',
        text: "Catastrophic. I'd lose my house/retirement.",
        scores: { risk: 'safe', riskValue: 5 }
      },
      {
        id: 'b',
        text: "Painful. It would set me back years.",
        scores: { risk: 'balanced', riskValue: 35 }
      },
      {
        id: 'c',
        text: "Unpleasant, but I'd recover. I have other savings.",
        scores: { risk: 'growth', riskValue: 65 }
      },
      {
        id: 'd',
        text: "No sweat. This is money I can afford to lose.",
        scores: { risk: 'yolo', riskValue: 90 }
      }
    ],
    educationalReveal: "Never invest money you can't afford to lose. Your risk tolerance should match your financial situation, not just your personality.",
    showRevealFor: ['a', 'b']
  },

  // TIME HORIZON (Q4-Q6)
  {
    id: 4,
    question: "When do you need this money?",
    options: [
      {
        id: 'a',
        text: "Under 1 year. I'm actively trading or need it very soon.",
        scores: { timeline: 'very_short', timelineValue: 10 }
      },
      {
        id: 'b',
        text: "1-5 years. Mid-term goals like a house down payment.",
        scores: { timeline: 'short', timelineValue: 45 }
      },
      {
        id: 'c',
        text: "5-10 years. Building wealth over the next decade.",
        scores: { timeline: 'medium', timelineValue: 75 }
      },
      {
        id: 'd',
        text: "10+ years. Long-term retirement or wealth building.",
        scores: { timeline: 'long', timelineValue: 95 }
      }
    ]
  },
  {
    id: 5,
    question: "A stock you own is flat for 3 years while the market is up 40%. You:",
    options: [
      {
        id: 'a',
        text: "Sell immediately. I'm missing out on other opportunities.",
        scores: { timeline: 'very_short', timelineValue: 15 }
      },
      {
        id: 'b',
        text: "Give it 6 more months, then reassess.",
        scores: { timeline: 'short', timelineValue: 45 }
      },
      {
        id: 'c',
        text: "Hold if the fundamentals are intact. Price will follow.",
        scores: { timeline: 'medium', timelineValue: 75 }
      },
      {
        id: 'd',
        text: "Buy more. The market hasn't realized the value yet.",
        scores: { timeline: 'long', timelineValue: 90 }
      }
    ]
  },
  {
    id: 6,
    question: "How often do you want to check your portfolio?",
    options: [
      {
        id: 'a',
        text: "Daily or more. I want to catch every move.",
        scores: { timeline: 'very_short', timelineValue: 5 }
      },
      {
        id: 'b',
        text: "Weekly. I like to stay informed but not obsess.",
        scores: { timeline: 'short', timelineValue: 40 }
      },
      {
        id: 'c',
        text: "Monthly. Long-term trends matter more than daily noise.",
        scores: { timeline: 'medium', timelineValue: 70 }
      },
      {
        id: 'd',
        text: "Quarterly or less. Set it and mostly forget it.",
        scores: { timeline: 'long', timelineValue: 90 }
      }
    ]
  },

  // SECTOR/THEME PREFERENCES (Q7-Q9)
  {
    id: 7,
    question: "Which type of companies excite you most?\n(Select all that apply)",
    multipleChoice: true,
    options: [
      {
        id: 'a',
        text: "Cutting-edge tech changing the world (AI, space, clean energy)",
        scores: { sectors: ['tech', 'space', 'energy'] }
      },
      {
        id: 'b',
        text: "Brands I know and use every day (consumer goods, streaming, pets)",
        scores: { sectors: ['consumer', 'entertainment', 'healthcare'] }
      },
      {
        id: 'c',
        text: "Critical infrastructure (defense, aerospace, industrial, finance)",
        scores: { sectors: ['industrial', 'finance'] }
      },
      {
        id: 'd',
        text: "Safe, diversified index funds—I don't want to pick",
        scores: { sectors: ['tech', 'consumer', 'finance', 'healthcare'] }
      }
    ]
  },
  {
    id: 8,
    question: "Which investment theme sounds most compelling to you?\n(Select all that apply)",
    multipleChoice: true,
    options: [
      {
        id: 'a',
        text: "Nuclear energy powering AI datacenters & clean tech revolution",
        scores: { themePreference: 'nuclear', sectors: ['energy', 'tech'] }
      },
      {
        id: 'b',
        text: "Longevity & healthcare innovation (GLP-1 drugs, aging population)",
        scores: { themePreference: 'longevity', sectors: ['healthcare', 'tech'] }
      },
      {
        id: 'c',
        text: "Space economy & defense spending (SpaceX, geopolitical tensions)",
        scores: { themePreference: 'space_defense', sectors: ['space', 'industrial', 'tech'] }
      },
      {
        id: 'd',
        text: "Consumer trends (streaming wars, pet economy, retail winners)",
        scores: { themePreference: 'consumer_trends', sectors: ['consumer', 'entertainment'] }
      }
    ]
  },
  {
    id: 9,
    question: "What kind of investment opportunities interest you?\n(Select all that apply)",
    multipleChoice: true,
    options: [
      {
        id: 'a',
        text: "Boring dividend aristocrats that compound forever",
        scores: { stylePreference: 'dividend_quality', themePreference: 'cashcow' }
      },
      {
        id: 'b',
        text: "Pre-IPO unicorns about to go public (Stripe, SpaceX, Databricks)",
        scores: { stylePreference: 'high_risk_ipo', themePreference: 'ipo2026' }
      },
      {
        id: 'c',
        text: "High-growth megatrends with 5-10 year tailwinds",
        scores: { stylePreference: 'growth_trends', themePreference: 'thematic' }
      },
      {
        id: 'd',
        text: "Just give me the S&P 500 and let me sleep at night",
        scores: { stylePreference: 'index_passive', themePreference: 'indexchill' }
      }
    ]
  }
];
