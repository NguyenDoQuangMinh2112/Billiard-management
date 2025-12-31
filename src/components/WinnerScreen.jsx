import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

const WinnerScreen = ({ winner, loser, isOpen, onClose, matchData }) => {
  const [confetti, setConfetti] = useState([]);

  // Generate confetti particles
  useEffect(() => {
    if (isOpen) {
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: ['#00f0ff', '#7000df', '#39ff14', '#ffd700', '#ff6b6b'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(particles);
    }
  }, [isOpen]);

  // Support both old (single winner) and new (multiple winners) formats
  const winners = matchData?.winners || (winner ? [winner] : []);
  const isDraw = winners.length > 1;

  if (!winners || winners.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Winner Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              delay: 0.1 
            }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit p-4 z-[101] pointer-events-none flex items-center justify-center"
          >
            <div className="relative w-full pointer-events-auto">
              {/* Confetti Animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {confetti.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ 
                      x: `${particle.x}%`, 
                      y: `${particle.y}%`,
                      rotate: 0,
                      opacity: 1
                    }}
                    animate={{ 
                      y: '120%',
                      rotate: particle.rotation,
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: "easeIn"
                    }}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{ backgroundColor: particle.color }}
                  />
                ))}
              </div>

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-3xl p-8 shadow-2xl border-2 border-[var(--color-primary)]/30 overflow-hidden">
                {/* Animated Background Glow */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-primary)] blur-[100px] rounded-full"
                />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  <X size={20} />
                </button>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  {/* Trophy Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      damping: 15, 
                      stiffness: 200,
                      delay: 0.3 
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-[var(--color-primary)] blur-xl opacity-50 rounded-full" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy size={48} className="text-white" strokeWidth={2.5} />
                    </div>
                    
                    {/* Floating Stars */}
                    <motion.div
                      animate={{ 
                        y: [-5, 5, -5],
                        rotate: [0, 10, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-2 -right-2"
                    >
                      <Star size={20} className="text-yellow-400 fill-yellow-400" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        y: [5, -5, 5],
                        rotate: [0, -10, 0]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                      className="absolute -bottom-2 -left-2"
                    >
                      <Sparkles size={18} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
                    </motion.div>
                  </motion.div>

                  {/* Winner Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
                      {isDraw ? '🤝 Draw! 🤝' : '🎉 Victory! 🎉'}
                    </h2>
                    <motion.h1
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.6,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="text-5xl font-display font-bold text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                    >
                      {isDraw ? winners.join(' & ') : winners[0]}
                    </motion.h1>
                    <p className="text-lg text-gray-300 font-semibold">
                      {isDraw ? 'Tied for Victory!' : 'Wins the Match!'}
                    </p>
                  </motion.div>

                  {/* Match Results - Winners and Losers */}
                  {matchData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="w-full space-y-3"
                    >
                      {/* Winners Card(s) */}
                      <div className="space-y-2">
                        {isDraw && matchData.winnerScores ? (
                          // Multiple winners - show all
                          matchData.winnerScores.map((winnerData, index) => (
                            <div key={winnerData.name} className="bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-primary)]/20 backdrop-blur-sm rounded-xl p-4 border-2 border-[var(--color-accent)]/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                    <Trophy size={20} className="text-black" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[var(--color-accent)] uppercase font-bold tracking-wider">🏆 Winner {index + 1}</p>
                                    <p className="text-white font-bold text-lg">{winnerData.name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-400">Score</p>
                                  <p className="text-2xl font-bold text-[var(--color-accent)]">
                                    {winnerData.wins}W - {winnerData.losses}L
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Diff: <span className="text-[var(--color-accent)] font-bold">+{winnerData.differential}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Single winner - show old format
                          <div className="bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-primary)]/20 backdrop-blur-sm rounded-xl p-4 border-2 border-[var(--color-accent)]/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                                  <Trophy size={20} className="text-black" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-[var(--color-accent)] uppercase font-bold tracking-wider">🏆 Winner</p>
                                  <p className="text-white font-bold text-lg">{matchData.winner || winners[0]}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">Score</p>
                                <p className="text-2xl font-bold text-[var(--color-accent)]">
                                  {matchData.winnerScore || 0}W - {matchData.winnerLosses || 0}L
                                </p>
                                <p className="text-xs text-gray-400">
                                  Diff: <span className="text-[var(--color-accent)] font-bold">+{matchData.winnerDifferential || 0}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Losers List */}
                      {matchData.losers && matchData.losers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider px-2">Other Players</p>
                          {matchData.losers.map((loser, index) => (
                            <div 
                              key={loser.name}
                              className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">
                                    {winners.length + index + 1}
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold">{loser.name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-mono text-gray-300">
                                    {loser.wins}W - {loser.losses}L
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Diff: <span className={loser.differential >= 0 ? 'text-green-400' : 'text-red-400'}>
                                      {loser.differential >= 0 ? '+' : ''}{loser.differential}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Celebration Message */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center gap-2 text-yellow-400"
                  >
                    <PartyPopper size={20} />
                    <p className="text-sm font-semibold">
                      Congratulations on your victory!
                    </p>
                    <PartyPopper size={20} />
                  </motion.div>

                  {/* Close Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    onClick={onClose}
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-black font-bold rounded-xl shadow-lg hover:shadow-[var(--color-primary)]/50 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Continue
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WinnerScreen;
