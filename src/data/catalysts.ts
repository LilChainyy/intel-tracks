import { Catalyst } from '@/context/AppContext';

export const catalysts: Catalyst[] = [
  {
    id: '1',
    title: 'Constellation Energy Nuclear Deal',
    description: 'New agreement with Microsoft to restart Three Mile Island reactor for AI datacenter power. Major validation of nuclear as the energy solution for AI.',
    category: 'Partnership',
    time: '2 hours ago',
    icon: '⚡',
    companies: ['CEG', 'CCJ', 'VST'],
    themeId: 'nuclear',
    impact: 'High',
  },
  {
    id: '2',
    title: 'Rocket Lab Booster Recovery Success',
    description: 'Successfully caught Electron booster mid-air, marking major milestone toward reusability. Launch costs expected to drop significantly.',
    category: 'Production',
    time: '4 hours ago',
    icon: '🚀',
    companies: ['RKLB', 'ASTS', 'PL'],
    themeId: 'space',
    impact: 'High',
  },
  {
    id: '3',
    title: 'Netflix Ad Tier Hits 50M Users',
    description: 'Ad-supported tier reaches 50 million subscribers globally, exceeding analyst expectations. Ad revenue now meaningful contributor.',
    category: 'Earnings',
    time: '6 hours ago',
    icon: '📺',
    companies: ['NFLX', 'DIS', 'WBD'],
    themeId: 'netflix',
    impact: 'Medium',
  },
  {
    id: '4',
    title: 'NATO Defense Budget Increase',
    description: 'NATO members commit to 2.5% GDP defense spending target. Order backlogs at major contractors expected to extend further.',
    category: 'Economic',
    time: '1 day ago',
    icon: '🛡️',
    companies: ['LMT', 'RTX', 'NOC', 'GD'],
    themeId: 'defense',
    impact: 'High',
  },
  {
    id: '5',
    title: 'Costco Membership Fee Hike',
    description: 'First membership fee increase in 7 years. Analysts see this as validation of pricing power and member loyalty.',
    category: 'Earnings',
    time: 'Yesterday',
    icon: '🛒',
    companies: ['COST', 'WMT'],
    themeId: 'barbell',
    impact: 'Medium',
  },
  {
    id: '6',
    title: 'Pet Insurance Adoption Surge',
    description: 'US pet insurance penetration doubles to 8% as millennials prioritize pet healthcare spending.',
    category: 'Economic',
    time: '2 days ago',
    icon: '🐕',
    companies: ['CHWY', 'IDXX', 'ZTS', 'TRUP'],
    themeId: 'pets',
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
