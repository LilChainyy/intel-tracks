import { ThemeCard, ThemeStory } from '@/types/themeStory';

export const selectorThemes: ThemeCard[] = [
  {
    id: "nuclear",
    icon: "⚛️",
    title: "Nuclear Renaissance",
    recentCatalystTeaser: "Microsoft restarted Three Mile Island"
  },
  {
    id: "netflix",
    icon: "📺",
    title: "Streaming Wars Winners",
    recentCatalystTeaser: "Netflix ad tier hit 40M users"
  },
  {
    id: "defense",
    icon: "🛡️",
    title: "Defense & Aerospace",
    recentCatalystTeaser: "NATO defense spending at Cold War highs"
  },
  {
    id: "space",
    icon: "🚀",
    title: "Space Economy",
    recentCatalystTeaser: "SpaceX hit 7,000 Starlink satellites"
  },
  {
    id: "pets",
    icon: "🐕",
    title: "Pet Economy",
    recentCatalystTeaser: "70% of millennials now own pets"
  },
  {
    id: "barbell",
    icon: "🛒",
    title: "Retail Barbell",
    recentCatalystTeaser: "Costco hit all-time highs +45% YTD"
  },
  {
    id: "longevity",
    icon: "💊",
    title: "Future of Longevity",
    recentCatalystTeaser: "Eli Lilly market cap passed $750B"
  },
  {
    id: "cashcow",
    icon: "🐄",
    title: "Cash Cows",
    recentCatalystTeaser: "60+ years of consecutive dividend raises"
  },
  {
    id: "ipo2026",
    icon: "🦄",
    title: "2026 IPO Watchlist",
    recentCatalystTeaser: "Stripe valued at $65B, SpaceX at $180B"
  },
  {
    id: "indexchill",
    icon: "📈",
    title: "Index & Chill",
    recentCatalystTeaser: "S&P 500 beat 90% of active managers"
  }
];

