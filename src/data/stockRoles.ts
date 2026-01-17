// Stock roles and micro-research data for gamified theme experience

export interface StockRoleData {
  ticker: string;
  role: string;
  microResearch: string;
}

export const stockRoles: Record<string, StockRoleData[]> = {
  nuclear: [
    {
      ticker: "CCJ",
      role: "The Miner",
      microResearch: "If the world builds reactors, they need this fuel first. They own the best uranium mines on Earth."
    },
    {
      ticker: "VST",
      role: "The Grid",
      microResearch: "They run the power plants that keep Texas lit. Nuclear deals in progress, AI demand secured."
    },
    {
      ticker: "CEG",
      role: "The Utility",
      microResearch: "America's largest clean energy producer. The Microsoft deal was just the beginning."
    },
    {
      ticker: "SMR",
      role: "The Tech",
      microResearch: "Building mini-reactors that fit anywhere. The future of modular nuclear power."
    },
    {
      ticker: "LEU",
      role: "The Enricher",
      microResearch: "The only US company enriching uranium. National security asset in an energy crisis."
    }
  ],
  netflix: [
    {
      ticker: "NFLX",
      role: "The King",
      microResearch: "260M subscribers, ad tier booming, password crackdown worked. The streaming wars are over."
    },
    {
      ticker: "DIS",
      role: "The Empire",
      microResearch: "Disney+, Hulu, ESPN+, and Marvel. Finally profitable. The comeback is real."
    },
    {
      ticker: "WBD",
      role: "The Underdog",
      microResearch: "Max is growing, debt is shrinking. High risk, high reward if they execute."
    },
    {
      ticker: "PARA",
      role: "The Target",
      microResearch: "Content library everyone wants. Acquisition target in a consolidating market."
    }
  ],
  defense: [
    {
      ticker: "LMT",
      role: "The Prime",
      microResearch: "F-35s, missiles, and space systems. The world's largest defense contractor."
    },
    {
      ticker: "RTX",
      role: "The Arsenal",
      microResearch: "Patriot missiles, Pratt engines, Collins avionics. Backlog stretched to 2030+."
    },
    {
      ticker: "NOC",
      role: "The Stealth",
      microResearch: "B-21 Raider bomber, classified programs. The Pentagon's favorite contractor."
    },
    {
      ticker: "GD",
      role: "The Builder",
      microResearch: "Submarines, tanks, and Gulfstream jets. Government contracts meet luxury."
    },
    {
      ticker: "LHX",
      role: "The Intel",
      microResearch: "Communications, sensors, and space tech. The nervous system of modern warfare."
    }
  ],
  space: [
    {
      ticker: "RKLB",
      role: "The Launcher",
      microResearch: "Only company besides SpaceX with a working reusable rocket. Neutron changes everything."
    },
    {
      ticker: "ASTS",
      role: "The Connector",
      microResearch: "Cell service from space, direct to your phone. First-mover in a $1T market."
    },
    {
      ticker: "PL",
      role: "The Eyes",
      microResearch: "200+ satellites watching Earth daily. The Bloomberg Terminal for the physical world."
    },
    {
      ticker: "LUNR",
      role: "The Pioneer",
      microResearch: "First private company to land on the Moon. NASA's go-to lunar delivery service."
    }
  ],
  pets: [
    {
      ticker: "CHWY",
      role: "The Platform",
      microResearch: "78% autoship revenue. Pet parents never cancel. Recession-proof loyalty."
    },
    {
      ticker: "IDXX",
      role: "The Diagnostics",
      microResearch: "Every vet office runs on IDEXX. Pet healthcare's essential infrastructure."
    },
    {
      ticker: "ZTS",
      role: "The Pharma",
      microResearch: "Animal health leader. Vaccines, meds, and the Apoquel cash machine."
    },
    {
      ticker: "TRUP",
      role: "The Insurer",
      microResearch: "Pet insurance at 4% US penetration vs 25% in UK. Massive runway ahead."
    }
  ],
  barbell: [
    {
      ticker: "COST",
      role: "The Cult",
      microResearch: "Membership model creates religious loyalty. $1.50 hot dog is a moat."
    },
    {
      ticker: "WMT",
      role: "The Giant",
      microResearch: "World's largest retailer. Walmart+ and grocery delivery are working."
    },
    {
      ticker: "DG",
      role: "The Discounter",
      microResearch: "15,000 stores in small-town America. The only game in town for millions."
    },
    {
      ticker: "RH",
      role: "The Luxury",
      microResearch: "High-end furniture for the 1%. Proving premium retail still wins."
    }
  ],
  longevity: [
    {
      ticker: "LLY",
      role: "The Giant",
      microResearch: "Mounjaro, Zepbound, and Alzheimer's drugs. The hottest pharma company alive."
    },
    {
      ticker: "NVO",
      role: "The Pioneer",
      microResearch: "Ozempic and Wegovy creator. Made Europe's most valuable company."
    },
    {
      ticker: "WELL",
      role: "The Care",
      microResearch: "Senior housing and healthcare real estate. Demographics are destiny."
    },
    {
      ticker: "VTR",
      role: "The REIT",
      microResearch: "Senior living and research buildings. Aging population needs housing."
    },
    {
      ticker: "CRSP",
      role: "The Editor",
      microResearch: "Gene editing pioneer. First CRISPR therapy approved. Science fiction is real."
    }
  ],
  cashcow: [
    {
      ticker: "KO",
      role: "The Classic",
      microResearch: "60+ years of dividend raises. Buffett's longest-held position."
    },
    {
      ticker: "PEP",
      role: "The Diversified",
      microResearch: "Drinks and snacks empire. Frito-Lay is secretly the crown jewel."
    },
    {
      ticker: "JNJ",
      role: "The Healthcare",
      microResearch: "Band-Aid to cancer drugs. 62 consecutive dividend increases."
    },
    {
      ticker: "PG",
      role: "The Essential",
      microResearch: "Tide, Pampers, Gillette. Products people buy without thinking."
    },
    {
      ticker: "MCD",
      role: "The Golden",
      microResearch: "World's largest restaurant chain. Actually a real estate company."
    }
  ],
  ipo2026: [
    {
      ticker: "STRIPE",
      role: "The Payments",
      microResearch: "$1T+ payment volume, finally profitable. The Visa of the internet."
    },
    {
      ticker: "SPACEX",
      role: "The Moonshot",
      microResearch: "Starlink alone worth $100B+. Musk's most valuable company."
    },
    {
      ticker: "DATAB",
      role: "The Data",
      microResearch: "AI infrastructure everyone uses. $43B valuation and growing."
    },
    {
      ticker: "KLARNA",
      role: "The BNPL",
      microResearch: "Buy now, pay later leader. Profitable again and IPO ready."
    },
    {
      ticker: "SHEIN",
      role: "The Disruptor",
      microResearch: "Fast fashion faster than anyone. Controversial but undeniable growth."
    }
  ],
  indexchill: [
    {
      ticker: "VOO",
      role: "The Index",
      microResearch: "S&P 500 in one ticker. Beat 92% of active managers over 15 years."
    },
    {
      ticker: "VTI",
      role: "The Total",
      microResearch: "The entire US stock market. Ultimate diversification in one fund."
    },
    {
      ticker: "QQQ",
      role: "The Tech",
      microResearch: "Nasdaq 100's finest. Apple, Microsoft, Google, and friends."
    },
    {
      ticker: "SCHD",
      role: "The Dividend",
      microResearch: "Quality dividend stocks. Growth + income + low volatility."
    },
    {
      ticker: "VT",
      role: "The World",
      microResearch: "Every public company on Earth. True global diversification."
    }
  ]
};

export function getStockRole(themeId: string, ticker: string): StockRoleData | undefined {
  return stockRoles[themeId]?.find(stock => stock.ticker === ticker);
}

export function getThemeRoles(themeId: string): StockRoleData[] {
  return stockRoles[themeId] || [];
}
