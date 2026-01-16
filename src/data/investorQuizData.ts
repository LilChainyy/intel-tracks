import { InvestorQuestion, Archetype } from '@/types/investorQuiz';

export const investorQuestions: InvestorQuestion[] = [
  {
    id: 1,
    question: "Friday night, you're out with friends.\n\nSomeone at the table says: 'That AI stock I bought last month is up 60%, you guys should get in'\n\nYour reaction?",
    options: [
      { id: '1a', text: "Which stock? Give me the ticker, I'll research it", scores: { decisionStyle: 100 } },
      { id: '1b', text: "Interesting... but is that kind of gain normal?", scores: { decisionStyle: 80 } },
      { id: '1c', text: "Damn, I want in! Is it too late?", scores: { decisionStyle: 20 } },
      { id: '1d', text: "Cool for you. I prefer something more stable", scores: { decisionStyle: 60 } }
    ]
  },
  {
    id: 2,
    question: "Next morning, your phone buzzes:\n\n'Stock Market Drops 5% on Inflation Fears'\n\nIf you'd put that $10K in yesterday, you'd be at $9,500 now.\n\nFirst reaction?",
    options: [
      { id: '2a', text: "Oh shit, sell everything and cut losses", scores: { riskTolerance: 0 } },
      { id: '2b', text: "Damn... but let me see WHY it dropped first", scores: { riskTolerance: 40 } },
      { id: '2c', text: "History shows markets bounce back after drops, right? Hold.", scores: { riskTolerance: 70 } },
      { id: '2d', text: "Only 5%? I thought it'd be worse. Buy more?", scores: { riskTolerance: 100 } }
    ]
  },
  {
    id: 3,
    question: "Your friend started investing a year ago with $5,000.\n\nThey tell you: 'I'm up $500 now, so 10% return. Pretty boring honestly.'\n\nYou think:",
    options: [
      { id: '3a', text: "10%? That's it? Waste of time", scores: { knowledge: 20 } },
      { id: '3b', text: "Wait, 10% is actually good?", scores: { knowledge: 80 } },
      { id: '3c', text: "Better than a savings account I guess", scores: { knowledge: 60 } },
      { id: '3d', text: "How do I know if that's good or bad?", scores: { knowledge: 40 } }
    ],
    educationalReveal: "Here's the thing: 10% annual return is what the stock market averages.\n\nThat 'boring' 10% beats:\n• 90% of day traders\n• Most hedge funds (after fees)\n• Your savings account (5%)\n\nCompound that over 10 years? $5K becomes $13K.\n\nNot sexy, but it works."
  },
  {
    id: 4,
    question: "In line at a coffee shop, guy ahead is bragging to his friend:\n\n'Bro I was up 40% last year, S&P only did 20%, I crushed the market'\n\nYou're thinking:",
    options: [
      { id: '4a', text: "He's definitely lying", scores: { knowledge: 40 } },
      { id: '4b', text: "40% vs 20%... so he did twice as good? That's impressive", scores: { knowledge: 100 } },
      { id: '4c', text: "What's S&P? What does 'beat the market' mean?", scores: { knowledge: 0 } },
      { id: '4d', text: "Only 40%? I saw people on Twitter who doubled their money", scores: { knowledge: 60 } }
    ]
  },
  {
    id: 5,
    question: "Plot twist: You get a startup job offer.\n\nLower salary, but they're giving you stock options.\n\nFriend says: 'Options can make you rich! Take it!'\n\nYou?",
    options: [
      { id: '5a', text: "What are stock options? Let me look into this", scores: { knowledge: 40, timeHorizon: 40 } },
      { id: '5b', text: "Is this startup legit? What's their success rate?", scores: { knowledge: 80, timeHorizon: 60 } },
      { id: '5c', text: "How much lower is the salary? I need cash flow now", scores: { knowledge: 60, timeHorizon: 20 } },
      { id: '5d', text: "Fuck it, what if this becomes the next Airbnb", scores: { knowledge: 20, timeHorizon: 100 } }
    ]
  },
  {
    id: 6,
    question: "Two approaches to picking stocks:\n\nApproach A: 'I have a checklist - P/E ratio, revenue growth, insider buying. Hit 3/5 criteria? I buy.'\n\nApproach B: 'I read about the company, watch the CEO talk, see if it feels right. Then I decide.'\n\nWhich sounds more like you?",
    options: [
      { id: '6a', text: "Give me the checklist - I like rules", scores: { decisionStyle: 100 } },
      { id: '6b', text: "I trust my intuition more than formulas", scores: { decisionStyle: 20 } },
      { id: '6c', text: "Bit of both - data + gut feel", scores: { decisionStyle: 60 } },
      { id: '6d', text: "I'd just copy what Warren Buffett does", scores: { decisionStyle: 40 } }
    ]
  },
  {
    id: 7,
    question: "You open Reddit, WSB is going crazy over a penny stock.\n\n'This is the next GME! Get in before it moons!'\n\nThread full of people claiming 200%, 500% gains.\n\nYou?",
    options: [
      { id: '7a', text: "These people are all liars... not touching it", scores: { riskTolerance: 0, decisionStyle: 80 } },
      { id: '7b', text: "Let me research what this company actually does first", scores: { riskTolerance: 30, decisionStyle: 100 } },
      { id: '7c', text: "Maybe throw $500 at it? What if it's real", scores: { riskTolerance: 70, decisionStyle: 40 } },
      { id: '7d', text: "YOLO it all! Missed GME last time, can't miss this", scores: { riskTolerance: 100, decisionStyle: 0 } }
    ]
  },
  {
    id: 8,
    question: "Honest question: What would feel better?\n\nScenario A: You make 25% returns but no one knows\nScenario B: You make 15% returns but you can tell everyone",
    options: [
      { id: '8a', text: "Obviously A - it's about the money", scores: { motivation: 'money' } },
      { id: '8b', text: "Hmm... B actually sounds nice", scores: { motivation: 'status' } },
      { id: '8c', text: "Why not both?", scores: { motivation: 'balanced' } },
      { id: '8d', text: "I wouldn't tell people either way", scores: { motivation: 'private' } }
    ]
  },
  {
    id: 9,
    question: "You bought a stock for $1,000.\n\nIt drops to $700 (-30%). You hold.\n\nThree months later, it's back to $1,000.\n\nHow do you feel?",
    options: [
      { id: '9a', text: "Relieved - broke even, time to sell", scores: { riskTolerance: 20 } },
      { id: '9b', text: "Annoyed I held through that stress", scores: { riskTolerance: 10 } },
      { id: '9c', text: "Proud I didn't panic sell", scores: { riskTolerance: 60 } },
      { id: '9d', text: "Wish I'd bought more at $700", scores: { riskTolerance: 100 } }
    ],
    educationalReveal: "Fun fact: The S&P 500 drops 10%+ almost every year on average.\n\nEven the best investors lose money regularly. The difference? They don't panic.\n\nLosing is part of the game. How you react matters more than avoiding losses."
  },
  {
    id: 10,
    question: "Two investors:\n\nInvestor A: Buys index funds, checks once a quarter, averages 10%/year for 20 years. Retires rich.\n\nInvestor B: Day trades, lives for the rush, some 100% wins, some brutal losses. Averages 5%/year. Never gets ahead.\n\nReal talk - which would you rather be?",
    options: [
      { id: '10a', text: "A - boring but I win in the end", scores: { timeHorizon: 100 } },
      { id: '10b', text: "B - at least it's exciting", scores: { timeHorizon: 0 } },
      { id: '10c', text: "Can I be A but with a little B action on the side?", scores: { timeHorizon: 60 } },
      { id: '10d', text: "Neither - I want A's results with B's excitement", scores: { timeHorizon: 40 } }
    ],
    educationalReveal: "Respect the honesty. Here's the reality though:\n\n95% of day traders lose money long-term. The 'excitement' costs you.\n\nBut there IS a middle ground: strategic catalyst trading + core boring holdings.\n\nYou get some action, but you don't gamble your future.",
    showRevealFor: ['10b', '10d']
  },
  {
    id: 11,
    question: "OK last one.\n\nThat $10K is still in your account.\n\n6 months from now, you hope it becomes...?",
    options: [
      { id: '11a', text: "$11K - 10% return is solid, safe and steady", scores: { riskTolerance: 20, timeHorizon: 80 } },
      { id: '11b', text: "$12-13K - beat the market average a bit", scores: { riskTolerance: 40, timeHorizon: 60 } },
      { id: '11c', text: "$15K+ - I want to catch some big moves", scores: { riskTolerance: 70, timeHorizon: 40 } },
      { id: '11d', text: "$20K+ - go big or go home", scores: { riskTolerance: 100, timeHorizon: 20 } }
    ]
  }
];

