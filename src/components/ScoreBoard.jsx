import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';

const ScoreBoard = ({ players, matches, onScoreUpdate }) => {
  // Initialize live scores from match history
  const initialScores = players.reduce((acc, player) => {
    acc[player] = { wins: 0, losses: 0 };
    return acc;
  }, {});

  matches.forEach(match => {
    if (initialScores[match.winner]) initialScores[match.winner].wins += 1;
    if (initialScores[match.loser]) initialScores[match.loser].losses += 1;
  });

  const [liveScores, setLiveScores] = useState(initialScores);

  // Notify parent component of score updates
  useEffect(() => {
    if (onScoreUpdate) {
      onScoreUpdate(liveScores);
    }
  }, [liveScores, onScoreUpdate]);

  const incrementScore = (player, type) => {
    setLiveScores(prev => ({
      ...prev,
      [player]: {
        ...prev[player],
        [type]: prev[player][type] + 1
      }
    }));
  };

  const resetScores = () => {
    setLiveScores(initialScores);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Score</h3>
        <button
          onClick={resetScores}
          className="flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
      
      <div className="flex justify-center gap-6 py-6 overflow-x-auto">
        {players.map((player) => (
          <div key={player} className="flex flex-col items-center">
            {/* Player Name */}
            <div className="mb-3 font-display text-xl font-bold tracking-wider text-[var(--color-primary)] uppercase drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
              {player}
            </div>

            {/* Score Flip Card */}
            <div className="relative bg-[#1e1e24] p-1 rounded-lg border-2 border-white/10 shadow-xl">
              {/* Ring Binder Holes */}
              <div className="absolute -top-3 left-0 w-full flex justify-around px-2 z-10">
                <div className="w-2 h-4 bg-gray-600 rounded-full border border-gray-800 shadow-md"></div>
                <div className="w-2 h-4 bg-gray-600 rounded-full border border-gray-800 shadow-md"></div>
              </div>

              <div className="flex gap-1">
                {/* Win Card */}
                <div className="flex flex-col items-center bg-[#252530] rounded overflow-hidden shadow-inner w-16 h-24 relative">
                  <div className="w-full h-1/2 bg-[var(--color-accent)]/80 border-b border-black/20 z-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center z-10 pt-2">
                    <motion.span
                      key={`${player}-wins-${liveScores[player]?.wins}`}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display text-4xl font-bold text-white drop-shadow-md"
                    >
                      {liveScores[player]?.wins || 0}
                    </motion.span>
                  </div>
                  <div className="absolute bottom-0 w-full text-[8px] text-center bg-black/20 font-bold uppercase py-0.5 text-white/50">
                    W
                  </div>
                </div>

                {/* Loss Card */}
                <div className="flex flex-col items-center bg-[#252530] rounded overflow-hidden shadow-inner w-16 h-24 relative">
                  <div className="w-full h-1/2 bg-red-500/80 border-b border-black/20 z-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center z-10 pt-2">
                    <motion.span
                      key={`${player}-losses-${liveScores[player]?.losses}`}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display text-4xl font-bold text-white drop-shadow-md"
                    >
                      {liveScores[player]?.losses || 0}
                    </motion.span>
                  </div>
                  <div className="absolute bottom-0 w-full text-[8px] text-center bg-black/20 font-bold uppercase py-0.5 text-white/50">
                    L
                  </div>
                </div>
              </div>

              {/* Increment Buttons */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => incrementScore(player, 'wins')}
                  className="flex-1 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 border border-[var(--color-accent)]/30 rounded p-1 transition-colors group"
                >
                  <Plus size={14} className="mx-auto text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => incrementScore(player, 'losses')}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded p-1 transition-colors group"
                >
                  <Plus size={14} className="mx-auto text-red-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