export const themeStories: Record<string, ThemeStory> = {
  nuclear: {
    id: "nuclear",
    title: "Nuclear Renaissance",
    icon: "⚛️",
    
    act1: {
      hookLine: "September 2024: Microsoft did something surprising.",
      recentCatalyst: {
        date: "September 2024",
        event: "Microsoft signed deal to restart Three Mile Island reactor",
        impact: "$1.6 billion investment to bring it back online"
      },
      whyItMatters: "The same plant that had America's worst nuclear accident. They're bringing it back. Why? To power AI data centers.",
      pattern: "Sept: Microsoft Three Mile Island. Oct: Google nuclear SMR contracts. Dec: Amazon invests in X-energy. Jan: Oracle 1GW data center plans. Big Tech can't get enough power for AI."
    },
    
    act2: {
      near: "2025: Tech companies securing private power deals (happening)",
      medium: "2026-2027: Small modular reactors start construction",
      far: "2028+: First new US nuclear plants in 30+ years come online",
      inflectionPoint: "ChatGPT query uses 10x the electricity of a Google search. Multiply by billions of queries. Add autonomous vehicles, robotics, everything AI.",
      stakes: "The grid can't handle it. Either we solve power, or AI growth stops."
    },
    
    act3: {
      layers: [
        { category: "Uranium Miners", examples: "CCJ, DNN, UEC" },
        { category: "Reactor Technology", examples: "Private: NuScale, X-energy, TerraPower" },
        { category: "Grid Infrastructure", examples: "ETN, PWR, CARR" }
      ],
      recentMoves: [
        "Uranium spot price: $80 → $106/lb",
        "CCJ: +22% in 30 days",
        "Nuclear utilities reconsidering plant shutdowns"
      ],
      whatsNext: [
        "More Big Tech nuclear partnerships",
        "SMR construction approvals",
        "Uranium supply constraint developments"
      ]
    },
    
    stockCount: 5,
    themeId: "nuclear"
  },
  
  netflix: {
    id: "netflix",
    title: "Streaming Wars Winners",
    icon: "📺",
    
    act1: {
      hookLine: "The streaming bloodbath is over—survivors are emerging.",
      recentCatalyst: {
        date: "2024",
        event: "Netflix's ad tier hit 40M users in just 18 months",
        impact: "Password sharing crackdown added 13M subscribers in a single quarter"
      },
      whyItMatters: "The streaming wars created unsustainable economics. That consolidation is now complete. Winners now have pricing power.",
      pattern: "Netflix ad tier growing. Disney+ just turned profitable. Warner Bros restructuring. The survivors will compound."
    },
    
    act2: {
      near: "2025: Ad revenue diversification accelerating",
      medium: "2026-2027: Live sports deals create appointment viewing",
      far: "2028+: Streaming becomes default entertainment platform",
      inflectionPoint: "260M+ subscribers globally gives Netflix unprecedented leverage with content creators and advertisers.",
      stakes: "The market consolidating to 3-4 winners. Everyone else is an acquisition target."
    },
    
    act3: {
      layers: [
        { category: "Streaming Leaders", examples: "NFLX, DIS" },
        { category: "Content & Sports", examples: "WBD, PARA" },
        { category: "Ad Tech", examples: "Digital ad infrastructure" }
      ],
      recentMoves: [
        "NFLX: All-time highs on subscriber growth",
        "DIS+: First profitable quarter",
        "WWE deal signed by Netflix"
      ],
      whatsNext: [
        "More live sports acquisitions",
        "Ad tier penetration metrics",
        "Bundle consolidation announcements"
      ]
    },
    
    stockCount: 4,
    themeId: "netflix"
  },
  
  defense: {
    id: "defense",
    title: "Defense & Aerospace",
    icon: "🛡️",
    
    act1: {
      hookLine: "The peace dividend is over.",
      recentCatalyst: {
        date: "2024",
        event: "NATO members racing to hit 2% GDP defense targets",
        impact: "US defense budget hit $886B for 2024"
      },
      whyItMatters: "After 30 years of declining defense budgets in the West, geopolitical reality has forced a reversal.",
      pattern: "Ukraine war year 3. Taiwan tensions at multi-decade highs. Europe's defense spending at Cold War levels."
    },
    
    act2: {
      near: "2025: Defense budget increases continue",
      medium: "2026-2027: Taiwan contingency preparations intensify",
      far: "2028+: Full reshoring of defense manufacturing",
      inflectionPoint: "Backlogs at major defense contractors are stretched to 2030+. These aren't cyclical—they're structural multi-year revenue streams.",
      stakes: "Three theaters driving sustained demand: Europe, Indo-Pacific, Middle East."
    },
    
    act3: {
      layers: [
        { category: "Prime Contractors", examples: "LMT, RTX, NOC, GD" },
        { category: "Defense Tech", examples: "PLTR, KTOS, AVAV" },
        { category: "Aerospace", examples: "LHX, BA" }
      ],
      recentMoves: [
        "Defense ETFs hitting all-time highs",
        "PLTR: +180% on government AI contracts",
        "Backlog visibility through 2030+"
      ],
      whatsNext: [
        "FY2025 defense budget finalization",
        "New DOD contract announcements",
        "European defense spending increases"
      ]
    },
    
    stockCount: 5,
    themeId: "defense"
  },
  
  space: {
    id: "space",
    title: "Space Economy",
    icon: "🚀",
    
    act1: {
      hookLine: "SpaceX just proved the impossible is routine.",
      recentCatalyst: {
        date: "2024",
        event: "SpaceX hit 7,000 Starlink satellites in orbit",
        impact: "Launch costs dropped 90% in a decade"
      },
      whyItMatters: "Reusable rockets work. This unlocked entirely new economics for space.",
      pattern: "SpaceX launches more mass than all others combined. Rocket Lab caught a booster mid-air. ISS retires in 2030."
    },
    
    act2: {
      near: "2025: Starlink profitability, Starship regular flights",
      medium: "2026-2027: Commercial space stations, lunar cargo missions",
      far: "2028+: Moon base construction, Mars prep missions",
      inflectionPoint: "At $10/kg to orbit, everything changes. Satellites become disposable. Space stations become hotels.",
      stakes: "The first trillionaire will be made in space."
    },
    
    act3: {
      layers: [
        { category: "Launch Services", examples: "RKLB, Private: SpaceX" },
        { category: "Satellite Services", examples: "ASTS, PL, IRDM" },
        { category: "Lunar Economy", examples: "LUNR, space infrastructure" }
      ],
      recentMoves: [
        "RKLB: +120% on Neutron progress",
        "SpaceX private valuation: $180B+",
        "AST SpaceMobile direct-to-cell tests"
      ],
      whatsNext: [
        "Starship monthly cadence",
        "Starlink direct-to-cell launch",
        "SpaceX IPO speculation"
      ]
    },
    
    stockCount: 4,
    themeId: "space"
  },
  
  pets: {
    id: "pets",
    title: "Pet Economy",
    icon: "🐕",
    
    act1: {
      hookLine: "Millennials are delaying children but adopting pets.",
      recentCatalyst: {
        date: "2024",
        event: "70% of millennials now own pets",
        impact: "Average annual spend per pet up 30% since 2019"
      },
      whyItMatters: "The 'humanization' of pets drives premiumization across food, healthcare, and services.",
      pattern: "Chewy autoship at 78% of sales. Pet insurance penetration only 4% in US vs 25% in UK. Massive runway."
    },
    
    act2: {
      near: "2025: Pet insurance penetration growing",
      medium: "2026-2027: Vet tech and telehealth expansion",
      far: "2028+: Pet wellness becomes preventive care standard",
      inflectionPoint: "Pet owners cut their own spending before their pets'. This is recession-resistant.",
      stakes: "US pet spending: $147B in 2023 and growing."
    },
    
    act3: {
      layers: [
        { category: "Pet Retail", examples: "CHWY" },
        { category: "Vet & Diagnostics", examples: "IDXX, ZTS" },
        { category: "Pet Insurance", examples: "TRUP" }
      ],
      recentMoves: [
        "CHWY: Autoship revenue dominant",
        "IDXX: Vet visits up 35% since pandemic",
        "ZTS: World leader in animal health"
      ],
      whatsNext: [
        "Pet insurance adoption rates",
        "Vet tech innovation",
        "Premium pet food trends"
      ]
    },
    
    stockCount: 4,
    themeId: "pets"
  },
  
  barbell: {
    id: "barbell",
    title: "Retail Barbell",
    icon: "🛒",
    
    act1: {
      hookLine: "The middle is dying in retail.",
      recentCatalyst: {
        date: "2024",
        event: "Costco stock hit all-time highs with +45% YTD",
        impact: "Meanwhile Kohl's, Macy's collapsed"
      },
      whyItMatters: "Consumer spending is bifurcating: either extreme value or premium luxury.",
      pattern: "Department stores squeezed from both ends. Value (Costco, Walmart) and luxury (RH) winning."
    },
    
    act2: {
      near: "2025: Value retailers gaining share",
      medium: "2026-2027: More mid-tier retail consolidation",
      far: "2028+: Clear two-tier retail landscape",
      inflectionPoint: "Income inequality reshaping retail. Middle class shrinking, middle-market retailers dying.",
      stakes: "Either rock-bottom prices or premium experiences worth paying for. Nothing in between survives."
    },
    
    act3: {
      layers: [
        { category: "Value Winners", examples: "COST, WMT, DG" },
        { category: "Luxury Winners", examples: "RH" },
        { category: "Losers", examples: "Department stores (avoid)" }
      ],
      recentMoves: [
        "COST: Membership model creating loyalty",
        "WMT: Walmart+ growing",
        "RH: Luxury home proving resilient"
      ],
      whatsNext: [
        "Consumer spending data",
        "Membership growth metrics",
        "Mid-tier retailer bankruptcies"
      ]
    },
    
    stockCount: 4,
    themeId: "barbell"
  },
  
  longevity: {
    id: "longevity",
    title: "Future of Longevity",
    icon: "💊",
    
    act1: {
      hookLine: "Obesity is now a treatable condition.",
      recentCatalyst: {
        date: "2024",
        event: "Eli Lilly's market cap passed $750B on GLP-1 drugs",
        impact: "Novo Nordisk became Europe's most valuable company"
      },
      whyItMatters: "GLP-1 drugs aren't just weight loss—trials show they reduce heart attacks, strokes, potentially Alzheimer's.",
      pattern: "Bezos invested $3B into Altos Labs. FDA starting to recognize aging as treatable."
    },
    
    act2: {
      near: "2025: GLP-1 supply scaling, insurance expanding",
      medium: "2026-2027: Oral versions launch, prices drop",
      far: "2028+: GLP-1s become as common as statins",
      inflectionPoint: "When oral versions hit at 50% lower prices, adoption goes mainstream.",
      stakes: "A trillion-dollar shift in healthcare, food, and fitness industries."
    },
    
    act3: {
      layers: [
        { category: "GLP-1 Leaders", examples: "LLY, NVO" },
        { category: "Senior Care", examples: "WELL, VTR" },
        { category: "Gene Editing", examples: "CRSP" }
      ],
      recentMoves: [
        "LLY: +60% YTD, 8th largest company globally",
        "NVO: +40% YTD",
        "Weight Watchers: -80% from peak"
      ],
      whatsNext: [
        "Eli Lilly oral GLP-1 results",
        "Insurance coverage expansion",
        "Competitor drug approvals"
      ]
    },
    
    stockCount: 5,
    themeId: "longevity"
  },
  
  cashcow: {
    id: "cashcow",
    title: "Cash Cows",
    icon: "🐄",
    
    act1: {
      hookLine: "60+ years of consecutive dividend raises.",
      recentCatalyst: {
        date: "Decades",
        event: "These five companies raised dividends through wars, recessions, pandemics",
        impact: "Buffett's longest-held position is Coca-Cola"
      },
      whyItMatters: "When interest rates were 0%, dividend stocks were boring. Now they're not.",
      pattern: "In uncertain markets, boring cash compounders outperform. These companies have moats measured in decades."
    },
    
    act2: {
      near: "2025: Dividends continue compounding",
      medium: "2026-2027: Pricing power maintains margins",
      far: "Forever: The compounding never stops",
      inflectionPoint: "$10,000 invested in Coca-Cola in 1988 is worth over $500,000 today with dividends reinvested.",
      stakes: "Predictable earnings, return of capital discipline, low volatility."
    },
    
    act3: {
      layers: [
        { category: "Consumer Staples", examples: "KO, PEP, PG" },
        { category: "Healthcare", examples: "JNJ" },
        { category: "Fast Food", examples: "MCD" }
      ],
      recentMoves: [
        "All maintaining dividend streaks",
        "Pricing power intact despite inflation",
        "Low volatility vs market"
      ],
      whatsNext: [
        "Quarterly dividend increases",
        "Earnings stability",
        "Defensive positioning"
      ]
    },
    
    stockCount: 5,
    themeId: "cashcow"
  },
  
  ipo2026: {
    id: "ipo2026",
    title: "2026 IPO Watchlist",
    icon: "🦄",
    
    act1: {
      hookLine: "The IPO window is reopening.",
      recentCatalyst: {
        date: "2024",
        event: "Stripe at $65B, SpaceX at $180B, Databricks at $43B",
        impact: "Mature companies need liquidity for employees"
      },
      whyItMatters: "The 2022-2023 IPO freeze created a backlog of profitable private companies.",
      pattern: "Over $1 trillion in private company value waiting to go public. Unlike 2021, these companies are profitable."
    },
    
    act2: {
      near: "2025: IPO window testing",
      medium: "2026: Major IPOs expected",
      far: "2027+: Full IPO market recovery",
      inflectionPoint: "These companies have been forced to demonstrate profitability. They're more mature than 2021 vintage.",
      stakes: "When they IPO, they'll be rare combination of scale and growth."
    },
    
    act3: {
      layers: [
        { category: "Fintech", examples: "Stripe, Klarna" },
        { category: "Space", examples: "SpaceX (Starlink spinoff?)" },
        { category: "AI/Data", examples: "Databricks" }
      ],
      recentMoves: [
        "Stripe: $1T+ payment volume, profitable",
        "SpaceX: Starlink alone worth $100B+",
        "Secondary market activity increasing"
      ],
      whatsNext: [
        "IPO filings",
        "Secondary market valuations",
        "Market conditions for offerings"
      ]
    },
    
    stockCount: 5,
    themeId: "ipo2026"
  },
  
  indexchill: {
    id: "indexchill",
    title: "Index & Chill",
    icon: "📈",
    
    act1: {
      hookLine: "Most stock pickers lose to the index.",
      recentCatalyst: {
        date: "15 years of data",
        event: "S&P 500 beat 90% of active managers",
        impact: "Even the best hedge funds struggle to outperform after fees"
      },
      whyItMatters: "The math is simple: low fees + diversification + time = wealth.",
      pattern: "Over 15 years, 92% of large-cap managers underperformed. It's not that they're bad—market is efficient and fees matter."
    },
    
    act2: {
      near: "2025: Keep buying, keep holding",
      medium: "2026-2027: Compounding continues",
      far: "Forever: Time in market beats timing the market",
      inflectionPoint: "Jack Bogle's insight: you can't control returns, but you can control costs.",
      stakes: "Every dollar in fees is a dollar not compounding."
    },
    
    act3: {
      layers: [
        { category: "Total Market", examples: "VOO, VTI" },
        { category: "Growth", examples: "QQQ" },
        { category: "Dividends", examples: "SCHD" }
      ],
      recentMoves: [
        "VOO: Continued inflows",
        "QQQ: Tech-heavy performance",
        "SCHD: Dividend growth"
      ],
      whatsNext: [
        "Market returns compound",
        "Dollar-cost averaging",
        "Stay the course"
      ]
    },
    
    stockCount: 4,
    themeId: "indexchill"
  }
};