export const archetypes: Record<string, Archetype> = {
  momentum_hunter: {
    id: "momentum_hunter",
    name: "Momentum Hunter",
    tagline: "You want action, not lectures",
    description: "You'd rather catch a wave than wait for the tide. Quick pattern recognition, high risk tolerance, thrives on catalysts.",
    expectedPercentage: 15,
    famousInvestors: [
      { name: "Cathie Wood", description: "ARK Invest founder, rides disruptive tech trends" },
      { name: "Bill Ackman", description: "Takes massive concentrated bets, acts fast" },
      { name: "r/WallStreetBets legends", description: "GameStop, AMC momentum masters" }
    ],
    fallback: "You share traits with successful momentum traders who've caught major runs like Tesla's 2020 surge or crypto bull markets",
    strengths: [
      "Quick pattern recognition and opportunity spotting",
      "Catalyst-driven trading and momentum plays",
      "High conviction when you see the setup"
    ],
    pitfalls: [
      "Chasing pumps after the move already happened",
      "Overtrading and racking up fees",
      "Ignoring risk management in the heat of the moment"
    ]
  },
  
  strategic_analyst: {
    id: "strategic_analyst",
    name: "Strategic Analyst",
    tagline: "Research first, execute with conviction",
    description: "You believe good investing is a combination of solid research and disciplined execution. You're not afraid of risk, but you want to understand it first.",
    expectedPercentage: 25,
    famousInvestors: [
      { name: "Peter Lynch", description: "Researched everything, found 10-baggers through analysis" },
      { name: "Cathie Wood (early days)", description: "Deep tech research before going momentum" },
      { name: "Howard Marks", description: "Thoughtful, analytical, disciplined approach" }
    ],
    fallback: "You think like professional fund managers who beat markets through disciplined research and selective conviction",
    strengths: [
      "Thorough research leads to informed decisions",
      "Growth investing and sector rotation strategies",
      "Balanced risk-taking with analytical backing"
    ],
    pitfalls: [
      "Analysis paralysis - researching but never buying",
      "Missing fast-moving momentum opportunities",
      "Overthinking simple setups"
    ]
  },
  
  cautious_builder: {
    id: "cautious_builder",
    name: "Cautious Builder",
    tagline: "Boring wins over time",
    description: "You're here to build wealth steadily, not gamble. You understand that boring often wins, and you're okay with that.",
    expectedPercentage: 30,
    famousInvestors: [
      { name: "Warren Buffett", description: "Patient, long-term, boring works" },
      { name: "Jack Bogle", description: "Vanguard founder, index fund pioneer" },
      { name: "Charlie Munger", description: "Buy quality, hold forever" }
    ],
    fallback: "You're aligned with the philosophy that built generational wealth: patient compounding beats gambling every time",
    strengths: [
      "Consistent long-term wealth accumulation",
      "Index funds, dividend stocks, value investing",
      "Low stress, low maintenance approach"
    ],
    pitfalls: [
      "Missing significant growth opportunities",
      "Over-diversification reducing returns",
      "Too conservative for your age/timeline"
    ]
  },
  
  curious_learner: {
    id: "curious_learner",
    name: "Curious Learner",
    tagline: "Starting fresh, learning right",
    description: "You're starting fresh and want to learn the right way. Your willingness to admit what you don't know is actually your biggest strength.",
    expectedPercentage: 20,
    famousInvestors: [
      { name: "Warren Buffett at 11", description: "Started with library books, paper routes" },
      { name: "Ray Dalio early days", description: "Learned through trial, error, iteration" },
      { name: "Every successful investor", description: "They all started not knowing anything" }
    ],
    fallback: "You're at the beginning of your journey. The best investors all started exactly where you are - curious and willing to learn. Your humility is an edge.",
    strengths: [
      "Open mind ready to learn properly",
      "Paper trading and educational focus first",
      "Building good habits from the start"
    ],
    pitfalls: [
      "Information overload and confusion",
      "Following bad advice from social media",
      "Getting discouraged by complexity"
    ]
  },
  
  balanced_realist: {
    id: "balanced_realist",
    name: "Balanced Realist",
    tagline: "Practical, adaptable, sustainable",
    description: "You want growth but understand risk. You do research but trust your gut sometimes. You're building a sustainable approach.",
    expectedPercentage: 8,
    famousInvestors: [
      { name: "Ray Dalio", description: "Balanced portfolio, risk parity, no extreme bets" },
      { name: "John Templeton", description: "Value + growth, adapted to markets" },
      { name: "David Swensen", description: "Yale endowment model, diversified excellence" }
    ],
    fallback: "You think like institutional investors who optimize risk-adjusted returns rather than chasing home runs. Sophisticated approach.",
    strengths: [
      "Sustainable long-term strategy",
      "Core + satellite approach (index base + selective picks)",
      "Flexibility to adapt to market conditions"
    ],
    pitfalls: [
      "Being too middle-of-the-road",
      "No clear competitive edge",
      "Jack of all trades, master of none"
    ]
  },
  
  calculated_risk_taker: {
    id: "calculated_risk_taker",
    name: "Calculated Risk-Taker",
    tagline: "Big bets, backed by homework",
    description: "You're aggressive but not reckless. You take big swings but only after doing your homework. You understand edge.",
    expectedPercentage: 2,
    famousInvestors: [
      { name: "Stanley Druckenmiller", description: "Big bets, asymmetric risk/reward" },
      { name: "George Soros", description: "Concentrated positions when conviction is high" },
      { name: "Jim Simons (early days)", description: "Mathematical edge, leverage when appropriate" }
    ],
    fallback: "You're in rare company - investors who take concentrated, high-conviction positions based on research. High risk, high reward when done right.",
    strengths: [
      "Concentrated high-conviction positions",
      "Asymmetric risk/reward opportunities",
      "Disciplined risk management despite aggression"
    ],
    pitfalls: [
      "Overconfidence after early wins",
      "Position sizing errors on big bets",
      "Blowing up on one bad call"
    ]
  }
};
