import { useGame } from '../context/GameContext';
import { Trash2, Calendar, Swords, Trophy, Clock } from 'lucide-react';
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                     <h1 className="text-4xl md:text-5xl font-display font-bold flex items-center gap-3 text-gradient">
                        <Swords className="hidden md:block text-[var(--color-primary)]" strokeWidth={2.5} />
                        Match History
                    </h1>
                     <p className="text-[var(--color-text-dim)] mt-2 text-lg font-light">Recent battles and outcomes</p>
                </div>
                
                <div className="px-6 py-3 rounded-2xl bg-black/20 border border-[var(--color-border)] text-sm font-mono text-[var(--color-text-dim)] backdrop-blur-md">
                    Total Matches: <span className="text-[var(--color-primary)] font-bold text-lg ml-2">{matches.length}</span>
                </div>
            </div>

            <div className="space-y-6 relative pl-4 md:pl-0">
                {/* Timeline Line (Desktop) */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-primary)]/50 via-[var(--color-border)] to-transparent hidden md:block" />

                <AnimatePresence mode='popLayout'>
                    {matches.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center py-24 glass-panel rounded-3xl border-dashed border-[var(--color-border)]"
                        >
                            <div className="w-24 h-24 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Swords size={40} className="text-[var(--color-text-dim)] opacity-50" />
                            </div>
                            <p className="text-[var(--color-text-dim)] text-xl font-medium">No matches recorded yet</p>
                            <p className="text-[var(--color-text-dim)]/50 mt-2">Go to dashboard to log your first game.</p>
                        </motion.div>
                    ) : (
                        matches.map((match, index) => {
                            // Support both old and new winner formats
                            const winners = Array.isArray(match.winners) ? match.winners : (match.winner ? [match.winner] : []);
                            // Find the third player who is neither winner nor loser
                            let thirdPlayer = null;
                            if (match.participants && match.participants.length > 0) {
                                thirdPlayer = match.participants.find(p => !winners.includes(p) && p !== match.loser);
                            } else {
                                thirdPlayer = players.find(p => !winners.includes(p) && p !== match.loser);
                            }

                            return (
                                <motion.div 
                                    key={match.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="group relative md:pl-16"
                                >
                                    {/* Timeline Dot */}
                                    <div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-background)] border-4 border-[var(--color-primary)] hidden md:block z-10 shadow-[0_0_10px_var(--color-primary)] group-hover:scale-125 transition-transform duration-300" />

                                    <div className="glass-panel p-0 overflow-hidden rounded-3xl border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-[var(--color-surface)]/40">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                                            
                                            {/* Date Banner Mobile */}
                                            <div className="md:hidden bg-white/5 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] uppercase font-bold tracking-wider">
                                                    <Calendar size={14} /> {fmtDate(match.date)}
                                                </div>
                                                <div className="text-xs text-[var(--color-text-dim)] font-mono">
                                                     {fmtTime(match.date)}
                                                </div>
                                            </div>

                                            {/* Left: Date (Desktop) */}
                                            <div className="hidden md:flex flex-col col-span-2 bg-black/20 items-center justify-center p-6 border-r border-white/5 group-hover:bg-black/30 transition-colors">
                                                <span className="text-3xl font-display font-bold text-white/90">{new Date(match.date).getDate()}</span>
                                                <span className="text-xs uppercase font-bold text-[var(--color-primary)] tracking-[0.2em] mb-2">{new Date(match.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-[10px] text-[var(--color-text-dim)] bg-white/5 px-2 py-1 rounded-full font-mono flex items-center gap-1">
                                                    <Clock size={10} /> {fmtTime(match.date)}
                                                </span>
                                            </div>

                                            {/* Middle: Match Participants */}
                                            <div className="col-span-12 md:col-span-7 p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
                                                {/* Background decorative glow */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                
                                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 relative z-10">
                                                    
                                                    {/* Winner Side */}
                                                    <div className="flex flex-col gap-4 min-w-[140px]">
                                                        {winners.map((winnerName, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 relative">
                                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 p-[1px] ring-1 ring-[var(--color-primary)]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                                                                    <div className="w-full h-full rounded-2xl bg-black/40 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                                                                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-primary)]/10" />
                                                                        <Trophy size={24} className="text-[var(--color-primary)] relative z-10" />
                                                                    </div>
                                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center border-2 border-[#121225] z-20 shadow-lg">
                                                                        <span className="text-[10px] font-black text-black">W</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-xl font-bold text-white leading-tight font-display tracking-wide">{winnerName}</div>
                                                                    <div className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-wider mt-1">
                                                                        Victory
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* VS Divider */}
                                                    <div className="hidden md:flex flex-col items-center px-2 opacity-30">
                                                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white to-transparent" />
                                                        <span className="my-2 text-sm font-black text-white uppercase italic tracking-widest">VS</span>
                                                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white to-transparent" />
                                                    </div>

                                                    {/* Loser Side */}
                                                    <div className="flex flex-col gap-3 pl-2 md:pl-0 border-l-2 border-white/5 md:border-l-0">
                                                        {[match.loser, thirdPlayer].filter(Boolean).map((loserName, idx) => (
                                                            <div key={idx} className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                                                                <div className="w-10 h-10 rounded-xl bg-red-900/10 border border-red-500/20 flex items-center justify-center text-red-500/50">
                                                                    <span className="text-xs font-black">L</span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-300 text-lg">{loserName}</div>
                                                                    <div className="text-[10px] text-red-500/50 font-bold uppercase tracking-wider">Defeated</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Right: Payment & Actions */}
                                            <div className="col-span-12 md:col-span-3 bg-gradient-to-l from-black/40 to-transparent p-6 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-white/5 gap-4">
                                                <div className="md:text-right">
                                                    <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest mb-1 font-bold">Total Pot</div>
                                                    <div className="font-mono text-2xl font-bold text-[var(--color-accent)] tracking-tight drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">
                                                        {fmtMoney(match.cost)}
                                                    </div>
                                                    <div className="text-xs text-[var(--color-text-dim)] flex items-center md:justify-end gap-1.5 mt-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] shadow-[0_0_5px_var(--color-secondary)]"></span>
                                                        Paid by <span className="text-white font-bold">{match.payer}</span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Delete this match record? This cannot be undone.')) {
                                                            deleteMatch(match.id);
                                                        }
                                                    }}
                                                    className="p-3 rounded-xl bg-red-500/0 text-red-500/40 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 md:mt-4"
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
