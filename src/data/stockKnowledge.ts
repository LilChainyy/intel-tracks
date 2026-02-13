// Curated stock knowledge - manually maintained to avoid LLM hallucinations
// Update quarterly or when major events occur

export interface StockKnowledge {
  ticker: string;
  description: string; // 2-3 sentences, simple language
  keyProducts: string[]; // Max 5
  whyItMatters: string; // 1-2 sentences
  themes: string[]; // Maps to playlist IDs
}

export const stockKnowledge: Record<string, StockKnowledge> = {
  // Nuclear Renaissance
  CCJ: {
    ticker: "CCJ",
    description: "Cameco mines and sells uranium, the fuel that powers nuclear reactors. They control about 15% of global uranium supply. When datacenters need reliable clean energy, they need uranium.",
    keyProducts: ["Uranium mining", "Uranium refining", "Nuclear fuel services"],
    whyItMatters: "AI datacenters need 24/7 power. Nuclear is the only carbon-free option that runs all day, every day. Cameco benefits from this demand surge.",
    themes: ["nuclear"],
  },
  VST: {
    ticker: "VST",
    description: "Vistra generates electricity and sells it to homes and businesses across the US. They run nuclear plants, natural gas plants, and solar farms. They're restarting old nuclear plants to meet AI datacenter demand.",
    keyProducts: ["Nuclear power generation", "Natural gas power", "Solar energy", "Retail electricity"],
    whyItMatters: "Tech giants are signing long-term power contracts with Vistra. Stable revenue, growing AI demand, and nuclear revival all point in their favor.",
    themes: ["nuclear"],
  },
  CEG: {
    ticker: "CEG",
    description: "Constellation Energy operates the biggest fleet of nuclear reactors in America. They provide round-the-clock clean energy to the grid and directly to corporations like Microsoft.",
    keyProducts: ["Nuclear power plants", "Renewable energy", "Corporate power contracts"],
    whyItMatters: "Microsoft just signed a 20-year deal with Constellation to restart Three Mile Island. This shows how desperate Big Tech is for reliable power.",
    themes: ["nuclear"],
  },

  // Streaming Wars
  NFLX: {
    ticker: "NFLX",
    description: "Netflix streams movies and TV shows to 260M+ subscribers worldwide. They invented binge-watching and the streaming model everyone else copied. Now they're adding ads and live sports.",
    keyProducts: ["Streaming subscription", "Ad-supported tier", "Live sports (WWE, NFL)", "Original content"],
    whyItMatters: "Netflix survived the streaming wars. They're profitable, growing subscribers, and have pricing power. The competition is dying or consolidating.",
    themes: ["netflix"],
  },
  DIS: {
    ticker: "DIS",
    description: "Disney owns Marvel, Star Wars, Pixar, ESPN, and theme parks. Disney+ is their streaming service. They bundle Disney+, Hulu, and ESPN+ to compete with Netflix.",
    keyProducts: ["Disney+ streaming", "Theme parks", "ESPN sports", "Movies and merchandise"],
    whyItMatters: "Disney+ just turned profitable for the first time. Their huge content library and theme parks give them an edge Netflix doesn't have.",
    themes: ["netflix"],
  },

  // Defense & Aerospace
  LMT: {
    ticker: "LMT",
    description: "Lockheed Martin builds F-35 fighter jets, missiles, and satellite systems for the US military and allies. They're the world's largest defense contractor with a backlog stretching to 2030+.",
    keyProducts: ["F-35 fighter jets", "Missile defense systems", "Satellites", "Hypersonic weapons"],
    whyItMatters: "Ukraine war, Taiwan tensions, and NATO rearmament mean surging demand. Defense budgets aren't shrinking anytime soon.",
    themes: ["defense"],
  },
  RTX: {
    ticker: "RTX",
    description: "RTX (Raytheon Technologies) makes jet engines for Boeing and Airbus, plus missiles and defense systems. They serve both commercial airlines and militaries.",
    keyProducts: ["Pratt & Whitney jet engines", "Raytheon missiles", "Collins aerospace parts"],
    whyItMatters: "They're exposed to both defense spending (growing) and commercial aviation recovery. Double tailwind.",
    themes: ["defense"],
  },

  // Space Economy
  RKLB: {
    ticker: "RKLB",
    description: "Rocket Lab launches small satellites into orbit with their Electron rocket. Think of them as the UPS of space—they deliver payloads for companies and governments. They're building a bigger rocket called Neutron.",
    keyProducts: ["Electron rocket launches", "Neutron rocket (coming 2025)", "Satellite components"],
    whyItMatters: "SpaceX proved reusable rockets work. Rocket Lab is following that playbook for small satellites. The space economy is expanding fast.",
    themes: ["space"],
  },
  ASTS: {
    ticker: "ASTS",
    description: "AST SpaceMobile is building satellites that beam 5G internet directly to regular phones—no cell towers, no special equipment. Just your phone, talking to space.",
    keyProducts: ["BlueBird satellites", "Space-based cellular network"],
    whyItMatters: "If they pull this off, 3 billion people without cell coverage suddenly have connectivity. That's the bet. High risk, massive potential.",
    themes: ["space"],
  },

  // Longevity / Healthcare
  LLY: {
    ticker: "LLY",
    description: "Eli Lilly makes Mounjaro and Zepbound, the weight loss drugs competing with Ozempic. They also sell insulin, cancer drugs, and Alzheimer's treatments. GLP-1 drugs are their cash cow right now.",
    keyProducts: ["Mounjaro/Zepbound (weight loss)", "Insulin", "Cancer treatments", "Alzheimer's drugs"],
    whyItMatters: "40% of American adults are obese. If even 10% take these drugs, that's $100B+ annual revenue. Lilly is printing money.",
    themes: ["longevity"],
  },
  NVO: {
    ticker: "NVO",
    description: "Novo Nordisk invented Ozempic and Wegovy, the original blockbuster weight loss drugs. They're based in Denmark and became Europe's most valuable company thanks to GLP-1s.",
    keyProducts: ["Ozempic/Wegovy (GLP-1)", "Insulin", "Growth hormone therapies"],
    whyItMatters: "First-mover advantage in GLP-1s. Demand is so high they can't make enough supply. That's a good problem to have.",
    themes: ["longevity"],
  },

  // Pet Economy
  CHWY: {
    ticker: "CHWY",
    description: "Chewy sells pet food, toys, and supplies online. They built a loyal customer base with autoship subscriptions and amazing customer service. Pet owners are obsessed.",
    keyProducts: ["Pet food delivery", "Autoship subscriptions", "Pet pharmacy", "Vet telemedicine"],
    whyItMatters: "People treat pets like kids now. Pet spending is recession-resistant because owners cut their own expenses before their pets'.",
    themes: ["pets"],
  },
  IDXX: {
    ticker: "IDXX",
    description: "IDEXX makes diagnostic equipment and software for veterinarians. When your dog gets blood work done, it's probably analyzed on IDEXX machines. They're the hidden player behind pet healthcare.",
    keyProducts: ["Vet diagnostic equipment", "Laboratory testing", "Practice management software"],
    whyItMatters: "As pet humanization grows, vet visits increase. IDEXX is a toll booth on every checkup. Recurring revenue, high margins.",
    themes: ["pets"],
  },

  // Retail Barbell (value winners)
  COST: {
    ticker: "COST",
    description: "Costco runs membership-only warehouses where people buy bulk goods. The $1.50 hot dog combo hasn't changed price since 1985. Members renew at 90%+ rates—that's cult-level loyalty.",
    keyProducts: ["Warehouse clubs", "Kirkland private label", "Gas stations", "Travel services"],
    whyItMatters: "When inflation hurts, people flock to Costco for value. The membership model creates predictable revenue even in recessions.",
    themes: ["barbell"],
  },
  WMT: {
    ticker: "WMT",
    description: "Walmart is the world's biggest retailer. They sell groceries, electronics, clothes—everything. They're competing with Amazon by building out online delivery and pickup.",
    keyProducts: ["Supercenters", "Walmart.com", "Sam's Club", "Walmart+ subscription"],
    whyItMatters: "Walmart wins in tough times because they have the lowest prices. They're also catching up to Amazon in e-commerce.",
    themes: ["barbell"],
  },

  // Cash Cows (dividend aristocrats)
  JNJ: {
    ticker: "JNJ",
    description: "Johnson & Johnson makes Band-Aids, baby powder, and prescription drugs. They've raised dividends for 60+ consecutive years—through recessions, wars, and pandemics.",
    keyProducts: ["Consumer health (Band-Aid, Tylenol)", "Pharmaceuticals", "Medical devices"],
    whyItMatters: "Boring, predictable, and incredibly profitable. The dividend never stops. Perfect for conservative investors.",
    themes: ["cashcow"],
  },
  PG: {
    ticker: "PG",
    description: "Procter & Gamble owns Tide, Pampers, Gillette, Crest—brands you use every day without thinking. They quietly dominate consumer goods and return cash to shareholders religiously.",
    keyProducts: ["Tide detergent", "Pampers diapers", "Gillette razors", "Crest toothpaste", "Olay skincare"],
    whyItMatters: "You need laundry detergent no matter the economy. P&G's pricing power and dividends make it a safe harbor stock.",
    themes: ["cashcow"],
  },
  KO: {
    ticker: "KO",
    description: "Coca-Cola sells Coke, Sprite, Fanta, and dozens of other beverages worldwide. Warren Buffett has owned it since 1988. It's the definition of a cash cow.",
    keyProducts: ["Coca-Cola", "Sprite", "Fanta", "Dasani water", "Minute Maid"],
    whyItMatters: "Global brand, pricing power, steady dividends. It's not exciting, but it's reliable. That's the point.",
    themes: ["cashcow"],
  },

  // Index & Chill
  VOO: {
    ticker: "VOO",
    description: "VOO is an ETF that tracks the S&P 500—the 500 biggest US companies. You buy one share and own a slice of Apple, Microsoft, Amazon, and 497 others. Fees are tiny (0.03%).",
    keyProducts: ["S&P 500 index fund"],
    whyItMatters: "Over 15 years, 90%+ of fund managers lose to the S&P 500. Just buy the index and skip the stress.",
    themes: ["indexchill"],
  },
  VTI: {
    ticker: "VTI",
    description: "VTI owns every publicly traded US company—big, medium, and small. It's the ultimate diversification. If the US economy grows, VTI grows. Fees are 0.03%.",
    keyProducts: ["Total US stock market index fund"],
    whyItMatters: "Maximum diversification. You own everything. If you don't want to pick stocks, this is the answer.",
    themes: ["indexchill"],
  },
  QQQ: {
    ticker: "QQQ",
    description: "QQQ tracks the Nasdaq-100, which is the 100 biggest non-financial companies on the Nasdaq. It's heavy on tech: Apple, Microsoft, Nvidia, Amazon, Tesla. High growth, high volatility.",
    keyProducts: ["Nasdaq-100 index fund"],
    whyItMatters: "If you believe in tech dominance, QQQ is a concentrated bet. It's riskier than VOO but has delivered higher returns historically.",
    themes: ["indexchill"],
  },
};

// Fuzzy matching for common typos
export function findTickerSuggestion(input: string): string | null {
  const normalized = input.toUpperCase().trim();

  const commonTypos: Record<string, string> = {
    APPEL: "AAPL",
    APPLE: "AAPL",
    TESLA: "TSLA",
    TESLS: "TSLA",
    AMAZN: "AMZN",
    AMAZON: "AMZN",
    GOOGLE: "GOOGL",
    META: "META",
    FACEBOOK: "META",
    MSFT: "MSFT",
    MICROSOFT: "MSFT",
  };

  return commonTypos[normalized] || null;
}
