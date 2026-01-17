import { ThemeCard, ThemeStory } from '@/types/themeStory';

export const selectorThemes: ThemeCard[] = [
  {
    id: "ai_physical",
    icon: "🤖",
    title: "AI Goes Physical",
    recentCatalystTeaser: "BMW just deployed robots in factories"
  },
  {
    id: "nuclear_renaissance",
    icon: "⚛️",
    title: "Nuclear Renaissance",
    recentCatalystTeaser: "Microsoft restarted Three Mile Island"
  },
  {
    id: "weight_loss",
    icon: "💊",
    title: "Weight Loss Revolution",
    recentCatalystTeaser: "FDA expanded Wegovy approval"
  },
  {
    id: "defense_tech",
    icon: "🛡️",
    title: "Defense Tech Renaissance",
    recentCatalystTeaser: "Anduril raised $1.5B at $14B valuation"
  },
  {
    id: "space_economy",
    icon: "🚀",
    title: "Space Economy 2.0",
    recentCatalystTeaser: "Starship successful orbital test"
  },
  {
    id: "gene_editing",
    icon: "✂️",
    title: "CRISPR Goes Commercial",
    recentCatalystTeaser: "First gene editing therapy FDA approved"
  }
];

export const themeStories: Record<string, ThemeStory> = {
  ai_physical: {
    id: "ai_physical",
    title: "AI Goes Physical",
    icon: "🤖",
    
    act1: {
      hookLine: "Two weeks ago, something shifted.",
      recentCatalyst: {
        date: "January 8, 2025",
        event: "Figure AI deployed humanoid robots in BMW factories",
        impact: "$200M funding round announced"
      },
      whyItMatters: "This isn't a demo or pilot. This is production. Real robots doing real work in real factories.",
      pattern: "In the last 30 days: Figure → BMW, Tesla Optimus Gen 2 reveal, Sanctuary AI → Magna. Pattern: Tech companies moving into real factories. Demos becoming deployments."
    },
    
    act2: {
      near: "2025: Factories and warehouses (happening now)",
      medium: "2026-2027: Retail, hospitality, healthcare (trials starting)",
      far: "2028+: Consumer homes? TBD.",
      inflectionPoint: "Tesla says Optimus will cost $20-30K. That's less than a car. Less than one year of minimum wage.",
      stakes: "If that pricing is real, labor economics fundamentally change."
    },
    
    act3: {
      layers: [
        {
          category: "AI Brains",
          examples: "NVDA (chips), GOOGL (models)"
        },
        {
          category: "Robot Bodies",
          examples: "TSLA (Optimus), Private: Figure, 1X"
        },
        {
          category: "Components",
          examples: "Sensors, actuators, Asian manufacturers"
        }
      ],
      recentMoves: [
        "NVDA: +8% on data center AI demand",
        "TSLA: +12% on Optimus Gen 2 update",
        "Component suppliers: +15-25%"
      ],
      whatsNext: [
        "Optimus production numbers (Q1 2025)",
        "Figure's next funding round",
        "More enterprise deployment announcements"
      ]
    },
    
    stockCount: 7,
    themeId: "ai_physical"
  },
  
  nuclear_renaissance: {
    id: "nuclear_renaissance",
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
        {
          category: "Uranium Miners",
          examples: "CCJ, DNN, UEC"
        },
        {
          category: "Reactor Technology",
          examples: "Private: NuScale, X-energy, TerraPower"
        },
        {
          category: "Grid Infrastructure",
          examples: "ETN, PWR, CARR"
        }
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
    themeId: "nuclear_renaissance"
  },
  
  weight_loss: {
    id: "weight_loss",
    title: "Weight Loss Revolution",
    icon: "💊",
    
    act1: {
      hookLine: "Obesity is now a treatable condition.",
      recentCatalyst: {
        date: "December 2024",
        event: "FDA expanded Wegovy approval for heart disease prevention",
        impact: "Opens door for insurance coverage, potentially 100M+ eligible patients"
      },
      whyItMatters: "This isn't just weight loss anymore. It's cardiovascular medicine. It's preventive care. The addressable market just 10x'd.",
      pattern: "Wegovy → Mounjaro → Zepbound. Each launch bigger than the last. Pharma companies racing to develop next-gen versions. Supply can't keep up with demand."
    },
    
    act2: {
      near: "2025: Supply scaling, insurance coverage expanding",
      medium: "2026-2027: Oral versions launching, prices dropping",
      far: "2028+: GLP-1s become as common as statins",
      inflectionPoint: "When oral versions hit market at 50% lower prices, adoption goes mainstream. No more injections. No more shortages.",
      stakes: "A trillion-dollar shift in healthcare, food, and fitness industries."
    },
    
    act3: {
      layers: [
        {
          category: "Drug Makers",
          examples: "LLY (Mounjaro), NVO (Wegovy)"
        },
        {
          category: "Contract Manufacturing",
          examples: "CTLT, WST"
        },
        {
          category: "Disrupted Industries",
          examples: "Fast food, bariatric surgery (negative)"
        }
      ],
      recentMoves: [
        "LLY: +60% YTD, now 8th largest company globally",
        "NVO: +40% YTD",
        "Weight Watchers: -80% from peak"
      ],
      whatsNext: [
        "Eli Lilly oral GLP-1 trial results",
        "Insurance coverage expansion decisions",
        "New competitor drug approvals"
      ]
    },
    
    stockCount: 6,
    themeId: "weight_loss"
  },
  
  defense_tech: {
    id: "defense_tech",
    title: "Defense Tech Renaissance",
    icon: "🛡️",
    
    act1: {
      hookLine: "Silicon Valley is building weapons again.",
      recentCatalyst: {
        date: "December 2024",
        event: "Anduril raised $1.5B at $14B valuation",
        impact: "Became one of the most valuable defense startups ever"
      },
      whyItMatters: "After decades of refusing defense contracts, tech talent is flowing into defense. Ukraine proved that software-defined warfare wins.",
      pattern: "Anduril, Shield AI, Palantir, SpaceX Starshield. The new defense industrial base is being built in Palo Alto, not Virginia."
    },
    
    act2: {
      near: "2025: DOD budget increases, Ukraine aid packages",
      medium: "2026-2027: Taiwan contingency preparations",
      far: "2028+: Full reshoring of defense manufacturing",
      inflectionPoint: "Legacy contractors can't innovate fast enough. The Pentagon is actively bypassing them for Silicon Valley startups.",
      stakes: "The next war won't be won with more steel. It'll be won with better software."
    },
    
    act3: {
      layers: [
        {
          category: "Software & AI",
          examples: "PLTR, Private: Anduril, Shield AI"
        },
        {
          category: "Space Defense",
          examples: "LMT, RTX, Private: SpaceX"
        },
        {
          category: "Drones & Autonomy",
          examples: "KTOS, AVAV"
        }
      ],
      recentMoves: [
        "PLTR: +180% YTD on government AI contracts",
        "KTOS: +45% on drone program wins",
        "Defense ETFs hitting all-time highs"
      ],
      whatsNext: [
        "FY2025 defense budget finalization",
        "New DOD contract announcements",
        "Anduril IPO speculation"
      ]
    },
    
    stockCount: 8,
    themeId: "defense_tech"
  },
  
  space_economy: {
    id: "space_economy",
    title: "Space Economy 2.0",
    icon: "🚀",
    
    act1: {
      hookLine: "SpaceX just proved the impossible is routine.",
      recentCatalyst: {
        date: "January 2025",
        event: "Starship completed first successful orbital test and tower catch",
        impact: "Launch costs now heading toward $10/kg to orbit"
      },
      whyItMatters: "At $10/kg, everything changes. Satellites become disposable. Space stations become hotels. Moon bases become feasible.",
      pattern: "SpaceX now launches more mass to orbit than all other providers combined. And their costs keep dropping while everyone else's stay flat."
    },
    
    act2: {
      near: "2025: Starlink profitability, Starship regular flights",
      medium: "2026-2027: Commercial space stations, lunar cargo missions",
      far: "2028+: Moon base construction, Mars prep missions",
      inflectionPoint: "When Starship flies weekly at $2M per launch, the economics of everything space-related get rewritten.",
      stakes: "The first trillionaire will be made in space. Bezos said it. Musk is proving it."
    },
    
    act3: {
      layers: [
        {
          category: "Launch Services",
          examples: "Private: SpaceX, RocketLab (RKLB)"
        },
        {
          category: "Satellite Services",
          examples: "Private: Starlink, IRDM"
        },
        {
          category: "Space Infrastructure",
          examples: "LDOS, AJRD, space component suppliers"
        }
      ],
      recentMoves: [
        "RKLB: +120% on successful Neutron progress",
        "Space SPACs recovering from 2022 lows",
        "SpaceX private valuation: $180B+"
      ],
      whatsNext: [
        "Starship monthly cadence achievement",
        "Starlink direct-to-cell service launch",
        "SpaceX IPO (Starlink spinoff?) speculation"
      ]
    },
    
    stockCount: 5,
    themeId: "space_economy"
  },
  
  gene_editing: {
    id: "gene_editing",
    title: "CRISPR Goes Commercial",
    icon: "✂️",
    
    act1: {
      hookLine: "We can now edit the code of life.",
      recentCatalyst: {
        date: "December 2023",
        event: "FDA approved first CRISPR gene therapy (Casgevy)",
        impact: "First commercial gene editing treatment for sickle cell disease"
      },
      whyItMatters: "This isn't a research paper. It's a prescription. Doctors are now editing genes in patients. The science fiction became medical fact.",
      pattern: "Casgevy approval → Vertex stock surge → 50+ gene editing therapies now in clinical trials. Pipeline is exploding."
    },
    
    act2: {
      near: "2025: More approvals, manufacturing scale-up",
      medium: "2026-2027: Therapies for common diseases (diabetes, heart disease)",
      far: "2028+: Preventive gene editing? Regulation will decide.",
      inflectionPoint: "Current therapies cost $2M+ per patient. When manufacturing scales and costs drop to $100K, addressable market expands 100x.",
      stakes: "The companies that figure out manufacturing at scale will define healthcare for the next century."
    },
    
    act3: {
      layers: [
        {
          category: "Platform Technology",
          examples: "CRSP, NTLA, BEAM"
        },
        {
          category: "Therapeutics",
          examples: "VRTX (partner), BLUE"
        },
        {
          category: "Manufacturing & Tools",
          examples: "TMO, A, ILMN"
        }
      ],
      recentMoves: [
        "CRSP: +35% on Casgevy approval",
        "VRTX: +20% on manufacturing progress",
        "Biotech sector broadly recovering"
      ],
      whatsNext: [
        "Additional disease indication approvals",
        "Next-gen CRISPR technology advances",
        "Manufacturing cost reduction updates"
      ]
    },
    
    stockCount: 6,
    themeId: "gene_editing"
  }
};

