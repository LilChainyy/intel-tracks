// Breadcrumb navigation for advisor chat context

import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  path: string[];
  onNavigate: (level: number) => void;
}

export function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  if (!path || path.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {path.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />}
          <button
            onClick={() => onNavigate(index)}
            className="hover:text-blue-600 hover:underline focus:outline-none"
            disabled={index === path.length - 1} // Disable current page
          >
            {item}
          </button>
        </div>
      ))}
    </nav>
  );
}
