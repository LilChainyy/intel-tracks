import type { Persona } from '@/types/investorQuiz';

// Base persona definitions for the 4×4 risk/timeline matrix
interface BasePersona {
  name: string;
  tagline: string;
  objective: string;
  strategy: string;
  icon: string;
  strengths: string[];
  pitfalls: string[];
}

type RiskLevel = 'safe' | 'balanced' | 'growth' | 'yolo';
type TimelineLevel = 'very_short' | 'short' | 'medium' | 'long';

// 4×4 Matrix: Risk (rows) × Timeline (columns)
export const PERSONA_MATRIX: Record<RiskLevel, Record<TimelineLevel, BasePersona>> = {
  safe: {
    very_short: {
      name: 'Cautious Trader',
      tagline: 'Safety first, always an exit plan',
      objective: 'Keep your money safe while it works for you in the short term',
      strategy: 'Stick to stable, easy-to-sell assets',
      icon: '🛡️',
      strengths: [
        'Sleep easy—minimal stress from market swings',
        'Can access your money quickly anytime',
        'Rarely catch falling knives'
      ],
      pitfalls: [
        'Returns barely beat inflation',
        'Miss out when markets rally',
        'Opportunity cost adds up over time'
      ],
    },
    short: {
      name: 'Steady Saver',
      tagline: 'Slow and steady wins the race',
      objective: 'Build wealth safely for goals 1-5 years out',
      strategy: 'Mix safe bonds with stable dividend stocks',
      icon: '🏦',
      strengths: [
        'Predictable returns you can count on',
        'Perfect for buying a house or funding education',
        'Worry-free portfolio'
      ],
      pitfalls: [
        'Limited upside—miss big winners',
        'Inflation quietly eats your gains',
        'Always trailing the market averages'
      ],
    },
    medium: {
      name: 'Patient Builder',
      tagline: 'Compounding quietly in the background',
      objective: 'Grow wealth steadily over 5-10 years',
      strategy: 'Index funds and quality dividend growers',
      icon: '🏗️',
      strengths: [
        'Time heals—ride out short-term drops',
        'Dividends reinvest and multiply',
        'Diversified, so no single stock tanks you'
      ],
      pitfalls: [
        'Too conservative for your age?',
        'Growth stocks leave you in the dust',
        'Need discipline to rebalance'
      ],
    },
    long: {
      name: 'Legacy Steward',
      tagline: 'Building generational wealth brick by brick',
      objective: 'Preserve and grow family wealth for decades',
      strategy: 'Blue-chips, bonds, real estate—time-tested assets',
      icon: '🏛️',
      strengths: [
        'Decades of compounding magic',
        'Outlast any market crash',
        'Tax-efficient long-term gains'
      ],
      pitfalls: [
        'Too cautious? Wealth grows slowly',
        'Inflation is a silent killer over 30+ years',
        'May not reach financial freedom fast enough'
      ],
    },
  },
  balanced: {
    very_short: {
      name: 'Active Allocator',
      tagline: 'Quick moves, calculated risks',
      objective: 'Catch short-term opportunities without going all-in',
      strategy: 'Swing trade quality stocks and rotate sectors',
      icon: '⚖️',
      strengths: [
        'Adapt fast to market shifts',
        'Catch mispricings before they correct',
        'Balanced enough to avoid total wipeouts'
      ],
      pitfalls: [
        'Requires constant monitoring',
        'Trading fees and taxes eat profits',
        'Easy to get emotional in volatile markets'
      ],
    },
    short: {
      name: 'Strategic Investor',
      tagline: 'Smart balance of growth and safety',
      objective: 'Beat the market without losing sleep',
      strategy: '60/40 stocks/bonds, quality growth tilt',
      icon: '🎯',
      strengths: [
        'Diversification smooths the ride',
        'Exposure to growth without crazy risk',
        'Good for most mid-term goals'
      ],
      pitfalls: [
        'Miss explosive bull market rallies',
        'Bonds drag when rates are low',
        'Tempting to overtrade'
      ],
    },
    medium: {
      name: 'Balanced Accumulator',
      tagline: 'Growing wealth without sweating volatility',
      objective: 'Build a solid nest egg over 5-10 years',
      strategy: '70/30 stocks/bonds, growth and value mix',
      icon: '📈',
      strengths: [
        'Strong long-term returns, manageable swings',
        'Time to recover from downturns',
        'Spread across sectors and sizes'
      ],
      pitfalls: [
        'Middle-of-the-road = miss extreme gains',
        'Volatility tests your nerves mid-journey',
        'Rebalancing requires discipline'
      ],
    },
    long: {
      name: 'Diversified Collector',
      tagline: 'Owning a bit of everything that works',
      objective: 'Wealth through smart diversification over decades',
      strategy: 'Core index funds plus thematic satellites',
      icon: '🗂️',
      strengths: [
        'No single failure can wreck you',
        'Time unlocks aggressive allocations',
        'Tax-smart buy-and-hold strategy'
      ],
      pitfalls: [
        'Diversification waters down big wins',
        'May hold losers too long',
        'Fighting the urge to time the market'
      ],
    },
  },
  growth: {
    very_short: {
      name: 'Momentum Chaser',
      tagline: 'Ride the wave, exit before it crashes',
      objective: 'Catch explosive short-term rallies',
      strategy: 'High-volatility growth stocks and technical breakouts',
      icon: '🚀',
      strengths: [
        'Life-changing gains in days or weeks',
        'Catch inefficiencies before they close',
        'High skill = high reward'
      ],
      pitfalls: [
        'One bad trade can wipe you out',
        'Requires obsessive screen time',
        'Short-term taxes destroy returns'
      ],
    },
    short: {
      name: 'Growth Seeker',
      tagline: 'Go big on tomorrow\'s winners',
      objective: 'Multiply wealth fast through high-growth bets',
      strategy: 'Concentrated in disruptive tech and emerging sectors',
      icon: '🌱',
      strengths: [
        'Rocket ships to the moon (when you pick right)',
        'Crush it in bull markets',
        'Early on innovation trends'
      ],
      pitfalls: [
        'Volatility will test your stomach',
        'Growth crashes hard in bear markets',
        'Overvaluation risk is real'
      ],
    },
    medium: {
      name: 'Wealth Builder',
      tagline: 'Patient aggression—let winners compound',
      objective: 'Build serious wealth through growth over 5-10 years',
      strategy: 'Heavy in growth stocks, emerging tech, thematic plays',
      icon: '💎',
      strengths: [
        'Time lets compounders work magic',
        'Potential for retirement-altering returns',
        'Conviction carries you through dips'
      ],
      pitfalls: [
        'Concentrated = high risk if thesis breaks',
        'Bear markets are brutal',
        'Drawdowns test your willpower'
      ],
    },
    long: {
      name: 'Empire Builder',
      tagline: 'Betting decades on the future',
      objective: 'Turn bold bets into extraordinary wealth',
      strategy: 'Concentrated high-conviction growth for the long haul',
      icon: '👑',
      strengths: [
        'Maximum compounding time',
        'Hold through anything',
        'Generational wealth potential'
      ],
      pitfalls: [
        'Few companies sustain decades of growth',
        'Picking tomorrow\'s Amazon is hard',
        'Multi-year losses test conviction'
      ],
    },
  },
  yolo: {
    very_short: {
      name: 'Day Gambler',
      tagline: 'All in, all the time—no regrets',
      objective: 'Chase 10x gains in days or weeks',
      strategy: 'Options, penny stocks, meme plays, max leverage',
      icon: '🎲',
      strengths: [
        'Unlimited upside—lottery ticket mentality',
        'Adrenaline rush of active trading',
        'Learn fast by getting burned'
      ],
      pitfalls: [
        'Most lose everything eventually',
        'Emotionally exhausting rollercoaster',
        'House always wins in the long run'
      ],
    },
    short: {
      name: 'Swing Trader',
      tagline: 'High-risk, high-conviction catalyst plays',
      objective: 'Make life-changing money in 1-5 years',
      strategy: 'Concentrated in speculative growth, pre-IPO, crypto',
      icon: '⚡',
      strengths: [
        '10x+ returns possible',
        'First-mover advantage on trends',
        'Rapid learning curve'
      ],
      pitfalls: [
        'Permanent capital loss is likely',
        'Volatility forces panic exits',
        'Requires iron discipline'
      ],
    },
    medium: {
      name: 'Conviction Bettor',
      tagline: 'Go all-in on your best ideas',
      objective: 'Concentrated bets on transformative companies',
      strategy: 'All chips on 3-5 moonshots for 5-10 years',
      icon: '🔥',
      strengths: [
        'Life-changing if you\'re right',
        'Time to ride out volatility',
        'Deep expertise in few positions'
      ],
      pitfalls: [
        'Wrong thesis = catastrophic loss',
        'Extreme swings shake you out',
        'Zero diversification safety net'
      ],
    },
    long: {
      name: 'Visionary Moonshotter',
      tagline: 'Betting the farm on the future',
      objective: 'Turn bold visions into generational wealth',
      strategy: 'All-in on the most disruptive, speculative ideas',
      icon: '🌙',
      strengths: [
        '100x+ returns if you nail it',
        'Time horizon allows ultimate conviction',
        'Ignore all short-term noise'
      ],
      pitfalls: [
        'Most moonshots crash and burn',
        'Massive opportunity cost if wrong',
        'Requires rare vision + timing + luck'
      ],
    },
  },
};

/**
 * Get base persona from matrix based on risk and timeline
 */
export function getPersona(
  risk: RiskLevel,
  timeline: TimelineLevel
): BasePersona {
  return PERSONA_MATRIX[risk][timeline];
}

/**
 * Generate personalized persona description incorporating sectors and themes
 */
export function generatePersonaDescription(
  basePersona: BasePersona,
  sectors: string[],
  themePreferences: string[]
): Persona {
  const topSectors = sectors.slice(0, 3);
  const sectorText = topSectors.length > 0
    ? ` ${topSectors.join(', ')}`
    : '';

  // Create a short, punchy description
  let description = `You're a ${basePersona.name}—${basePersona.tagline}.`;

  if (sectorText) {
    description += ` You lean toward${sectorText}.`;
  }

  if (themePreferences.length > 0) {
    description += ` Your focus: ${themePreferences.slice(0, 2).join(' and ')}.`;
  }

  return {
    type: basePersona.name,
    tagline: basePersona.tagline,
    description,
    strengths: basePersona.strengths,
    pitfalls: basePersona.pitfalls,
  };
}
