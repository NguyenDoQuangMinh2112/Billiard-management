import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Award, DollarSign, TrendingUp, Crown, Star, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaderboardView = () => {
    const { allStats } = useGame();
    const [sortKey, setSortKey] = useState('wins');

    // Stats for Table
    const sortedStats = [...allStats].sort((a, b) => {
        if (sortKey === 'winRate') {
            const rateA = a.matchesPlayed ? (a.wins / a.matchesPlayed) : 0;
            const rateB = b.matchesPlayed ? (b.wins / b.matchesPlayed) : 0;
            return rateB - rateA;
        }
        return b[sortKey] - a[sortKey];
    });

    // Stats for Podium (Always sort by Wins first for the visual podium)
    const podiumStats = [...allStats].sort((a, b) => b.wins - a.wins);
    const top1 = podiumStats[0];
    const top2 = podiumStats[1];
    const top3 = podiumStats[2];

    const getMedal = (index) => {
        if (index === 0) return <Trophy className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-gray-300" size={24} />;
        if (index === 2) return <Award className="text-orange-400" size={24} />;
        return <span className="font-mono text-[var(--color-text-dim)] font-bold">#{index + 1}</span>;
    };

    // 3D Podium Component
    const PodiumSpot = ({ player, rank, delay }) => {
        if (!player) return <div className="w-1/3 invisible" />;

        const isFirst = rank === 1;
        
        // Configuration per rank
        const config = {
            1: {
                color: 'yellow',
                baseGradient: 'from-yellow-600 via-yellow-400 to-yellow-700',
                medalGradient: 'from-yellow-300 via-yellow-500 to-yellow-700',
                glow: 'shadow-[0_0_50px_rgba(234,179,8,0.6)]',
                beam: 'bg-gradient-to-t from-yellow-500/20 to-transparent',
                ringColor: 'border-yellow-400',
                height: 'h-32',
                scale: 1.2
            },
            2: {
                color: 'cyan', // Silver/Cyan look from image
                baseGradient: 'from-slate-400 via-cyan-300 to-slate-500',
                medalGradient: 'from-slate-200 via-cyan-200 to-slate-400',
                glow: 'shadow-[0_0_40px_rgba(34,211,238,0.4)]',
                beam: 'bg-gradient-to-t from-cyan-400/10 to-transparent',
                ringColor: 'border-cyan-400',
                height: 'h-24',
                scale: 1
            },
            3: {
                color: 'orange', // Bronze/Orange
                baseGradient: 'from-orange-700 via-orange-500 to-orange-800',
                medalGradient: 'from-orange-300 via-orange-500 to-orange-700',
                glow: 'shadow-[0_0_40px_rgba(249,115,22,0.4)]',
                beam: 'bg-gradient-to-t from-orange-500/10 to-transparent',
                ringColor: 'border-orange-500',
                height: 'h-20',
                scale: 0.9
            }
        };

        const cfg = config[rank];

        return (
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay, type: 'spring', bounce: 0.4 }}
                className={`flex flex-col items-center justify-end relative z-10 w-full md:w-1/3 ${isFirst ? '-mt-12 z-20' : ''}`}
            >
                {/* Floating Medal Section */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay }} // Floating animation
                    className="relative flex flex-col items-center mb-4"
                >
                    {/* Crown for Winner */}
                    {isFirst && (
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.5 }}
                            className="absolute -top-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                        >
                            <Crown size={40} fill="currentColor" />
                        </motion.div>
                    )}

                    {/* The Medal/Badge */}
                    <div className={`
                        w-24 h-24 rounded-full bg-gradient-to-br ${cfg.medalGradient}
                        flex items-center justify-center relative
                        border-4 border-white/20 shadow-2xl ${cfg.glow}
                    `}>
                        {/* Inner Ring */}
                        <div className="absolute inset-1 rounded-full border-2 border-white/30" />
                        
                        {/* Rank Number */}
                        <span className="text-4xl font-black text-white drop-shadow-md italic font-display">
                            {rank}
                        </span>

                        {/* Decoration Wings (CSS Shapes) */}
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/10 skew-y-12 rounded-l-full blur-[1px]" />
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/10 -skew-y-12 rounded-r-full blur-[1px]" />
                    </div>
                </motion.div>

                {/* Holographic Beam */}
                <div className="w-full h-16 relative flex justify-center items-end">
                     {/* The Cone Beam */}
                     <div className={`
                        absolute bottom-0 w-24 h-24 
                        ${cfg.beam} blur-xl rounded-t-full opacity-60
                     `} />
                     
                     {/* Hologram Rings */}
                     <div className={`absolute bottom-4 w-20 h-4 rounded-[100%] border ${cfg.ringColor} opacity-30 blur-[1px] animate-pulse`} />
                     <div className={`absolute bottom-10 w-16 h-3 rounded-[100%] border ${cfg.ringColor} opacity-20 blur-[1px]`} />
                </div>

                {/* 3D Base Platform */}
                <div className="relative w-32 md:w-40 flex flex-col items-center group cursor-pointer">
                    {/* Player Name Tooltip (Always visible slightly above) */}
                    <div className="absolute -top-10 mb-2 whitespace-nowrap">
                         <span className={`text-white font-bold text-lg drop-shadow-md bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10`}>
                            {player.name}
                         </span>
                    </div>

                     {/* Top Face of Cylinder */}
                    <div className={`
                        w-full h-12 rounded-[100%] 
                        bg-gradient-to-r ${cfg.baseGradient}
                        relative z-10 border-t border-white/30
                        flex items-center justify-center
                    `}>
                        {/* Inner circle on top face */}
                        <div className="w-24 h-6 rounded-[100%] bg-black/20" />
                    </div>
                    
                    {/* Side Face of Cylinder (The Height) */}
                    <div className={`
                        w-full ${cfg.height} -mt-6 
                        bg-gradient-to-b ${cfg.baseGradient}
                        flex items-center justify-center relative
                    `}>
                        {/* Shine effect on cylinder */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/10 to-black/30" />
                        
                        {/* Winner Label */}
                        {isFirst && (
                            <div className="z-20 transform -mt-4 bg-black/30 px-3 py-0.5 rounded text-yellow-200 text-xs font-bold uppercase tracking-[0.2em] border border-yellow-400/30">
                                Winner
                            </div>
                        )}
                        
                         {/* Stats on Base */}
                         <div className="text-white/90 font-mono font-bold text-sm mt-auto mb-4 z-20 drop-shadow-md">
                            {player.wins} Wins
                         </div>
                    </div>

                    {/* Bottom Face of Cylinder */}
                    <div className={`
                        absolute -bottom-3 w-full h-12 rounded-[100%] 
                        bg-black/40 z-0 blur-sm
                    `} />
                     <div className={`
                        absolute -bottom-1 w-[102%] h-12 rounded-[100%] 
                        bg-gradient-to-r ${cfg.baseGradient} brightness-50 z-0
                    `} />
                </div>
            </motion.div>
        );
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 overflow-hidden min-h-screen">
            <h1 className="text-3xl font-display font-bold mb-8 flex items-center justify-center gap-3 text-center">
                <Trophy className="text-yellow-500 fill-yellow-500 glow" /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-main)] via-[var(--color-text-dim)] to-[var(--color-text-dim)] drop-shadow-lg">
                    LEADERBOARD
                </span>
            </h1>

            {/* Podium Section - Centered 3D Layout */}
            {allStats.length > 0 && (
                <div className="relative mb-24 mt-12 w-full max-w-4xl mx-auto h-[450px]">
                     {/* Ambient Spotlight Background */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                     
                     <div className="flex items-end justify-center gap-2 md:gap-4 h-full pb-10">
                         {/* 2nd Place (Left) */}
                         <PodiumSpot player={top2} rank={2} delay={0.2} />
                         
                         {/* 1st Place (Center) */}
                         <PodiumSpot player={top1} rank={1} delay={0.4} />
                         
                         {/* 3rd Place (Right) */}
                         <PodiumSpot player={top3} rank={3} delay={0.6} />
                     </div>
                </div>
            )}

            {/* Existing Table (Refined) */}
            <div className="glass-panel overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-2xl backdrop-blur-xl">
                 <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-[var(--color-text-dim)] flex items-center gap-2">
                        <Star size={18} className="text-yellow-500" /> Full Rankings
                    </h3>
                    <div className="text-xs text-[var(--color-text-dim)]">
                        {allStats.length} Players
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--color-surface)] text-[var(--color-text-dim)] text-xs uppercase tracking-wider border-b border-[var(--color-border)]">
                                <th className="p-4">Rank</th>
                                <th className="p-4">Player</th>
                                <th 
                                    className="p-4 cursor-pointer hover:text-[var(--color-text-main)] transition-colors text-center"
                                    onClick={() => setSortKey('wins')}
                                >
                                    Wins {sortKey === 'wins' && '↓'}
                                </th>
                                <th className="p-4 text-center">Losses</th>
                                <th 
                                    className="p-4 cursor-pointer hover:text-[var(--color-text-main)] transition-colors text-center"
                                    onClick={() => setSortKey('winRate')}
                                >
                                    Win Rate {sortKey === 'winRate' && '↓'}
                                </th>
                                <th className="p-4 hidden md:table-cell text-right">Total Invested</th>
                                <th className="p-4 hidden md:table-cell text-center">Games</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)] text-sm">
                            {sortedStats.map((stat, index) => {
                                const winRate = stat.matchesPlayed > 0 
                                    ? ((stat.wins / stat.matchesPlayed) * 100).toFixed(1) 
                                    : '0.0';

                                return (
                                    <tr key={stat.name} className="hover:bg-[var(--color-highlight)] transition-colors group">
                                        <td className="p-4">
                                            <div className={`
                                                w-8 h-8 flex items-center justify-center rounded-full font-bold
                                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 
                                                  index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' :
                                                  index === 2 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' :
                                                  'bg-[var(--color-surface)] text-[var(--color-text-dim)] border border-[var(--color-border)]'}
                                            `}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-[var(--color-text-main)]">
                                            {stat.name}
                                        </td>
                                        <td className="p-4 text-center font-bold text-green-500">{stat.wins}</td>
                                        <td className="p-4 text-center text-red-500">{stat.losses}</td>
                                        <td className="p-4 text-center text-[var(--color-text-main)]">
                                            <div className="flex items-center justify-center gap-2">
                                                <span>{winRate}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-[var(--color-text-dim)] hidden md:table-cell">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stat.totalSpent)}
                                        </td>
                                        <td className="p-4 text-center text-[var(--color-text-dim)] hidden md:table-cell">{stat.matchesPlayed}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-[var(--color-text-dim)] text-xs uppercase tracking-widest">Quang Minh • From • Withlove</p>
            </div>
        </div>
    );
};

export default LeaderboardView;
