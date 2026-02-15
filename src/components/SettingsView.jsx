import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';

const SettingsView = () => {
    // Note: To fully implement player editing we'd need to update the Context to expose a `setPlayers` function.
    // For now we will just show the readonly list and the Reset Data button which clears LocalStorage.
    const { players } = useGame();
    
    // Simple reset handler
    const handleReset = () => {
        if (window.confirm('CRITICAL WARNING: This will wipe ALL match history and stats permanently. Are you sure?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl min-h-screen">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-10 text-gradient inline-block">Settings</h1>

            <div className="grid grid-cols-1 gap-8">
                {/* Player Management Section */}
                <div className="glass-panel p-8 rounded-3xl border border-[var(--color-border)] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] flex items-center justify-center text-black shadow-lg">
                            <Save size={20} />
                        </span>
                        Active Players
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-1 rounded-full text-[var(--color-text-dim)] ml-auto md:ml-2">Read-only</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {players.map((player, idx) => (
                            <div key={idx} className="group">
                                <label className="text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-wider mb-1.5 block ml-1">
                                    Player {idx + 1}
                                </label>
                                <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center gap-3 transition-all group-hover:border-[var(--color-primary)]/30">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--color-text-dim)] font-display font-bold">
                                        {player.charAt(0)}
                                    </div>
                                    <span className="font-bold text-lg text-white/80">{player}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-[var(--color-text-dim)] mt-6 flex items-center gap-2 bg-[var(--color-surface)] p-3 rounded-lg border border-white/5">
                        <AlertTriangle size={16} className="text-yellow-500" />
                        Player name editing is currently locked to preserve match history integrity.
                    </p>
                </div>

                {/* Data Management Section */}
                <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors duration-500" />
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold font-display text-red-500 mb-4 flex items-center gap-3">
                            <AlertTriangle size={24} />
                            Danger Zone
                        </h2>
                        <p className="text-[var(--color-text-dim)] mb-8 text-lg max-w-2xl">
                            Resetting data will delete all match logs, rotation order, highlights, and clear the leaderboard. 
                            <span className="block mt-1 font-bold text-red-400">This action cannot be undone.</span>
                        </p>
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-1 w-full sm:w-auto justify-center"
                        >
                            <RefreshCw size={20} />
                            Reset System Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
