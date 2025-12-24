import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import MatchLogger from './MatchLogger';
import StatsCharts from './StatsCharts';
import Leaderboard from './Leaderboard';
import { Plus, Wallet, Trophy, Clock, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
    const { nextPayer, allStats, getExpenses, matches } = useGame();
    const [isLoggerOpen, setIsLoggerOpen] = useState(false);
    const [timeframe, setTimeframe] = useState('month'); 

    const expenses = getExpenses(timeframe);
    
    // Format currency
    const fmtMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    // Top Player
    const topPlayer = allStats[0];

    return (
        <div className="container mx-auto px-6 py-8">
            
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold">Overview</h1>
                    <p className="text-[var(--color-text-dim)]">Welcome back to the arena.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
                        {['week', 'month', 'year'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-4 py-2 text-sm font-bold rounded-md capitalize transition-all ${timeframe === t ? 'bg-[var(--color-surface)] text-[var(--color-text-main)] shadow ring-1 ring-white/10' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsLoggerOpen(true)}
                        className="bg-[var(--color-primary)] text-black px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-accent)] transition-all shadow-lg shadow-[var(--color-primary)]/20"
                    >
                        <Plus size={20} />
                        Log Match
                    </button>
                </div>
            </div>

            {/* Top Widgets Row */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Next Payer Widget */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-primary)]/20 blur-[60px] rounded-full group-hover:bg-[var(--color-primary)]/30 transition-all" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-xl text-[var(--color-primary)]">
                                <Wallet size={24} />
                            </div>
                            <span className="text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded">
                                UP NEXT
                            </span>
                        </div>
                        <h3 className="text-[var(--color-text-dim)] text-sm font-medium uppercase tracking-wider mb-1">Paying Bill</h3>
                        <div className="text-4xl font-display font-bold text-[var(--color-text-main)]">{nextPayer}</div>
                    </div>
                </div>

                {/* 2. Top Player Widget */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-secondary)]/20 blur-[60px] rounded-full group-hover:bg-[var(--color-secondary)]/30 transition-all" />
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-xl text-[var(--color-secondary)]">
                                <Trophy size={24} />
                            </div>
                            <span className="text-xs font-bold bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-2 py-1 rounded">
                                LEADER
                            </span>
                        </div>
                        <h3 className="text-[var(--color-text-dim)] text-sm font-medium uppercase tracking-wider mb-1">Top Player</h3>
                        <div className="text-4xl font-display font-bold text-[var(--color-text-main)] flex items-end gap-2">
                            {topPlayer?.name || '-'}
                            <span className="text-lg text-gray-500 font-sans font-normal mb-1">{topPlayer?.wins || 0} Wins</span>
                        </div>
                    </div>
                </div>

                {/* 3. Total Spent Widget */}
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                     <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-accent)]/20 blur-[60px] rounded-full group-hover:bg-[var(--color-accent)]/30 transition-all" />
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-xl text-[var(--color-accent)]">
                                <ArrowUpRight size={24} />
                            </div>
                            <span className="text-xs font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-2 py-1 rounded capitalize">
                                This {timeframe}
                            </span>
                        </div>
                        <h3 className="text-[var(--color-text-dim)] text-sm font-medium uppercase tracking-wider mb-1">Total Expenses</h3>
                        <div className="text-4xl font-display font-bold text-[var(--color-text-main)]">{fmtMoney(expenses.total)}</div>
                    </div>
                </div>

            </div>

            {/* Charts Section */}
            <StatsCharts expenses={expenses} winStats={allStats} />

            {/* Bottom Section: Leaderboard & History */}
            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Leaderboard - Take up 2 cols */}
                <div className="lg:col-span-2">
                    <Leaderboard stats={allStats} />
                </div>

                {/* Recent History - Take up 1 col */}
                <div className="glass-panel p-6 rounded-2xl h-fit">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Clock className="text-[var(--color-text-dim)]" size={20} />
                        Recent Matches
                    </h3>
                    <div className="space-y-4">
                        {matches.slice(0, 5).map(match => (
                            <div key={match.id} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0 last:border-0">
                                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[var(--color-surface)] border border-white/20" />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-[var(--color-text-main)]">{match.winner} <span className="text-gray-500 font-normal text-sm">beat {match.loser}</span></div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(match.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-[var(--color-primary)]">{fmtMoney(match.cost)}</div>
                                        <div className="text-[10px] text-gray-600 uppercase">Paid: {match.payer}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {matches.length === 0 && (
                            <div className="text-center py-8 text-gray-500 text-sm">No matches recorded.</div>
                        )}
                    </div>
                </div>
            </div>

            <MatchLogger isOpen={isLoggerOpen} onClose={() => setIsLoggerOpen(false)} />
        </div>
    );
};

export default Dashboard;
