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
        <div className="container mx-auto px-6 py-8 md:max-w-2xl">
            <h1 className="text-3xl font-display font-bold mb-8">Settings</h1>

            {/* Player Management Section */}
            <div className="glass-panel p-8 rounded-2xl mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Active Players
                    <span className="text-xs font-normal bg-white/10 px-2 py-1 rounded text-gray-400">Read-only</span>
                </h2>
                <div className="space-y-4">
                    {players.map((player, idx) => (
                        <div key={idx} className="flex gap-4">
                            <input 
                                type="text" 
                                value={player} 
                                disabled
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-gray-400 cursor-not-allowed" 
                            />
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    * Player name editing is locked to preserve match history integrity.
                </p>
            </div>

            {/* Data Management Section */}
            <div className="border border-red-500/20 bg-red-500/5 p-8 rounded-2xl">
                <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    <AlertTriangle size={24} />
                    Danger Zone
                </h2>
                <p className="text-gray-400 mb-6">
                    Resetting data will delete all match logs, resets the rotation order, and clears the leaderboard. 
                    This action cannot be undone.
                </p>
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors w-full sm:w-auto justify-center"
                >
                    <RefreshCw size={20} />
                    Reset System Data
                </button>
            </div>
        </div>
    );
};

export default SettingsView;
