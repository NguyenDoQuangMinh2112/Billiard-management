import { useGame } from '../context/GameContext';
import { Trash2, Calendar, User, DollarSign } from 'lucide-react';

const HistoryView = () => {
    const { matches, deleteMatch } = useGame();

    const fmtMoney = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-display font-bold mb-8">Match History</h1>

            <div className="space-y-4">
                {matches.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-gray-500 text-lg">No matches recorded yet.</p>
                        <p className="text-gray-600 text-sm mt-2">Go to dashboard to log your first game.</p>
                    </div>
                ) : (
                    matches.map((match) => (
                        <div key={match.id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-white/20 transition-all">
                            
                            {/* Date & basic info */}
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-lg border border-white/5 text-gray-400">
                                    <span className="font-bold text-lg">{new Date(match.date).getDate()}</span>
                                    <span className="text-xs uppercase">{new Date(match.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-xl text-white">{match.winner}</span>
                                        <span className="text-sm px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold uppercase">Won</span>
                                        <span className="text-gray-500 text-sm">vs</span>
                                        <span className="font-bold text-gray-400">{match.loser}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {fmtDate(match.date)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost & Payer */}
                            <div className="flex items-center gap-8 ml-auto md:ml-0 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-right">
                                    <div className="font-mono text-xl font-bold text-[var(--color-primary)]">{fmtMoney(match.cost)}</div>
                                    <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
                                        <DollarSign size={12} />
                                        <span>Paid by <span className="text-white font-bold">{match.payer}</span></span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        if (window.confirm('Delete this match record? This cannot be undone.')) {
                                            deleteMatch(match.id);
                                        }
                                    }}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                                    title="Delete Record"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
