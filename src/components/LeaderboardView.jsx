import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Award, DollarSign, TrendingUp } from 'lucide-react';

const LeaderboardView = () => {
    const { allStats } = useGame();
    const [sortKey, setSortKey] = useState('wins');

    const sortedStats = [...allStats].sort((a, b) => {
        if (sortKey === 'winRate') {
            const rateA = a.matchesPlayed ? (a.wins / a.matchesPlayed) : 0;
            const rateB = b.matchesPlayed ? (b.wins / b.matchesPlayed) : 0;
            return rateB - rateA;
        }
        return b[sortKey] - a[sortKey];
    });

    const getMedal = (index) => {
        if (index === 0) return <Trophy className="text-yellow-400" size={24} />;
        if (index === 1) return <Medal className="text-[var(--color-text-dim)]" size={24} />;
        if (index === 2) return <Award className="text-orange-400" size={24} />;
        return <span className="font-mono text-[var(--color-text-dim)] font-bold">#{index + 1}</span>;
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-display font-bold mb-8">Leaderboard</h1>

            <div className="glass-panel overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--color-highlight)] text-[var(--color-text-dim)] text-sm uppercase tracking-wider border-b border-white/10">
                                <th className="p-6">Rank</th>
                                <th className="p-6">Player</th>
                                <th 
                                    className="p-6 cursor-pointer hover:text-[var(--color-text-main)] transition-colors"
                                    onClick={() => setSortKey('wins')}
                                >
                                    Wins {sortKey === 'wins' && '↓'}
                                </th>
                                <th className="p-6">Losses</th>
                                <th 
                                    className="p-6 cursor-pointer hover:text-[var(--color-text-main)] transition-colors"
                                    onClick={() => setSortKey('winRate')}
                                >
                                    Win Rate {sortKey === 'winRate' && '↓'}
                                </th>
                                <th 
                                    className="p-6 cursor-pointer hover:text-[var(--color-text-main)] transition-colors"
                                    onClick={() => setSortKey('totalSpent')}
                                >
                                    Total Invested {sortKey === 'totalSpent' && '↓'}
                                </th>
                                <th 
                                    className="p-6 cursor-pointer hover:text-[var(--color-text-main)] transition-colors"
                                    onClick={() => setSortKey('matchesPlayed')}
                                >
                                    Games Played {sortKey === 'matchesPlayed' && '↓'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedStats.map((stat, index) => {
                                const winRate = stat.matchesPlayed > 0 
                                    ? ((stat.wins / stat.matchesPlayed) * 100).toFixed(1) 
                                    : '0.0';

                                return (
                                    <tr key={stat.name} className="hover:bg-[var(--color-highlight)] transition-colors group">
                                        <td className="p-6">
                                            <div className="w-10 h-10 flex items-center justify-center bg-black/30 rounded-full">
                                                {getMedal(index)}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-10 rounded-full ${index === 0 ? 'bg-[var(--color-primary)]' : 'bg-transparent group-hover:bg-gray-600'}`} />
                                                <span className={`font-bold text-lg ${index === 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-main)]'}`}>
                                                    {stat.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-lg text-green-400 font-bold">{stat.wins}</td>
                                        <td className="p-6 font-mono text-lg text-red-400">{stat.losses}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{winRate}%</span>
                                                <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-[var(--color-primary)]" 
                                                        style={{ width: `${winRate}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-[var(--color-text-dim)]">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stat.totalSpent)}
                                        </td>
                                        <td className="p-6 font-mono text-[var(--color-text-dim)]">{stat.matchesPlayed}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 rounded-full bg-green-500/10 text-green-500">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-dim)]">Highest Win Streak</p>
                        <p className="text-xl font-bold">Coming Soon</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                        <TrendingUp size={24} className="rotate-180" />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-dim)]">Lowest Win Rate</p>
                        <p className="text-xl font-bold">
                            {sortedStats[sortedStats.length - 1]?.name} ({sortedStats[sortedStats.length - 1]?.matchesPlayed > 0 ? ((sortedStats[sortedStats.length - 1]?.wins / sortedStats[sortedStats.length - 1]?.matchesPlayed) * 100).toFixed(0) : 0}%)
                        </p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-[var(--color-text-dim)]">Biggest Spender</p>
                        <p className="text-xl font-bold">
                            {[...allStats].sort((a,b) => b.totalSpent - a.totalSpent)[0]?.name}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
