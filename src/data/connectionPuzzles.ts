export interface ConnectionPuzzle {
  themeId: string;
  nodes: { id: string; label: string; x: number; y: number }[];
  correctConnections: [string, string][];
  insights: Record<string, string>;
  revealText: string;
  themeTitle: string;
}

export const connectionPuzzles: ConnectionPuzzle[] = [
  {
    themeId: 'nuclear',
    themeTitle: 'Nuclear Renaissance',
    nodes: [
      { id: 'microsoft-azure', label: 'Microsoft Azure', x: 20, y: 25 },
      { id: 'three-mile-island', label: 'Three Mile Island', x: 70, y: 20 },
      { id: 'ai-compute-demand', label: 'AI Compute Demand', x: 25, y: 70 },
      { id: 'clean-energy', label: 'Clean Energy Mandates', x: 75, y: 75 },
    ],
    correctConnections: [
      ['microsoft-azure', 'three-mile-island'],
      ['three-mile-island', 'microsoft-azure'],
    ],
    insights: {
      'microsoft-azure|three-mile-island': 'Microsoft is restarting Three Mile Island to power Azure data centers. AI compute demand requires 24/7 baseload power that only nuclear provides.',
      'three-mile-island|microsoft-azure': 'Microsoft is restarting Three Mile Island to power Azure data centers. AI compute demand requires 24/7 baseload power that only nuclear provides.',
      'microsoft-azure|ai-compute-demand': 'Close! AI compute does drive Microsoft\'s energy needs, but there\'s a more specific connection here.',
      'ai-compute-demand|microsoft-azure': 'Close! AI compute does drive Microsoft\'s energy needs, but there\'s a more specific connection here.',
      'ai-compute-demand|clean-energy': 'Both are important trends, but look for the deal that made headlines.',
      'clean-energy|ai-compute-demand': 'Both are important trends, but look for the deal that made headlines.',
    },
    revealText: 'You found the signal. This is the Nuclear Renaissance thesis.',
  },
  {
    themeId: 'streaming',
    themeTitle: 'Streaming Wars Winners',
    nodes: [
      { id: 'netflix-ads', label: 'Netflix Ad Tier', x: 25, y: 20 },
      { id: 'password-crackdown', label: 'Password Crackdown', x: 75, y: 25 },
      { id: '13m-subscribers', label: '13M New Subscribers', x: 20, y: 75 },
      { id: 'live-sports', label: 'Live Sports Deals', x: 70, y: 70 },
    ],
    correctConnections: [
      ['password-crackdown', '13m-subscribers'],
      ['13m-subscribers', 'password-crackdown'],
    ],
    insights: {
      'password-crackdown|13m-subscribers': 'Netflix\'s password sharing crackdown added 13M subscribers in a single quarter. The streaming wars are consolidating to winners.',
      '13m-subscribers|password-crackdown': 'Netflix\'s password sharing crackdown added 13M subscribers in a single quarter. The streaming wars are consolidating to winners.',
      'netflix-ads|live-sports': 'Both are growth drivers, but there\'s a more direct cause-and-effect connection here.',
      'live-sports|netflix-ads': 'Both are growth drivers, but there\'s a more direct cause-and-effect connection here.',
    },
    revealText: 'You found the signal. This is the Streaming Wars Winners thesis.',
  },
  {
    themeId: 'defense',
    themeTitle: 'Defense & Aerospace',
    nodes: [
      { id: 'nato-spending', label: 'NATO 2% Targets', x: 25, y: 25 },
      { id: 'ukraine-war', label: 'Ukraine Year 3', x: 75, y: 20 },
      { id: 'defense-backlogs', label: '2030+ Backlogs', x: 20, y: 70 },
      { id: 'peace-dividend', label: 'Peace Dividend Over', x: 75, y: 75 },
    ],
    correctConnections: [
      ['nato-spending', 'defense-backlogs'],
      ['defense-backlogs', 'nato-spending'],
      ['ukraine-war', 'peace-dividend'],
      ['peace-dividend', 'ukraine-war'],
    ],
    insights: {
      'nato-spending|defense-backlogs': 'NATO members racing to hit 2% GDP defense targets created backlogs stretched to 2030+. These are structural multi-year revenue streams.',
      'defense-backlogs|nato-spending': 'NATO members racing to hit 2% GDP defense targets created backlogs stretched to 2030+. These are structural multi-year revenue streams.',
      'ukraine-war|peace-dividend': 'The peace dividend is officially over. Ukraine entering year 3 has forced a permanent reversal in Western defense spending.',
      'peace-dividend|ukraine-war': 'The peace dividend is officially over. Ukraine entering year 3 has forced a permanent reversal in Western defense spending.',
    },
    revealText: 'You found the signal. This is the Defense & Aerospace thesis.',
  },
];

export function getPuzzleForTheme(themeId: string): ConnectionPuzzle | undefined {
  return connectionPuzzles.find(p => p.themeId === themeId);
}
