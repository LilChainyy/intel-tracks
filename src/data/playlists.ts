import { Playlist } from "@/types/playlist";

// Cache for stock YTD data
interface StockYTDData {
  ytdReturn: number;
  lastUpdated: string;
}

const ytdCache: Record<string, StockYTDData> = {};

// Check if cache is still valid (same day)
function isCacheValid(lastUpdated: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return lastUpdated === today;
}

// Fetch YTD data for a single stock
export async function fetchStockYTD(ticker: string): Promise<number | null> {
  // Skip private companies
  if (ticker === "STRIPE" || ticker === "SPACEX" || ticker === "DATAB" || ticker === "KLARNA" || ticker === "SHEIN") {
    return null;
  }

  // Check cache first
  if (ytdCache[ticker] && isCacheValid(ytdCache[ticker].lastUpdated)) {
    return ytdCache[ticker].ytdReturn;
  }

  try {
    // Replace with your actual API endpoint
    const response = await fetch(`https://your-api.com/stock/${ticker}/ytd`);

    if (!response.ok) {
      throw new Error(`Failed to fetch YTD for ${ticker}`);
    }

    const data = await response.json();
    const ytdReturn = data.ytdReturn;

    // Update cache
    ytdCache[ticker] = {
      ytdReturn,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    return ytdReturn;
  } catch (error) {
    console.error(`Error fetching YTD for ${ticker}:`, error);
    return null;
  }
}

// Fetch YTD data for all stocks in a playlist
export async function fetchPlaylistYTDData(playlist: Playlist): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {};

  const promises = playlist.stocks
    .filter((stock) => !stock.isPrivate)
    .map(async (stock) => {
      const ytd = await fetchStockYTD(stock.ticker);
      results[stock.ticker] = ytd;
    });

  await Promise.all(promises);
  return results;
}

// Fetch YTD data for all playlists
export async function fetchAllYTDData(): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {};
  const allTickers = new Set<string>();

  // Collect unique tickers
  playlists.forEach((playlist) => {
    playlist.stocks.forEach((stock) => {
      if (!stock.isPrivate) {
        allTickers.add(stock.ticker);
      }
    });
  });

  // Fetch all
  const promises = Array.from(allTickers).map(async (ticker) => {
    const ytd = await fetchStockYTD(ticker);
    results[ticker] = ytd;
  });

  await Promise.all(promises);
  return results;
}

