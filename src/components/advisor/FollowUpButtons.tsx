// Follow-up action buttons for advisor chat

export interface FollowUpAction {
  type: 'news' | 'compare' | 'theme' | 'learn' | 'browse_themes' | 'search' | 'popular' | 'company';
  ticker?: string;
  theme?: string;
  topic?: string;
}

export interface FollowUpOption {
  label: string;
  action: FollowUpAction;
}

interface FollowUpButtonsProps {
  options: FollowUpOption[];
  onSelect: (action: FollowUpAction) => void;
  disabled?: boolean;
}

export function FollowUpButtons({ options, onSelect, disabled }: FollowUpButtonsProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm text-gray-500">What would you like to explore next?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.action)}
            disabled={disabled}
            className="px-4 py-3 text-left text-sm border border-gray-200 rounded-lg
                     hover:bg-blue-50 hover:border-blue-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper to generate default follow-ups when backend doesn't provide them
export function getDefaultFollowUps(ticker?: string): FollowUpOption[] {
  if (ticker) {
    return [
      { label: `See ${ticker}'s latest news`, action: { type: 'news', ticker } },
      { label: `Compare ${ticker} to peers`, action: { type: 'compare', ticker } },
      { label: 'Browse investment themes', action: { type: 'browse_themes' } },
      { label: 'Learn investing basics', action: { type: 'learn', topic: 'basics' } },
    ];
  }

  return [
    { label: 'Browse investment themes', action: { type: 'browse_themes' } },
    { label: 'Search for a company', action: { type: 'search' } },
    { label: 'Learn about stocks', action: { type: 'learn', topic: 'stocks_101' } },
    { label: 'Popular stocks right now', action: { type: 'popular' } },
  ];
}
