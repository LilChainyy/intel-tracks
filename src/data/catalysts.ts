import { Catalyst } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

// Fallback hardcoded catalysts (used if database is empty or fails)
export const fallbackCatalysts: Catalyst[] = [
  {
    id: '1',
    title: 'Constellation Energy Nuclear Deal',
    description: 'New agreement with Microsoft to restart Three Mile Island reactor for AI datacenter power. Major validation of nuclear as the energy solution for AI.',
    category: 'Partnership',
    time: '2 hours ago',
    icon: '',
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
    icon: '',
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
    icon: '',
    companies: ['NFLX', 'DIS', 'WBD'],
    themeId: 'netflix',
    impact: 'High',
  },
  {
    id: '4',
    title: 'NATO Defense Budget Increase',
    description: 'NATO members commit to 2.5% GDP defense spending target. Order backlogs at major contractors expected to extend further.',
    category: 'Economic',
    time: '1 day ago',
    icon: '',
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
    icon: '',
    companies: ['COST', 'WMT'],
    themeId: 'barbell',
    impact: 'High',
  },
  {
    id: '6',
    title: 'Pet Insurance Adoption Surge',
    description: 'US pet insurance penetration doubles to 8% as millennials prioritize pet healthcare spending.',
    category: 'Economic',
    time: '2 days ago',
    icon: '',
    companies: ['CHWY', 'IDXX', 'ZTS', 'TRUP'],
    themeId: 'pets',
    impact: 'High',
  },
];

// Fetch catalysts from database with fallback to hardcoded data
export async function getCatalysts(): Promise<Catalyst[]> {
  try {
    const { data, error } = await supabase
      .from('catalysts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Error fetching catalysts from database, using fallback:', error);
      return fallbackCatalysts;
    }

    if (data && data.length > 0) {
      // Transform database format to Catalyst format and filter to only "High" impact
      return data
        .map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category as Catalyst['category'],
          time: row.time,
          icon: row.icon,
          companies: row.companies || [],
          themeId: row.theme_id || '',
          impact: row.impact as Catalyst['impact'],
        }))
        .filter(catalyst => catalyst.impact === 'High'); // Only show High impact
    }

    // Database is empty, use fallback (already filtered to High only)
    return fallbackCatalysts.filter(c => c.impact === 'High');
  } catch (error) {
    console.warn('Error fetching catalysts, using fallback:', error);
    return fallbackCatalysts;
  }
}

// For backward compatibility - returns fallback catalysts synchronously (filtered to High only)
export const catalysts = fallbackCatalysts.filter(c => c.impact === 'High');

export function getCatalystsByCategory(category: string, catalystsList: Catalyst[] = fallbackCatalysts): Catalyst[] {
  if (category === 'All') return catalystsList;
  return catalystsList.filter(c => c.category === category);
}

export function getCatalystById(id: string, catalystsList: Catalyst[] = fallbackCatalysts): Catalyst | undefined {
  return catalystsList.find(c => c.id === id);
}

export function getCatalystsForCompany(ticker: string, catalystsList: Catalyst[] = fallbackCatalysts): Catalyst[] {
  return catalystsList.filter(c => c.companies.includes(ticker));
}
