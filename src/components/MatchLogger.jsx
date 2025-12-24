import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, User, Trophy, Camera, ScanLine, Loader, UploadCloud } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Tesseract from 'tesseract.js';

const MatchLogger = ({ isOpen, onClose }) => {
    const { players, nextPayer, addMatch } = useGame();
    const [winner, setWinner] = useState(players[0]);
    const [loser, setLoser] = useState(players[1]);
    const [cost, setCost] = useState('');
    
    // AI Scanning States
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!cost) return;

        addMatch({
            winner,
            loser,
            cost: parseFloat(cost)
        });
        
        // Reset
        setCost('');
        setScanStatus('');
        onClose();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        setScanStatus('Initializing AI...');
        setScanProgress(0);

        try {
            const { data: { text } } = await Tesseract.recognize(
                file,
                'eng+vie',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setScanProgress(Math.round(m.progress * 100));
                            setScanStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
                        } else {
                            setScanStatus(m.status);
                        }
                    }
                }
            );

            console.log("OCR Result:", text);
            parseTotal(text);

        } catch (err) {
            console.error(err);
            setScanStatus('Scan failed. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    const parseTotal = (text) => {
        const lines = text.split('\n');
        let foundAmount = null;

        const keywords = ['total', 'tong', 'amount', 'due', 'thanh toan', 'thanh tien', 'cong'];

        // 1. Try to find explicit total lines first
        for (let line of lines) {
            const lowerLine = line.toLowerCase();
            if (keywords.some(k => lowerLine.includes(k))) {
                // Extract number: allows dots, commas, and digits
                const numbers = line.match(/[\d,.]+/g);
                if (numbers) {
                    // Get the last number in the line (usually the total)
                    const lastNum = numbers[numbers.length - 1];
                    // Clean it: remove non-digits to get raw value (assuming VND usually integers for this context or handled simply)
                    // For precise parsing: replace dots/commas based on locale. 
                    // Let's assume standard input format: Remove all non-digits.
                    const cleanNum = lastNum.replace(/\D/g, ''); 
                    
                    if (cleanNum.length > 3) { // rudimentary filter for noise
                         foundAmount = cleanNum;
                         break; 
                    }
                }
            }
        }

        // 2. If no keyword found, looking for the largest number might be risky but a fallback
        if (!foundAmount) {
             setScanStatus('Could not find strict "Total". Please verify.');
        } else {
             setCost(foundAmount);
             setScanStatus('Bill Recognized!');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 m-auto w-full max-w-lg h-fit p-4 z-50 pointer-events-none flex items-center justify-center"
                    >
                        <div className="bg-[#1a1a2e] w-full border border-white/10 rounded-2xl p-6 shadow-2xl relative pointer-events-auto overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 blur-[80px] rounded-full pointer-events-none" />

                            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                                <span className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                    <Trophy size={20} />
                                </span>
                                Log Match Result
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* AI Scanner Section */}
                                <div className="relative group">
                                    <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${isScanning ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'}`}>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileUpload} 
                                            disabled={isScanning}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                                        />
                                        
                                        {isScanning ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
                                                <div className="text-sm font-bold text-[var(--color-primary)]">{scanStatus}</div>
                                                <div className="w-32 h-1 bg-black/50 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-[var(--color-primary)] transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <div className="p-3 rounded-full bg-white/5 group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors">
                                                    <ScanLine size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">AI Auto-Fill</p>
                                                    <p className="text-xs text-gray-400">Upload receipt image to extract total</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Success Indicator */}
                                    {!isScanning && scanStatus === 'Bill Recognized!' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-black text-[10px] font-bold rounded uppercase flex items-center gap-1"
                                        >
                                            <UploadCloud size={10} /> Recognized
                                        </motion.div>
                                    )}
                                </div>

                                {/* Next Payer Alert */}
                                <div className="p-4 bg-[var(--color-secondary)]/10 border-l-4 border-[var(--color-secondary)] rounded-r-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-[var(--color-secondary)] uppercase font-bold tracking-wider mb-1">Payer</p>
                                        <p className="text-lg font-bold flex items-center gap-2">
                                            {nextPayer}
                                            <span className="text-xs font-normal text-gray-500 bg-black/20 px-2 py-0.5 rounded-full">It's their turn</span>
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)]">
                                        <DollarSign size={20} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Winner</label>
                                        <div className="relative">
                                            <select 
                                                value={winner} 
                                                onChange={(e) => setWinner(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-lg focus:border-[var(--color-primary)] outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                                            >
                                                {players.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <User size={16} className="text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Loser</label>
                                        <div className="relative">
                                            <select 
                                                value={loser} 
                                                onChange={(e) => setLoser(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-lg focus:border-red-500 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                                            >
                                                {players.filter(p => p !== winner).map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <User size={16} className="text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Cost (VND)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₫</div>
                                        <input 
                                            type="number" 
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-10 text-2xl font-mono font-bold focus:border-[var(--color-accent)] outline-none transition-all placeholder:text-gray-700"
                                            required
                                        />
                                        {/* Quick selection tags */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            {[50000, 100000, 200000].map(amt => (
                                                <button 
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setCost(amt)}
                                                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {(amt/1000)}k
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-accent)]/30 transform hover:-translate-y-1 active:translate-y-0">
                                    Log Match
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MatchLogger;
