// Risk factors for each theme - used in VulnerabilityCheck
export const themeRiskFactors: Record<string, string[]> = {
  nuclear: [
    'Fed raises rates unexpectedly → Energy sector sells off',
    'SMR project delays → Nuclear sentiment drops',
    'Natural gas prices crash → Competing energy wins',
  ],
  netflix: [
    'Streaming competition intensifies → Pricing pressure returns',
    'Ad market weakens → Revenue growth stalls',
    'Content costs spike → Margin compression',
  ],
  defense: [
    'Ukraine ceasefire → Defense urgency fades',
    'Budget sequestration → Defense cuts return',
    'Supply chain issues → Contract delays mount',
  ],
  space: [
    'Launch failure → Sector sentiment crashes',
    'Funding drought → Capital dries up for space startups',
    'Regulatory delays → FAA slows launch cadence',
  ],
  pets: [
    'Consumer spending weakens → Pet premiumization slows',
    'Vet cost inflation → Insurance claims spike',
    'Competition intensifies → Chewy margins compress',
  ],
  barbell: [
    'Middle class recovery → Mid-tier retail rebounds',
    'Value fatigue → Costco membership churn rises',
    'Luxury pullback → Aspirational spending drops',
  ],
  longevity: [
    'GLP-1 safety concerns → Drug stocks sell off',
    'Clinical trial failures → Biotech sentiment crashes',
    'Regulatory scrutiny → FDA slows approvals',
  ],
  fintech: [
    'Crypto winter deepens → Fintech valuations reset',
    'Bank competition → Legacy players fight back',
    'Regulation tightens → Compliance costs spike',
  ],
  quantum: [
    'Decoherence problems persist → Timeline extends',
    'Funding fatigue → Investment slows',
    'Competition from classical AI → Quantum loses urgency',
  ],
  obesity: [
    'Supply shortages persist → Patient access limited',
    'Side effects emerge → Safety concerns grow',
    'Competition launches → Market share fragments',
  ],
};

export function getRiskFactors(themeId: string): string[] {
  return themeRiskFactors[themeId] || [];
}
