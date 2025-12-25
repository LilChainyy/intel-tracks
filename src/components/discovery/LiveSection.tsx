import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LiveEvent {
  id: string;
  event: string;
  impact: string;
}

const liveEvents: LiveEvent[] = [
  {
    id: 'cpi-release',
    event: 'CPI released: 3.2% (above estimate)',
    impact: 'May pressure your Retail Barbell call',
  },
  {
    id: 'fed-waller',
    event: "Fed's Waller speaking at 2pm",
    impact: 'Watch for rate commentary',
  },
  {
    id: 'cost-earnings',
    event: 'COST earnings after close',
    impact: 'Direct test of Retail Barbell thesis',
  },
];

export function LiveSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="px-6 mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Live</h2>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Events list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {liveEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card/50 border border-border/50 rounded-lg px-3 py-2.5"
                >
                  <p className="text-sm text-foreground leading-tight">{event.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.impact}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
