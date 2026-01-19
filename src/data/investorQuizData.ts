import { InvestorQuestion, Archetype } from '@/types/investorQuiz';

export const investorQuestions: InvestorQuestion[] = [
  {
    id: 1,
    question: "You find a 'hidden gem' antique at a garage sale for $100. You think it's worth $1,000, but you aren't sure.\n\nWhat do you do?",
    options: [
      { id: '1a', text: "Buy it immediately. High risk, high reward.", scores: { riskTolerance: 100, decisionStyle: 20, archetype: 'deal_maker' } },
      { id: '1b', text: "Spend 20 minutes Googling comparable sales before deciding.", scores: { riskTolerance: 60, decisionStyle: 80, archetype: 'compounder' } },
      { id: '1c', text: "Buy it only if you already have a buyer in mind.", scores: { riskTolerance: 40, decisionStyle: 60, archetype: 'protector' } },
      { id: '1d', text: "Pass. You'd rather keep your $100 for something guaranteed.", scores: { riskTolerance: 10, decisionStyle: 40, archetype: 'protector' } }
    ]
  },
  {
    id: 2,
    question: "The stock market just dropped 15% in one week. Headlines are screaming 'Economic Collapse!'\n\nHow are you feeling?",
    options: [
      { id: '2a', text: "Excited. Everything is on sale; time to go shopping.", scores: { riskTolerance: 100, decisionStyle: 30, archetype: 'deal_maker' } },
      { id: '2b', text: "Calm. My plan accounts for volatility; I'll check back in six months.", scores: { riskTolerance: 70, decisionStyle: 90, archetype: 'compounder' } },
      { id: '2c', text: "Analytical. I'm re-reading the balance sheets of my companies to see if anything changed.", scores: { riskTolerance: 50, decisionStyle: 100, archetype: 'compounder' } },
      { id: '2d', text: "Anxious. I'm considering selling before it drops further to protect what's left.", scores: { riskTolerance: 10, decisionStyle: 20, archetype: 'protector' } }
    ]
  },
  {
    id: 3,
    question: "You are offered a 'set it and forget it' investment that grows steadily by 7% every year, but you can't touch it for 10 years.\n\nYour reaction?",
    options: [
      { id: '3a', text: "Too slow. I want to be active and beat that return.", scores: { riskTolerance: 90, timeHorizon: 20, archetype: 'deal_maker' } },
      { id: '3b', text: "Perfect. Consistency and compound interest are king.", scores: { riskTolerance: 50, timeHorizon: 100, archetype: 'compounder' } },
      { id: '3c', text: "I'll take it, but only for a portion of my portfolio.", scores: { riskTolerance: 40, timeHorizon: 70, archetype: 'compounder' } },
      { id: '3d', text: "Sounds safe—I like the predictability.", scores: { riskTolerance: 20, timeHorizon: 80, archetype: 'protector' } }
    ]
  },
  {
    id: 4,
    question: "When picking a company to invest in, what matters most to you?",
    options: [
      { id: '4a', text: "Radical innovation and the potential to change the world.", scores: { riskTolerance: 100, decisionStyle: 30, archetype: 'deal_maker' } },
      { id: '4b', text: "A long history of profits and a 'moat' against competitors.", scores: { riskTolerance: 50, decisionStyle: 90, archetype: 'compounder' } },
      { id: '4c', text: "Numerical data: low P/E ratios and undervalued assets.", scores: { riskTolerance: 40, decisionStyle: 100, archetype: 'compounder' } },
      { id: '4d', text: "Whatever the most trusted experts are currently recommending.", scores: { riskTolerance: 20, decisionStyle: 30, archetype: 'protector' } }
    ]
  }
];

export const archetypes: Record<string, Archetype> = {
  deal_maker: {
    id: "deal_maker",
    name: "The Deal Maker",
    tagline: "Deploy capital, generate cash flow",
    description: "You don't 'save' money; you 'deploy' it. You look for assets that put cash in your pocket today.",
    expectedPercentage: 25,
    famousInvestors: [
      { name: "Robert Kiyosaki", description: "Rich Dad Poor Dad author, cash flow focused" },
      { name: "Grant Cardone", description: "Real estate mogul, aggressive deployer of capital" },
      { name: "Mark Cuban", description: "Shark Tank investor, seeks big opportunities fast" }
    ],
    fallback: "You think like entrepreneurs who see money as a tool to be deployed, not saved. Your mindset is about making assets work for you.",
    strengths: [
      "Quick decision-making on opportunities",
      "Comfortable with calculated risks",
      "Focus on cash-generating assets"
    ],
    pitfalls: [
      "May overlook due diligence in the rush",
      "Higher exposure to volatile investments",
      "Can underestimate downside risks"
    ]
  },
  
  compounder: {
    id: "compounder",
    name: "The Compounder",
    tagline: "Patience wins the long game",
    description: "You play the long game. You're okay with 'boring' as long as it's consistent and grows over decades.",
    expectedPercentage: 40,
    famousInvestors: [
      { name: "Warren Buffett", description: "The Oracle of Omaha, patient value investor" },
      { name: "Charlie Munger", description: "Long-term thinker, quality over quantity" },
      { name: "Peter Lynch", description: "Buy what you know, hold for growth" }
    ],
    fallback: "You understand that wealth is built through patience and compound growth. Time in the market beats timing the market.",
    strengths: [
      "Disciplined long-term approach",
      "Focus on quality investments",
      "Resilient through market volatility"
    ],
    pitfalls: [
      "May miss short-term opportunities",
      "Can be too slow to act on changes",
      "Risk of over-attachment to holdings"
    ]
  },
  
  protector: {
    id: "protector",
    name: "The Protector",
    tagline: "Security first, growth second",
    description: "You value security above all. Your biggest challenge is realizing that 'safe' money often loses value to inflation.",
    expectedPercentage: 35,
    famousInvestors: [
      { name: "Jack Bogle", description: "Vanguard founder, index fund pioneer" },
      { name: "Benjamin Graham", description: "Father of value investing, margin of safety" },
      { name: "Ray Dalio", description: "All-weather portfolio, risk management focused" }
    ],
    fallback: "You prioritize protecting what you have. Smart investors know preservation of capital is the first rule of investing.",
    strengths: [
      "Strong risk management instincts",
      "Steady, predictable approach",
      "Less emotional during downturns"
    ],
    pitfalls: [
      "May leave returns on the table",
      "Inflation can erode 'safe' savings",
      "Could miss growth opportunities"
    ]
  }
};