// Order themes by archetype preference
export const archetypeThemePreferences: Record<string, string[]> = {
  momentum_hunter: [
    "nuclear", "space", "defense", "longevity", "netflix",
    "pets", "barbell", "cashcow", "ipo2026", "indexchill"
  ],
  strategic_analyst: [
    "nuclear", "longevity", "defense", "cashcow", "barbell",
    "netflix", "pets", "space", "indexchill", "ipo2026"
  ],
  cautious_builder: [
    "cashcow", "indexchill", "longevity", "barbell", "pets",
    "nuclear", "defense", "netflix", "space", "ipo2026"
  ],
  curious_learner: [
    "space", "nuclear", "longevity", "defense", "netflix",
    "pets", "barbell", "cashcow", "ipo2026", "indexchill"
  ],
  balanced_realist: [
    "longevity", "nuclear", "cashcow", "defense", "barbell",
    "pets", "netflix", "indexchill", "space", "ipo2026"
  ],
  calculated_risk_taker: [
    "space", "ipo2026", "defense", "nuclear", "longevity",
    "netflix", "pets", "barbell", "cashcow", "indexchill"
  ]
};

export function getOrderedThemes(archetype: string): ThemeCard[] {
  const order = archetypeThemePreferences[archetype] || archetypeThemePreferences.momentum_hunter;
  return order
    .map(id => selectorThemes.find(t => t.id === id))
    .filter((t): t is ThemeCard => t !== undefined);
}
