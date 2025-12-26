import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionPuzzle } from '@/data/connectionPuzzles';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { playlists } from '@/data/playlists';

interface ConnectionCanvasProps {
  puzzle: ConnectionPuzzle;
  onComplete?: () => void;
}

export function ConnectionCanvas({ puzzle, onComplete }: ConnectionCanvasProps) {
  const { setCurrentScreen, setSelectedPlaylist } = useApp();
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [connections, setConnections] = useState<[string, string][]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleNodeTap = useCallback((nodeId: string) => {
    if (isComplete) return;

    if (selectedNodes.length === 0) {
      setSelectedNodes([nodeId]);
      setFeedbackMessage(null);
    } else if (selectedNodes.length === 1) {
      if (selectedNodes[0] === nodeId) {
        setSelectedNodes([]);
        return;
      }

      const connectionKey = `${selectedNodes[0]}|${nodeId}`;
      const reverseKey = `${nodeId}|${selectedNodes[0]}`;
      
      // Check if this is a correct connection
      const isCorrectConnection = puzzle.correctConnections.some(
        ([a, b]) => (a === selectedNodes[0] && b === nodeId) || (a === nodeId && b === selectedNodes[0])
      );

      // Add to connections for visual line
      setConnections(prev => [...prev, [selectedNodes[0], nodeId]]);

      if (isCorrectConnection) {
        const insight = puzzle.insights[connectionKey] || puzzle.insights[reverseKey];
        setFeedbackMessage(insight || 'Correct connection!');
        setIsCorrect(true);
        
        // Short delay before showing completion
        setTimeout(() => {
          setIsComplete(true);
        }, 2000);
      } else {
        const hint = puzzle.insights[connectionKey] || puzzle.insights[reverseKey];
        setFeedbackMessage(hint || 'Interesting theory. Try another connection.');
        setIsCorrect(false);
        
        // Remove incorrect connection after feedback
        setTimeout(() => {
          setConnections(prev => prev.slice(0, -1));
        }, 1500);
      }

      setSelectedNodes([]);
    }
  }, [selectedNodes, puzzle, isComplete]);

  const handleSeeThesis = () => {
    const playlist = playlists.find(p => p.id === puzzle.themeId);
    if (playlist) {
      setSelectedPlaylist(playlist);
      setCurrentScreen('playlist');
    }
    onComplete?.();
  };

  const getNodePosition = (node: { x: number; y: number }) => ({
    left: `${node.x}%`,
    top: `${node.y}%`,
  });

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {connections.map(([from, to], index) => {
          const fromNode = puzzle.nodes.find(n => n.id === from);
          const toNode = puzzle.nodes.find(n => n.id === to);
          if (!fromNode || !toNode) return null;

          const isCorrectLine = puzzle.correctConnections.some(
            ([a, b]) => (a === from && b === to) || (a === to && b === from)
          );

          return (
            <motion.line
              key={`${from}-${to}-${index}`}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke={isCorrectLine ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
              strokeWidth="2"
              strokeDasharray={isCorrectLine ? "0" : "5,5"}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {puzzle.nodes.map((node) => {
        const isSelected = selectedNodes.includes(node.id);
        const isConnected = connections.flat().includes(node.id);

        return (
          <motion.button
            key={node.id}
            onClick={() => handleNodeTap(node.id)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center p-2 text-center text-xs font-medium transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground ring-4 ring-primary/30'
                : isConnected && isCorrect
                ? 'bg-primary/20 text-primary border-2 border-primary'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
            style={getNodePosition(node)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            disabled={isComplete}
          >
            {node.label}
          </motion.button>
        );
      })}

      {/* Feedback message */}
      <AnimatePresence mode="wait">
        {feedbackMessage && !isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute bottom-0 left-0 right-0 p-4 rounded-xl text-sm text-center ${
              isCorrect 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion state */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl z-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
            >
              <span className="text-3xl">🎯</span>
            </motion.div>
            <p className="text-lg font-semibold text-foreground mb-2 text-center px-4">
              {puzzle.revealText}
            </p>
            <Button onClick={handleSeeThesis} className="mt-4">
              See full thesis
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
