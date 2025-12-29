import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const LoadingSpinner = () => {
    const { loading, error } = useGame();

    return (
        <AnimatePresence>
            {(loading || error) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-background)]/80 backdrop-blur-xl"
                >
                    {/* Background Decorative Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-primary)]/10 rounded-full blur-[100px] animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                {/* The Spinner */}
                                <div className="relative w-24 h-24 mb-6">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)]/10 border-t-[var(--color-primary)] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                    />
                                    <motion.div 
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 rounded-full border-2 border-[var(--color-secondary)]/10 border-b-[var(--color-secondary)] opacity-50"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 size={32} className="text-[var(--color-primary)] animate-pulse" />
                                    </div>
                                </div>

                                {/* Loading Text Section */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <h2 className="text-xl font-display font-bold text-[var(--color-text-main)] mb-2 tracking-widest uppercase">
                                        Initializing
                                    </h2>
                                    <div className="flex items-center justify-center gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div 
                                                key={i}
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs font-mono text-[var(--color-text-dim)] uppercase tracking-[0.3em]">
                                        Loading billiard data...
                                    </p>
                                </motion.div>
                            </div>
                        ) : (
                            /* Error State */
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="glass-panel p-8 rounded-3xl border-red-500/20 text-center shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-red-500 mb-2">SYSTEM ERROR</h3>
                                <p className="text-[var(--color-text-dim)] mb-8 text-sm leading-relaxed">
                                    {error || "An unexpected error occurred while connecting to the arena."}
                                </p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transform hover:-translate-y-1"
                                >
                                    <RefreshCw size={20} />
                                    Reconnect Arena
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-10 left-0 right-0 text-center">
                        <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-[0.5em] opacity-30">
                            Neural Link Established • v2.0.4
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingSpinner;
