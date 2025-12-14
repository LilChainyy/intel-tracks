interface ThemeIllustrationProps {
  themeId: string;
  className?: string;
}

export function ThemeIllustration({ themeId, className = "" }: ThemeIllustrationProps) {
  const illustrations: Record<string, JSX.Element> = {
    nuclear: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Nucleus */}
        <circle cx="50" cy="50" r="4" fill="currentColor" />
        {/* Electron orbits */}
        <ellipse cx="50" cy="50" rx="35" ry="12" />
        <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(120 50 50)" />
        {/* Electrons */}
        <circle cx="85" cy="50" r="3" fill="currentColor" />
        <circle cx="32" cy="30" r="3" fill="currentColor" />
        <circle cx="32" cy="70" r="3" fill="currentColor" />
      </svg>
    ),
    netflix: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* TV outline */}
        <rect x="15" y="20" width="70" height="50" rx="3" />
        {/* Play button */}
        <polygon points="40,35 40,55 60,45" fill="currentColor" stroke="none" />
        {/* Stand */}
        <line x1="35" y1="70" x2="35" y2="80" />
        <line x1="65" y1="70" x2="65" y2="80" />
        <line x1="30" y1="80" x2="70" y2="80" />
      </svg>
    ),
    defense: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Shield shape */}
        <path d="M50 10 L85 25 L85 55 Q85 80 50 95 Q15 80 15 55 L15 25 Z" />
        {/* Star in center */}
        <polygon points="50,30 54,42 67,42 57,50 61,63 50,55 39,63 43,50 33,42 46,42" fill="currentColor" stroke="none" />
      </svg>
    ),
    space: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Rocket body */}
        <path d="M50 10 Q65 30 65 60 L55 70 L55 85 L50 90 L45 85 L45 70 L35 60 Q35 30 50 10" />
        {/* Window */}
        <circle cx="50" cy="40" r="6" />
        {/* Flames */}
        <path d="M45 85 Q50 100 55 85" strokeWidth="1" />
      </svg>
    ),
    pets: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Dog face outline */}
        <circle cx="50" cy="50" r="30" />
        {/* Ears */}
        <ellipse cx="25" cy="30" rx="10" ry="15" />
        <ellipse cx="75" cy="30" rx="10" ry="15" />
        {/* Eyes */}
        <circle cx="40" cy="45" r="4" fill="currentColor" />
        <circle cx="60" cy="45" r="4" fill="currentColor" />
        {/* Nose */}
        <ellipse cx="50" cy="58" rx="6" ry="4" fill="currentColor" />
        {/* Mouth */}
        <path d="M50 62 Q50 70 45 68 M50 62 Q50 70 55 68" />
      </svg>
    ),
    barbell: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Shopping bag */}
        <rect x="25" y="35" width="50" height="55" rx="2" />
        {/* Handles */}
        <path d="M35 35 Q35 20 50 20 Q65 20 65 35" fill="none" />
        {/* Dollar sign */}
        <text x="50" y="70" textAnchor="middle" fontSize="24" fill="currentColor" stroke="none">$</text>
      </svg>
    ),
    longevity: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* DNA double helix simplified */}
        <path d="M35 10 Q50 25 65 25 Q50 40 35 40 Q50 55 65 55 Q50 70 35 70 Q50 85 65 90" />
        <path d="M65 10 Q50 25 35 25 Q50 40 65 40 Q50 55 35 55 Q50 70 65 70 Q50 85 35 90" />
        {/* Connection lines */}
        <line x1="40" y1="25" x2="60" y2="25" />
        <line x1="40" y1="55" x2="60" y2="55" />
      </svg>
    ),
    cashcow: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Cow face */}
        <ellipse cx="50" cy="55" rx="30" ry="25" />
        {/* Ears */}
        <ellipse cx="22" cy="40" rx="8" ry="12" />
        <ellipse cx="78" cy="40" rx="8" ry="12" />
        {/* Horns */}
        <path d="M30 30 Q25 15 35 20" />
        <path d="M70 30 Q75 15 65 20" />
        {/* Eyes */}
        <circle cx="40" cy="50" r="4" fill="currentColor" />
        <circle cx="60" cy="50" r="4" fill="currentColor" />
        {/* Nose/muzzle */}
        <ellipse cx="50" cy="68" rx="12" ry="8" />
        <circle cx="45" cy="68" r="2" fill="currentColor" />
        <circle cx="55" cy="68" r="2" fill="currentColor" />
      </svg>
    ),
    ipo2026: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Unicorn silhouette */}
        <path d="M70 70 Q80 50 75 35 L85 15 L75 30 Q70 20 60 25 Q40 20 30 40 Q20 50 25 65 L20 80 L30 70 L35 85 L40 70 L55 85 L55 70 Q65 75 70 70" />
        {/* Eye */}
        <circle cx="55" cy="35" r="2" fill="currentColor" />
        {/* Mane lines */}
        <path d="M60 28 Q55 20 50 25" />
        <path d="M55 30 Q48 22 45 28" />
      </svg>
    ),
    indexchill: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        {/* Hammock/relaxed person */}
        <path d="M15 60 Q50 90 85 60" />
        {/* Trees/posts */}
        <line x1="15" y1="30" x2="15" y2="75" />
        <line x1="85" y1="30" x2="85" y2="75" />
        {/* Person shape in hammock */}
        <circle cx="45" cy="55" r="6" />
        {/* body curve */}
        <path d="M50 58 Q60 65 70 60" />
        {/* Sun */}
        <circle cx="75" cy="25" r="8" />
        <line x1="75" y1="12" x2="75" y2="8" />
        <line x1="75" y1="42" x2="75" y2="38" />
        <line x1="62" y1="25" x2="58" y2="25" />
        <line x1="88" y1="25" x2="92" y2="25" />
      </svg>
    ),
  };

  return illustrations[themeId] || illustrations.nuclear;
}
