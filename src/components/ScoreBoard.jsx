import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';

const ScoreBoard = ({ players, matches, onScoreUpdate }) => {
  // Helper function to create zero scores
  const createZeroScores = () => {
    return players.reduce((acc, player) => {
      acc[player] = { wins: 0, losses: 0 };
      return acc;
    }, {});
  };

  // Always start from 0, not from match history
  const [liveScores, setLiveScores] = useState(createZeroScores);

  // Auto-reset to 0 when a new match is submitted (matches.length changes)
  useEffect(() => {
    setLiveScores(createZeroScores());
  }, [matches.length]);

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

  // Manual reset to 0
  const resetScores = () => {
    setLiveScores(createZeroScores());
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Live Score</h3>
        <button
          onClick={resetScores}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-lg text-sm text-[var(--color-text-dim)] hover:text-white transition-all min-h-[44px]"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
      
      {players.length === 0 ? (
          <div className="py-10 text-center border-t border-b border-[var(--color-border)] border-dashed bg-white/5 rounded-xl">
              <p className="text-[var(--color-text-dim)] mb-2">No active players found.</p>
              <p className="text-xs text-[var(--color-text-dim)] opacity-50">Add players in Settings to start scoring.</p>
          </div>
      ) : (
          <div className="flex justify-center gap-4 py-6 overflow-x-auto pb-4 custom-scrollbar">
            {players.map((player) => (
              <div key={player} className="flex flex-col items-center flex-shrink-0 group">
                {/* Player Name */}
                <div className="mb-3 font-display text-lg font-bold tracking-wider text-[var(--color-primary)] uppercase drop-shadow-[0_0_5px_rgba(0,240,255,0.5)] group-hover:scale-105 transition-transform">
                  {player}
                </div>

                {/* Score Flip Card */}
                <div className="relative bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-border)] shadow-xl w-36 hover:border-[var(--color-primary)]/30 transition-colors">
                  {/* Ring Binder Holes */}
                  <div className="absolute -top-3 left-0 w-full flex justify-around px-4 z-10">
                    <div className="w-1.5 h-6 bg-gray-600/50 rounded-full border border-gray-700 shadow-lg backdrop-blur-sm"></div>
                    <div className="w-1.5 h-6 bg-gray-600/50 rounded-full border border-gray-700 shadow-lg backdrop-blur-sm"></div>
                  </div>

                  <div className="flex gap-2">
                    {/* Win Card */}
                    <div className="flex-1 flex flex-col items-center bg-black/40 rounded-lg overflow-hidden relative h-28 border border-white/5 hover:bg-black/60 transition-colors">
                      <div className="w-full h-1/2 bg-[var(--color-accent)]/10 border-b border-black/40 z-0 absolute top-0"></div>
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <motion.span
                          key={`${player}-wins-${liveScores[player]?.wins}`}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-display text-4xl font-bold text-[var(--color-accent)] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                        >
                          {liveScores[player]?.wins || 0}
                        </motion.span>
                      </div>
                      <div className="absolute bottom-1 w-full text-[10px] text-center font-bold uppercase text-[var(--color-accent)]/50 tracking-widest">
                        Win
                      </div>
                    </div>

                    {/* Loss Card */}
                    <div className="flex-1 flex flex-col items-center bg-black/40 rounded-lg overflow-hidden relative h-28 border border-white/5 hover:bg-black/60 transition-colors">
                      <div className="w-full h-1/2 bg-red-500/10 border-b border-black/40 z-0 absolute top-0"></div>
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <motion.span
                          key={`${player}-losses-${liveScores[player]?.losses}`}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="font-display text-4xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        >
                          {liveScores[player]?.losses || 0}
                        </motion.span>
                      </div>
                      <div className="absolute bottom-1 w-full text-[10px] text-center font-bold uppercase text-red-500/50 tracking-widest">
                        Loss
                      </div>
                    </div>
                  </div>

                  {/* Increment Buttons - Mobile Optimized */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => incrementScore(player, 'wins')}
                      className="flex-1 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 active:bg-[var(--color-accent)]/30 border border-[var(--color-accent)]/20 rounded-lg p-3 transition-all group/btn min-h-[44px] flex items-center justify-center"
                    >
                      <Plus size={20} className="text-[var(--color-accent)] group-hover/btn:scale-125 transition-transform" />
                    </button>
                    <button
                      onClick={() => incrementScore(player, 'losses')}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20 rounded-lg p-3 transition-all group/btn min-h-[44px] flex items-center justify-center"
                    >
                      <Plus size={20} className="text-red-400 group-hover/btn:scale-125 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default ScoreBoard;
