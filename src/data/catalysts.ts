import { Catalyst } from '@/context/AppContext';

export const catalysts: Catalyst[] = [
  {
    id: '1',
    title: 'Apple Earnings Tomorrow',
    description: 'Expected to beat estimates with strong iPhone sales and services revenue growth. Analysts watching for AI strategy updates.',
    category: 'Earnings',
    time: '2 hours ago',
    icon: '📊',
    companies: ['AAPL'],
    themeId: 'ai-revolution',
    impact: 'High',
  },
  {
    id: '2',
    title: 'Tesla Production Update',
    description: 'Q4 production numbers expected to show record deliveries. Cybertruck ramp and Model Y demand in focus.',
    category: 'Production',
    time: '4 hours ago',
    icon: '🏭',
    companies: ['TSLA'],
    themeId: 'ev-revolution',
    impact: 'Medium',
  },
  {
    id: '3',
    title: 'Fed Rate Decision',
    description: 'Federal Reserve meeting concludes Wednesday. Markets pricing in potential rate cuts for 2025.',
    category: 'Economic',
    time: '1 day ago',
    icon: '🏛️',
    companies: ['NVDA', 'AAPL', 'MSFT', 'GOOGL'],
    themeId: 'ai-revolution',
    impact: 'High',
  },
  {
    id: '4',
    title: 'NVIDIA AI Partnership',
    description: 'New enterprise partnership announced with major cloud providers. Expanding Blackwell chip distribution.',
    category: 'Partnership',
    time: '3 hours ago',
    icon: '🤝',
    companies: ['NVDA'],
    themeId: 'ai-revolution',
    impact: 'Medium',
  },
  {
    id: '5',
    title: 'Constellation Energy Nuclear Deal',
    description: 'New agreement with Microsoft to restart Three Mile Island reactor for AI datacenter power.',
    category: 'Partnership',
    time: 'Yesterday',
    icon: '⚡',
    companies: ['CEG', 'MSFT'],
    themeId: 'nuclear',
    impact: 'High',
  },
  {
    id: '6',
    title: 'Netflix Subscriber Milestone',
    description: 'Ad-supported tier reaches 50 million subscribers globally, exceeding analyst expectations.',
    category: 'Earnings',
    time: '6 hours ago',
    icon: '📺',
    companies: ['NFLX'],
    themeId: 'netflix',
    impact: 'Medium',
  },
];

export function getCatalystsByCategory(category: string): Catalyst[] {
  if (category === 'All') return catalysts;
  return catalysts.filter(c => c.category === category);
}

export function getCatalystById(id: string): Catalyst | undefined {
  return catalysts.find(c => c.id === id);
}

export function getCatalystsForCompany(ticker: string): Catalyst[] {
  return catalysts.filter(c => c.companies.includes(ticker));
}