export const archetypeThemePreferences: Record<string, string[]> = {
  momentum_hunter: [
    "ai_physical",
    "defense_tech",
    "space_economy",
    "weight_loss",
    "nuclear_renaissance",
    "gene_editing"
  ],
  strategic_analyst: [
    "nuclear_renaissance",
    "gene_editing",
    "weight_loss",
    "ai_physical",
    "defense_tech",
    "space_economy"
  ],
  cautious_builder: [
    "nuclear_renaissance",
    "weight_loss",
    "gene_editing",
    "ai_physical",
    "space_economy",
    "defense_tech"
  ],
  curious_learner: [
    "ai_physical",
    "space_economy",
    "gene_editing",
    "weight_loss",
    "defense_tech",
    "nuclear_renaissance"
  ],
  balanced_realist: [
    "weight_loss",
    "nuclear_renaissance",
    "ai_physical",
    "gene_editing",
    "space_economy",
    "defense_tech"
  ],
  calculated_risk_taker: [
    "defense_tech",
    "space_economy",
    "ai_physical",
    "gene_editing",
    "nuclear_renaissance",
    "weight_loss"
  ]
};

export function getOrderedThemes(archetype: string): ThemeCard[] {
  const order = archetypeThemePreferences[archetype] || archetypeThemePreferences.momentum_hunter;
  return order
    .map(id => selectorThemes.find(t => t.id === id))
    .filter((t): t is ThemeCard => t !== undefined);
}
