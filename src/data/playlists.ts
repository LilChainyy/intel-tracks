import { Playlist } from "@/types/playlist";

export const playlists: Playlist[] = [
  {
    id: 'nuclear',
    emoji: '⚛️',
    title: 'Nuclear Renaissance',
    heroImage: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&q=80',
    whoBuying: ['Microsoft', 'Google', 'Amazon'],
    proofPoint: 'Uranium ETF +67% YTD',
    whyNow: "Microsoft just paid to restart Three Mile Island. Google signed a 500MW nuclear deal with Kairos Energy. Amazon is buying a nuclear-powered data center. AI datacenters need 24/7 baseload power that solar and wind simply can't deliver. The big tech arms race for energy has begun.",
    tags: ['Energy', 'AI Infrastructure', 'Policy Tailwinds'],
    riskLevel: 'growth',
    sectors: ['energy', 'tech', 'industrial'],
    timeHorizon: 'long',
    stylefit: 'casual',
    stocks: [
      { ticker: 'CCJ', name: 'Cameco Corporation', description: 'World\'s largest publicly traded uranium company', isPrivate: false },
      { ticker: 'VST', name: 'Vistra Corp', description: 'Integrated retail electricity and power generation company', isPrivate: false },
      { ticker: 'CEG', name: 'Constellation Energy', description: 'Nation\'s largest producer of clean energy', isPrivate: false },
      { ticker: 'SMR', name: 'NuScale Power', description: 'Pioneer in small modular reactor technology', isPrivate: false },
      { ticker: 'LEU', name: 'Centrus Energy', description: 'Supplier of enriched uranium fuel for nuclear power plants', isPrivate: false }
    ]
  },
  {
    id: 'netflix',
    emoji: '🍿',
    title: 'Streaming Wars Winners',
    heroImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
    whoBuying: ['Netflix insiders', 'Institutional funds'],
    proofPoint: 'NFLX +75% in 2024',
    whyNow: "Netflix's ad tier hit 40M users faster than expected. Password sharing crackdown added 13M subscribers in one quarter. Live sports (WWE, NFL) is bringing appointment viewing back. Disney+ finally profitable. The streaming bloodbath is over—winners are emerging.",
    tags: ['Media', 'Ad Recovery', 'Live Sports'],
    riskLevel: 'balanced',
    sectors: ['entertainment', 'tech'],
    timeHorizon: 'medium',
    stylefit: 'casual',
    stocks: [
      { ticker: 'NFLX', name: 'Netflix', description: 'Leading streaming entertainment service', isPrivate: false },
      { ticker: 'DIS', name: 'Walt Disney Company', description: 'Entertainment giant with Disney+, Hulu, ESPN+', isPrivate: false },
      { ticker: 'WBD', name: 'Warner Bros. Discovery', description: 'Global media and entertainment company', isPrivate: false },
      { ticker: 'PARA', name: 'Paramount Global', description: 'Media company with Paramount+', isPrivate: false }
    ]
  },
  {
    id: 'defense',
    emoji: '🛡️',
    title: 'Defense & Aerospace',
    heroImage: 'https://images.unsplash.com/photo-1569605803663-e9337d901ff9?w=800&q=80',
    whoBuying: ['NATO countries', 'Japan', 'Taiwan', 'Saudi Arabia'],
    proofPoint: 'Global defense spending $2.4T (record)',
    whyNow: "Ukraine war enters year 3. Taiwan tensions rising. NATO members racing to hit 2% GDP targets. US defense budget $886B for 2024, up 3%. Europe's defense spending highest since Cold War. Backlog at Lockheed, RTX, and Northrop stretched to 2030+.",
    tags: ['Geopolitics', 'Government Contracts', 'Backlog Growth'],
    riskLevel: 'balanced',
    sectors: ['industrial', 'tech'],
    timeHorizon: 'long',
    stylefit: 'passive',
    stocks: [
      { ticker: 'LMT', name: 'Lockheed Martin', description: 'World\'s largest defense contractor', isPrivate: false },
      { ticker: 'RTX', name: 'RTX Corporation', description: 'Aerospace and defense conglomerate', isPrivate: false },
      { ticker: 'NOC', name: 'Northrop Grumman', description: 'Global aerospace and defense technology company', isPrivate: false },
      { ticker: 'GD', name: 'General Dynamics', description: 'Aerospace and defense products manufacturer', isPrivate: false },
      { ticker: 'LHX', name: 'L3Harris Technologies', description: 'Defense technology company', isPrivate: false }
    ]
  },
  {
    id: 'space',
    emoji: '🚀',
    title: 'Space Economy',
    heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    whoBuying: ['NASA', 'SpaceX contracts', 'Starlink competitors'],
    proofPoint: 'Space economy projected $1.8T by 2035',
    whyNow: "SpaceX proved reusable rockets work—launch costs dropped 90%. Starlink has 3M+ subscribers, proving satellite internet demand. NASA's Artemis program is back to the Moon. Private space stations coming as ISS retires 2030.",
    tags: ['Satellite Boom', 'NASA Artemis', 'Launch Cost Collapse'],
    riskLevel: 'yolo',
    sectors: ['space', 'tech', 'industrial'],
    timeHorizon: 'long',
    stylefit: 'active',
    stocks: [
      { ticker: 'RKLB', name: 'Rocket Lab', description: 'End-to-end space company', isPrivate: false },
      { ticker: 'ASTS', name: 'AST SpaceMobile', description: 'Building first space-based cellular broadband network', isPrivate: false },
      { ticker: 'PL', name: 'Planet Labs', description: 'Earth imaging company with 200+ satellites', isPrivate: false },
      { ticker: 'LUNR', name: 'Intuitive Machines', description: 'Lunar services and technology company', isPrivate: false }
    ]
  },
  {
    id: 'pets',
    emoji: '🐕',
    title: 'Pet Economy',
    heroImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    whoBuying: ['Millennials (70% own pets)', 'Private equity'],
    proofPoint: 'US pet spending $147B in 2023',
    whyNow: "Millennials are delaying kids but adopting pets—and spending like parents. Average annual spend per pet up 30% since 2019. Pet insurance penetration only 4% in US vs 25% in UK.",
    tags: ['Humanization Trend', 'Vet Spending', 'Recession Resistant'],
    riskLevel: 'balanced',
    sectors: ['consumer', 'healthcare'],
    timeHorizon: 'medium',
    stylefit: 'casual',
    stocks: [
      { ticker: 'CHWY', name: 'Chewy', description: 'Online pet retailer and pharmacy', isPrivate: false },
      { ticker: 'IDXX', name: 'IDEXX Laboratories', description: 'Veterinary diagnostics and software', isPrivate: false },
      { ticker: 'ZTS', name: 'Zoetis', description: 'World leader in animal health', isPrivate: false },
      { ticker: 'TRUP', name: 'Trupanion', description: 'Medical insurance for pets', isPrivate: false }
    ]
  },
  {
    id: 'barbell',
    emoji: '🏪',
    title: 'Retail Barbell',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    whoBuying: ['Buffett (Costco)', 'Institutional rebalancing'],
    proofPoint: 'Costco +45% YTD, middle retailers struggling',
    whyNow: "Consumer spending is bifurcating. Walmart and Costco winning value-seekers. Luxury brands holding pricing power. The middle is dying—Kohl's, Macy's, Bed Bath collapsed.",
    tags: ['Consumer Bifurcation', 'Value Winners', 'Luxury Resilience'],
    riskLevel: 'safe',
    sectors: ['consumer', 'finance'],
    timeHorizon: 'medium',
    stylefit: 'passive',
    stocks: [
      { ticker: 'COST', name: 'Costco', description: 'Membership warehouse retailer', isPrivate: false },
      { ticker: 'WMT', name: 'Walmart', description: 'World\'s largest retailer', isPrivate: false },
      { ticker: 'DG', name: 'Dollar General', description: 'Discount retailer', isPrivate: false },
      { ticker: 'RH', name: 'RH (Restoration Hardware)', description: 'Luxury home furnishings', isPrivate: false }
    ]
  },
  {
    id: 'longevity',
    emoji: '🧬',
    title: 'Future of Longevity',
    heroImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    whoBuying: ['Jeff Bezos ($3B Altos Labs)', 'Eli Lilly', 'Novo Nordisk'],
    proofPoint: 'GLP-1 market $50B+ by 2030',
    whyNow: "Ozempic and Wegovy aren't just weight loss drugs—they're reducing heart attacks, strokes, and possibly Alzheimer's. Bezos put $3B into Altos Labs for cellular reprogramming. The FDA is starting to recognize aging as a treatable condition.",
    tags: ['GLP-1 Revolution', 'Silver Tsunami', 'Biotech Billions'],
    riskLevel: 'growth',
    sectors: ['healthcare', 'tech'],
    timeHorizon: 'long',
    stylefit: 'active',
    stocks: [
      { ticker: 'LLY', name: 'Eli Lilly', description: 'Pharmaceutical giant with Mounjaro/Zepbound', isPrivate: false },
      { ticker: 'NVO', name: 'Novo Nordisk', description: 'Leader in obesity and diabetes care', isPrivate: false },
      { ticker: 'WELL', name: 'Welltower', description: 'Senior housing and healthcare real estate', isPrivate: false },
      { ticker: 'VTR', name: 'Ventas', description: 'Healthcare real estate investment trust', isPrivate: false },
      { ticker: 'CRSP', name: 'CRISPR Therapeutics', description: 'Gene editing therapies', isPrivate: false }
    ]
  },
  {
    id: 'cashcow',
    emoji: '🐄',
    title: 'Cash Cows',
    heroImage: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80',
    whoBuying: ['Dividend funds', 'Retirees', 'Buffett'],
    proofPoint: '60+ years of consecutive dividend increases',
    whyNow: "When rates were 0%, dividends didn't matter. Now they do. These companies have raised dividends for 60+ years through wars, recessions, and pandemics. In uncertain markets, boring cash compounders outperform.",
    tags: ['Dividend Aristocrats', 'Low Volatility', 'Compounders'],
    riskLevel: 'safe',
    sectors: ['consumer', 'finance', 'healthcare'],
    timeHorizon: 'forever',
    stylefit: 'passive',
    stocks: [
      { ticker: 'JNJ', name: 'Johnson & Johnson', description: 'Diversified healthcare company', isPrivate: false },
      { ticker: 'PG', name: 'Procter & Gamble', description: 'Consumer goods giant', isPrivate: false },
      { ticker: 'KO', name: 'Coca-Cola', description: 'World\'s largest beverage company', isPrivate: false },
      { ticker: 'PEP', name: 'PepsiCo', description: 'Global food and beverage company', isPrivate: false },
      { ticker: 'MCD', name: 'McDonald\'s', description: 'World\'s largest fast-food chain', isPrivate: false }
    ]
  },
  {
    id: 'ipo2026',
    emoji: '🦄',
    title: '2026 IPO Watchlist',
    heroImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
    whoBuying: ['Sequoia', 'a16z', 'Tiger Global', 'SoftBank'],
    proofPoint: 'Combined private valuation $500B+',
    whyNow: "IPO window reopening after 2022-2023 drought. Stripe at $65B valuation. SpaceX at $180B. Databricks at $43B. These companies delayed IPO, grew bigger, and now need liquidity for employees.",
    tags: ['Pre-IPO', 'Venture Darlings', 'High Risk/Reward'],
    riskLevel: 'yolo',
    sectors: ['tech', 'finance'],
    timeHorizon: 'medium',
    stylefit: 'active',
    stocks: [
      { ticker: 'STRIPE', name: 'Stripe', description: 'Payments infrastructure for the internet', isPrivate: true },
      { ticker: 'SPACEX', name: 'SpaceX', description: 'Aerospace manufacturer and space transport company', isPrivate: true },
      { ticker: 'DATAB', name: 'Databricks', description: 'Data and AI company', isPrivate: true },
      { ticker: 'KLARNA', name: 'Klarna', description: 'Buy now pay later fintech', isPrivate: true },
      { ticker: 'SHEIN', name: 'Shein', description: 'Fast fashion e-commerce giant', isPrivate: true }
    ]
  },
  {
    id: 'indexchill',
    emoji: '😴',
    title: 'Index & Chill',
    heroImage: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    whoBuying: ['Bogleheads', 'Target date funds', '401k defaults'],
    proofPoint: 'S&P 500 beat 90% of active managers over 15 years',
    whyNow: "Most stock pickers lose to the index. Even hedge funds. The math is simple: low fees + diversification + time = wealth. If you don't want to pick stocks, don't.",
    tags: ['Passive Investing', 'Low Fees', 'Set & Forget'],
    riskLevel: 'safe',
    sectors: ['tech', 'finance', 'consumer', 'healthcare'],
    timeHorizon: 'forever',
    stylefit: 'passive',
    stocks: [
      { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', description: 'Tracks the S&P 500 index', isPrivate: false },
      { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', description: 'Total US stock market exposure', isPrivate: false },
      { ticker: 'QQQ', name: 'Invesco QQQ Trust', description: 'Tracks the Nasdaq-100 index', isPrivate: false },
      { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', description: 'High dividend yield stocks', isPrivate: false }
    ]
  }
];