export const playlists: Playlist[] = [
  {
    id: "nuclear",
    title: "Nuclear Renaissance",
    heroImage: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80",
    investors: ["Microsoft", "Google", "Amazon"],
    companies: ["Cameco", "Constellation Energy", "Vistra", "NuScale"],
    signal: `Microsoft is restarting Three Mile Island. Google signed a 500MW deal with Kairos Energy. Amazon is acquiring nuclear-powered data centers. When the three biggest tech companies race to lock up energy supply, pay attention.`,
    thesis: `AI datacenters require 24/7 baseload power that runs regardless of weather or time of day. Solar and wind can't deliver this consistency. Nuclear is the only carbon-free source that operates around the clock at scale. As AI compute demand doubles roughly every six months, the energy bottleneck becomes critical—and nuclear is the logical solution.`,
    fullAnalysis: `The Energy Problem No One's Talking About

Training GPT-4 consumed an estimated 50 GWh of electricity. Running inference at scale requires even more. Microsoft, Google, and Amazon are in an arms race to build AI infrastructure—but they're hitting a wall: power.

Why Nuclear, Why Now

Three structural shifts are converging:
1. AI compute explosion - Demand for datacenter power is doubling every 6-12 months
2. Clean energy mandates - Big tech has net-zero commitments they can't meet with intermittent renewables
3. Policy tailwinds - Bipartisan support for nuclear, NRC streamlining approvals

The Supply Squeeze

Uranium supply has been in deficit for years. Cameco and Kazatomprom control most global production. New mines take 10+ years to develop. Meanwhile, reactor restarts and new builds are accelerating.

The Investment Landscape

There are multiple ways to play this theme:
- Uranium producers: CCJ, UEC, DNN
- Utilities with nuclear fleets: CEG, VST
- SMR developers: SMR, OKLO
- Enrichment: LEU`,
    tags: ["Energy", "AI Infrastructure", "Policy Tailwinds"],
    risk: "growth",
    sectors: ["energy", "tech", "industrial"],
    timeline: "long",
    featuredStock: "CCJ",
    stocks: [
      {
        ticker: "CCJ",
        name: "Cameco Corporation",
        description: "World's largest publicly traded uranium company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/cameco.com",
      },
      {
        ticker: "VST",
        name: "Vistra Corp",
        description: "Integrated retail electricity and power generation company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/vistracorp.com",
      },
      {
        ticker: "CEG",
        name: "Constellation Energy",
        description: "Nation's largest producer of clean energy",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/constellationenergy.com",
      },
      {
        ticker: "SMR",
        name: "NuScale Power",
        description: "Pioneer in small modular reactor technology",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/nuscalepower.com",
      },
      {
        ticker: "LEU",
        name: "Centrus Energy",
        description: "Supplier of enriched uranium fuel for nuclear power plants",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/centrusenergy.com",
      },
    ],
  },
  {
    id: "netflix",
    title: "Streaming Wars Winners",
    heroImage: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80",
    investors: ["Netflix insiders", "Institutional funds", "Cathie Wood"],
    companies: ["Netflix", "Disney", "Warner Bros"],
    signal: `Netflix's ad tier hit 40M users in just 18 months. The password sharing crackdown added 13M subscribers in a single quarter. Disney+ just turned profitable for the first time. The streaming bloodbath is over—survivors are emerging.`,
    thesis: `The streaming wars created unsustainable economics: too many services, too much content spend, not enough subscribers to go around. That consolidation is complete. Winners now have pricing power, ad revenue diversification, and live sports deals that create appointment viewing. The survivors will compound.`,
    fullAnalysis: `The Great Streaming Consolidation

From 2019-2022, every media company launched a streaming service. Most lost billions. Now the market is consolidating to 3-4 winners.

Netflix's Moat Deepens

Netflix has achieved what others couldn't: profitable streaming at scale. Key advantages:
- 260M+ subscribers globally
- Ad tier growing faster than expected
- Password crackdown working
- Live events (WWE, NFL) driving engagement`,
    tags: ["Media", "Ad Recovery", "Live Sports"],
    risk: "balanced",
    sectors: ["entertainment", "tech"],
    timeline: "medium",
    featuredStock: "NFLX",
    stocks: [
      {
        ticker: "NFLX",
        name: "Netflix",
        description: "Leading streaming entertainment service",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/netflix.com",
      },
      {
        ticker: "DIS",
        name: "Walt Disney Company",
        description: "Entertainment giant with Disney+, Hulu, ESPN+",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/disney.com",
      },
      {
        ticker: "WBD",
        name: "Warner Bros. Discovery",
        description: "Global media and entertainment company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/wbd.com",
      },
      {
        ticker: "PARA",
        name: "Paramount Global",
        description: "Media company with Paramount+",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/paramount.com",
      },
    ],
  },
  {
    id: "defense",
    title: "Defense & Aerospace",
    heroImage: "https://images.unsplash.com/photo-1569605803663-e9337d901ff9?w=800&q=80",
    investors: ["NATO countries", "Japan", "Taiwan", "Saudi Arabia"],
    companies: ["Lockheed Martin", "RTX", "Northrop Grumman", "General Dynamics"],
    signal: `Ukraine war enters year 3 with no end in sight. Taiwan tensions at multi-decade highs. NATO members racing to hit 2% GDP defense targets. US defense budget hit $886B for 2024. Europe's defense spending is at its highest since the Cold War.`,
    thesis: `The peace dividend is over. After 30 years of declining defense budgets in the West, geopolitical reality has forced a reversal. Backlogs at major defense contractors are stretched to 2030+. These aren't cyclical—they're structural multi-year revenue streams with government-backed contracts.`,
    fullAnalysis: `The New Geopolitical Reality

The post-Cold War era of declining defense spending is definitively over. Three theaters are driving sustained demand:

1. Europe: NATO members are doubling defense budgets
2. Indo-Pacific: Taiwan, Japan, Australia, South Korea all increasing spend
3. Middle East: Gulf states modernizing militaries`,
    tags: ["Geopolitics", "Government Contracts", "Backlog Growth"],
    risk: "balanced",
    sectors: ["industrial", "tech"],
    timeline: "long",
    featuredStock: "LMT",
    stocks: [
      {
        ticker: "LMT",
        name: "Lockheed Martin",
        description: "World's largest defense contractor",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/lockheedmartin.com",
      },
      {
        ticker: "RTX",
        name: "RTX Corporation",
        description: "Aerospace and defense conglomerate",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/rtx.com",
      },
      {
        ticker: "NOC",
        name: "Northrop Grumman",
        description: "Global aerospace and defense technology company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/northropgrumman.com",
      },
      {
        ticker: "GD",
        name: "General Dynamics",
        description: "Aerospace and defense products manufacturer",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/gd.com",
      },
      {
        ticker: "LHX",
        name: "L3Harris Technologies",
        description: "Defense technology company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/l3harris.com",
      },
    ],
  },
  {
    id: "space",
    title: "Space Economy",
    heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    investors: ["NASA", "DoD", "SoftBank", "Founders Fund"],
    companies: ["SpaceX", "Rocket Lab", "Planet Labs", "AST SpaceMobile"],
    signal: `SpaceX just hit 7,000 Starlink satellites in orbit. Rocket Lab successfully caught a booster mid-air. NASA's Artemis program is sending humans back to the Moon. The ISS retires in 2030, creating demand for private space stations.`,
    thesis: `SpaceX proved reusable rockets work—launch costs dropped 90% in a decade. This unlocked an entirely new economics for space. Satellite constellations, space manufacturing, lunar resources, and direct-to-cell connectivity are now viable businesses, not science fiction.`,
    fullAnalysis: `The Launch Cost Revolution

In 2010, launching 1kg to orbit cost ~$50,000. Today with SpaceX it's under $3,000. This 95% cost reduction is the equivalent of the PC revolution for computing—it enables entirely new applications.

Beyond Earth Orbit

The space economy is expanding beyond low-earth orbit satellites.`,
    tags: ["Satellite Boom", "NASA Artemis", "Launch Cost Collapse"],
    risk: "yolo",
    sectors: ["space", "tech", "industrial"],
    timeline: "long",
    featuredStock: "RKLB",
    stocks: [
      {
        ticker: "RKLB",
        name: "Rocket Lab",
        description: "End-to-end space company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/rocketlabusa.com",
      },
      {
        ticker: "ASTS",
        name: "AST SpaceMobile",
        description: "Building first space-based cellular broadband network",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/ast-science.com",
      },
      {
        ticker: "PL",
        name: "Planet Labs",
        description: "Earth imaging company with 200+ satellites",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/planet.com",
      },
      {
        ticker: "LUNR",
        name: "Intuitive Machines",
        description: "Lunar services and technology company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/intuitivemachines.com",
      },
    ],
  },
  {
    id: "pets",
    title: "Pet Economy",
    heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    investors: ["Millennials", "Private equity", "Nestle"],
    companies: ["Chewy", "IDEXX", "Zoetis", "Mars Petcare"],
    signal: `70% of millennials now own pets. Average annual spend per pet is up 30% since 2019. Chewy's autoship revenue hit 78% of total sales. Pet insurance penetration in the US is only 4% vs 25% in the UK.`,
    thesis: `Millennials are delaying children but adopting pets—and spending on them like parents. The "humanization" of pets drives premiumization across food, healthcare, and services. This is a secular trend that's recession-resistant: pet owners cut their own spending before their pets'.`,
    fullAnalysis: `The Humanization Megatrend

Pets have evolved from animals in the backyard to family members who sleep in beds. This emotional bond drives irrational (from an economist's view) spending behavior.

The Numbers Don't Lie

- US pet spending: $147B in 2023
- Average dog owner spends $1,500+/year
- Vet visits up 35% since pre-pandemic`,
    tags: ["Humanization Trend", "Vet Spending", "Recession Resistant"],
    risk: "balanced",
    sectors: ["consumer", "healthcare"],
    timeline: "medium",
    featuredStock: "CHWY",
    stocks: [
      {
        ticker: "CHWY",
        name: "Chewy",
        description: "Online pet retailer and pharmacy",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/chewy.com",
      },
      {
        ticker: "IDXX",
        name: "IDEXX Laboratories",
        description: "Veterinary diagnostics and software",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/idexx.com",
      },
      {
        ticker: "ZTS",
        name: "Zoetis",
        description: "World leader in animal health",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/zoetis.com",
      },
      {
        ticker: "TRUP",
        name: "Trupanion",
        description: "Medical insurance for pets",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/trupanion.com",
      },
    ],
  },
  {
    id: "barbell",
    title: "Retail Barbell",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    investors: ["Warren Buffett", "Institutional funds", "Value investors"],
    companies: ["Costco", "Walmart", "Dollar General", "RH"],
    signal: `Costco stock hit all-time highs with +45% YTD returns. Meanwhile, Kohl's, Macy's, and Bed Bath & Beyond collapsed. Consumer spending is bifurcating: either extreme value or premium luxury.`,
    thesis: `The middle is dying in retail. Consumers either want rock-bottom prices (Costco, Walmart, Dollar stores) or premium experiences worth paying up for (RH, luxury brands). Department stores and mid-tier retailers are being squeezed from both ends.`,
    fullAnalysis: `The Disappearing Middle Class Consumer

Income inequality is reshaping retail. The middle class is shrinking, and with it, the middle-market retailers that served them.

Winners at Both Ends

Value winners: Costco membership model creates loyalty
Luxury winners: RH proving aspirational consumers will pay for quality`,
    tags: ["Consumer Bifurcation", "Value Winners", "Luxury Resilience"],
    risk: "safe",
    sectors: ["consumer", "finance"],
    timeline: "medium",
    featuredStock: "COST",
    stocks: [
      {
        ticker: "COST",
        name: "Costco",
        description: "Membership warehouse retailer",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/costco.com",
      },
      {
        ticker: "WMT",
        name: "Walmart",
        description: "World's largest retailer",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/walmart.com",
      },
      {
        ticker: "DG",
        name: "Dollar General",
        description: "Discount retailer",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/dollargeneral.com",
      },
      {
        ticker: "RH",
        name: "RH (Restoration Hardware)",
        description: "Luxury home furnishings",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/rh.com",
      },
    ],
  },
  {
    id: "longevity",
    title: "Future of Longevity",
    heroImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    investors: ["Jeff Bezos", "Eli Lilly", "Novo Nordisk", "Sam Altman"],
    companies: ["Altos Labs", "Eli Lilly", "Novo Nordisk", "CRISPR Therapeutics"],
    signal: `Bezos invested $3B into Altos Labs for cellular reprogramming. Eli Lilly's market cap passed $750B on GLP-1 drugs. Novo Nordisk became Europe's most valuable company. The FDA is starting to recognize aging as a treatable condition.`,
    thesis: `GLP-1 drugs (Ozempic, Wegovy, Mounjaro) aren't just weight loss medications—clinical trials show they reduce heart attacks, strokes, and potentially Alzheimer's. We're at the beginning of a longevity revolution where aging itself becomes a treatable condition.`,
    fullAnalysis: `The GLP-1 Revolution

GLP-1 drugs started as diabetes medications. Then weight loss. Now cardiovascular benefits. The pipeline keeps expanding.

Beyond Weight Loss

Early data suggests GLP-1s may help with:
- Alzheimer's and cognitive decline
- Addiction (alcohol, smoking)
- Liver disease
- Sleep apnea`,
    tags: ["GLP-1 Revolution", "Silver Tsunami", "Biotech Billions"],
    risk: "growth",
    sectors: ["healthcare", "tech"],
    timeline: "long",
    featuredStock: "LLY",
    stocks: [
      {
        ticker: "LLY",
        name: "Eli Lilly",
        description: "Pharmaceutical giant with Mounjaro/Zepbound",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/lilly.com",
      },
      {
        ticker: "NVO",
        name: "Novo Nordisk",
        description: "Leader in obesity and diabetes care",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/novonordisk.com",
      },
      {
        ticker: "WELL",
        name: "Welltower",
        description: "Senior housing and healthcare real estate",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/welltower.com",
      },
      {
        ticker: "VTR",
        name: "Ventas",
        description: "Healthcare real estate investment trust",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/ventasreit.com",
      },
      {
        ticker: "CRSP",
        name: "CRISPR Therapeutics",
        description: "Gene editing therapies",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/crisprtx.com",
      },
    ],
  },
  {
    id: "cashcow",
    title: "Cash Cows",
    heroImage: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80",
    investors: ["Dividend funds", "Retirees", "Warren Buffett"],
    companies: ["Johnson & Johnson", "Procter & Gamble", "Coca-Cola", "McDonald's"],
    signal: `These five companies have raised dividends for 60+ consecutive years. Through wars, recessions, pandemics, and financial crises. Buffett's largest position is Apple, but his longest-held is Coca-Cola.`,
    thesis: `When interest rates were 0%, dividend stocks were boring. Now they're not. In uncertain markets with elevated rates, boring cash compounders outperform. These companies have moats measured in decades and return capital religiously.`,
    fullAnalysis: `The Power of Compounding Dividends

$10,000 invested in Coca-Cola in 1988 is worth over $500,000 today with dividends reinvested.

Why Boring Wins

- Predictable earnings through any cycle
- Pricing power over decades
- Return of capital discipline
- Low volatility = better risk-adjusted returns`,
    tags: ["Dividend Aristocrats", "Low Volatility", "Compounders"],
    risk: "safe",
    sectors: ["consumer", "finance", "healthcare"],
    timeline: "forever",
    featuredStock: "KO",
    stocks: [
      {
        ticker: "JNJ",
        name: "Johnson & Johnson",
        description: "Diversified healthcare company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/jnj.com",
      },
      {
        ticker: "PG",
        name: "Procter & Gamble",
        description: "Consumer goods giant",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/pg.com",
      },
      {
        ticker: "KO",
        name: "Coca-Cola",
        description: "World's largest beverage company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/coca-cola.com",
      },
      {
        ticker: "PEP",
        name: "PepsiCo",
        description: "Global food and beverage company",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/pepsico.com",
      },
      {
        ticker: "MCD",
        name: "McDonald's",
        description: "World's largest fast-food chain",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/mcdonalds.com",
      },
    ],
  },
  {
    id: "ipo2026",
    title: "2026 IPO Watchlist",
    heroImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    investors: ["Sequoia", "a16z", "Tiger Global", "SoftBank"],
    companies: ["Stripe", "SpaceX", "Databricks", "Klarna"],
    signal: `The IPO window is reopening after a 2-year drought. Stripe at $65B valuation. SpaceX at $180B. Databricks at $43B. These companies delayed going public, grew even bigger, and now need liquidity for employees.`,
    thesis: `The 2022-2023 IPO freeze created a backlog of mature, profitable private companies. They've used the time to cut costs and improve unit economics. When they finally IPO, they'll be more mature than the 2021 vintage—but still offer growth.`,
    fullAnalysis: `The IPO Backlog

Over $1 trillion in private company value is waiting to go public. Unlike 2021, these companies have been forced to demonstrate profitability or a clear path to it.

The Standouts

- Stripe: $1T+ in payment volume, profitable
- SpaceX: Starlink alone could be worth $100B+
- Databricks: The data/AI platform leader`,
    tags: ["Pre-IPO", "Venture Darlings", "High Risk/Reward"],
    risk: "yolo",
    sectors: ["tech", "finance"],
    timeline: "medium",
    featuredStock: "STRIPE",
    stocks: [
      { ticker: "STRIPE", name: "Stripe", description: "Payments infrastructure for the internet", isPrivate: true },
      {
        ticker: "SPACEX",
        name: "SpaceX",
        description: "Aerospace manufacturer and space transport company",
        isPrivate: true,
      },
      { ticker: "DATAB", name: "Databricks", description: "Data and AI company", isPrivate: true },
      { ticker: "KLARNA", name: "Klarna", description: "Buy now pay later fintech", isPrivate: true },
      { ticker: "SHEIN", name: "Shein", description: "Fast fashion e-commerce giant", isPrivate: true },
    ],
  },
  {
    id: "indexchill",
    title: "Index & Chill",
    heroImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
    investors: ["Bogleheads", "Target date funds", "401k defaults"],
    companies: ["Vanguard", "BlackRock", "Schwab", "Fidelity"],
    signal: `S&P 500 beat 90% of active managers over the past 15 years. The data is unambiguous. Even the best hedge funds struggle to consistently outperform a simple index fund after fees.`,
    thesis: `Most stock pickers lose to the index. Even professionals. The math is simple: low fees + diversification + time = wealth. If you don't want to pick stocks, don't. Just buy the market and let compounding do the work.`,
    fullAnalysis: `The Data Is Clear

Over 15 years, 92% of large-cap fund managers underperformed the S&P 500. It's not that they're bad—it's that the market is efficient and fees matter.

The Boglehead Philosophy

Jack Bogle's insight: you can't control returns, but you can control costs. Every dollar in fees is a dollar not compounding.`,
    tags: ["Passive Investing", "Low Fees", "Set & Forget"],
    risk: "safe",
    sectors: ["tech", "finance", "consumer", "healthcare"],
    timeline: "forever",
    featuredStock: "VOO",
    stocks: [
      {
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        description: "Tracks the S&P 500 index",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/vanguard.com",
      },
      {
        ticker: "VTI",
        name: "Vanguard Total Stock Market ETF",
        description: "Total US stock market exposure",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/vanguard.com",
      },
      {
        ticker: "QQQ",
        name: "Invesco QQQ Trust",
        description: "Tracks the Nasdaq-100 index",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/invesco.com",
      },
      {
        ticker: "SCHD",
        name: "Schwab US Dividend Equity ETF",
        description: "High dividend yield stocks",
        isPrivate: false,
        logoUrl: "https://logo.clearbit.com/schwab.com",
      },
    ],
  },
];
