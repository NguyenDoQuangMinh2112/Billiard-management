import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const Leaderboard = ({ stats }) => {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <h3 className="text-xl font-display font-bold mb-6 flex justify-between items-center">
        Leaderboard
        <span className="text-xs font-sans font-normal bg-white/10 px-2 py-1 rounded text-gray-400">All Time</span>
      </h3>
      
      <div className="space-y-4">
        {stats.map((player, index) => (
            <LeaderboardItem key={player.name} player={player} index={index} />
        ))}
      </div>
    </div>
  );
};

const LeaderboardItem = ({ player, index }) => {
    const isFirst = index === 0;
    const winRate = player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0;

    return (
        <motion.div 
            layout
            className={`flex items-center gap-4 p-4 rounded-xl border ${isFirst ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' : 'bg-white/5 border-transparent'}`}
        >
            <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${isFirst ? 'bg-[var(--color-primary)] text-black' : 'bg-white/10 text-gray-400'}`}>
                {index + 1}
            </div>
            
            <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-lg">{player.name}</h4>
                    <span className="text-sm font-mono text-gray-400">{player.matchesPlayed} games</span>
                </div>
                
                {/* Win Rate Bar */}
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${winRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${isFirst ? 'bg-[var(--color-primary)]' : 'bg-gray-500'}`} 
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>{winRate}% Win Rate</span>
                    <span>{player.wins}W - {player.losses}L</span>
                </div>
            </div>
        </motion.div>
    );
};

export default Leaderboard;
