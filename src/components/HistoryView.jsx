import { useGame } from '../context/GameContext';
import { Trash2, Calendar, User, DollarSign, Clock, Swords, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryView = () => {
    const { matches, deleteMatch, players } = useGame();

    const fmtMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
        weekday: 'short', month: 'short', day: 'numeric',
    });
    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false
    });

    return (
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <Swords className="text-[var(--color-primary)]" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Match History
                        </span>
                    </h1>
                     <p className="text-[var(--color-text-dim)] mt-1">Recent battles and outcomes</p>
                </div>
                
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-[var(--color-text-dim)]">
                    Total Matches: <span className="text-white font-bold">{matches.length}</span>
                </div>
            </div>

            <div className="space-y-4 relative">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent hidden md:block" />

                <AnimatePresence mode='popLayout'>
                    {matches.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 backdrop-blur-sm"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Swords size={32} className="text-gray-500 opacity-50" />
                            </div>
                            <p className="text-gray-400 text-lg font-medium">No matches recorded yet</p>
                            <p className="text-gray-600 text-sm mt-2">Go to dashboard to log your first game.</p>
                        </motion.div>
                    ) : (
                        matches.map((match, index) => {
                            // Find the third player who is neither winner nor loser
                            let thirdPlayer = null;
                            if (match.participants && match.participants.length > 0) {
                                thirdPlayer = match.participants.find(p => p !== match.winner && p !== match.loser);
                            } else {
                                thirdPlayer = players.find(p => p !== match.winner && p !== match.loser);
                            }

                            return (
                                <motion.div 
                                    key={match.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative md:pl-12"
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-primary)] ring-4 ring-black hidden md:block z-10" />

                                    <div className="glass-panel p-0 overflow-hidden rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                                            
                                            {/* Date Banner Mobile */}
                                            <div className="md:hidden bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] uppercase font-bold tracking-wider">
                                                    <Calendar size={12} /> {fmtDate(match.date)}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-dim)] font-mono">
                                                     {fmtTime(match.date)}
                                                </div>
                                            </div>

                                            {/* Left: Date (Desktop) */}
                                            <div className="hidden md:flex flex-col col-span-2 bg-white/5 items-center justify-center p-4 border-r border-white/5">
                                                <span className="text-2xl font-black text-white/80">{new Date(match.date).getDate()}</span>
                                                <span className="text-xs uppercase font-bold text-[var(--color-text-dim)] tracking-widest">{new Date(match.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="mt-2 text-[10px] text-[var(--color-text-dim)] bg-black/20 px-2 py-0.5 rounded-full font-mono">
                                                    {fmtTime(match.date)}
                                                </span>
                                            </div>

                                            {/* Middle: Match Participants */}
                                            <div className="col-span-7 p-5 flex flex-col justify-center">
                                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                                                    
                                                    {/* Winner Side */}
                                                    <div className="flex items-center gap-3 relative">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-700 p-[2px] shadow-lg shadow-green-900/50">
                                                            <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                                                <Trophy size={20} className="text-green-200" />
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-black z-10">
                                                                <span className="text-[10px] font-bold text-black">W</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-bold text-white leading-tight">{match.winner}</div>
                                                            <div className="text-xs text-green-400 font-bold uppercase tracking-wider">Winner</div>
                                                        </div>
                                                    </div>

                                                    {/* VS Divider */}
                                                    <div className="hidden md:flex flex-col items-center px-4">
                                                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                                        <span className="my-1 text-xs font-black text-white/20 uppercase italic">VS</span>
                                                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                                    </div>

                                                    {/* Loser Side */}
                                                    <div className="flex flex-col gap-3">
                                                        {[match.loser, thirdPlayer].filter(Boolean).map((loserName, idx) => (
                                                            <div key={idx} className="flex items-center gap-3 opacity-80">
                                                                <div className="w-10 h-10 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center text-red-500">
                                                                    <span className="text-xs font-bold">L</span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-300">{loserName}</div>
                                                                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Defeated</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Right: Payment & Actions */}
                                            <div className="col-span-3 bg-gradient-to-l from-black/20 to-transparent p-5 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/5 gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">Total Pot</div>
                                                    <div className="font-mono text-xl font-bold text-yellow-400 tracking-tight drop-shadow-sm">
                                                        {fmtMoney(match.cost)}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500 flex items-center justify-end gap-1 mt-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        Paid by <span className="text-gray-300 font-bold">{match.payer}</span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Delete this match record? This cannot be undone.')) {
                                                            deleteMatch(match.id);
                                                        }
                                                    }}
                                                    className="p-2.5 rounded-xl bg-red-500/0 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HistoryView;
