import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Loader, UploadCloud, DollarSign, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import Tesseract from 'tesseract.js';
import ScoreBoard from './ScoreBoard';

const LogMatchView = () => {
    const { players, matches, addMatch, nextPayer } = useGame();
    const { success, error: showError } = useToast();
    
    // AI Scanning States
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');
    
    // Bill and submission
    const [billCost, setBillCost] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Live scores from ScoreBoard
    const [liveScores, setLiveScores] = useState(null);

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

        for (let line of lines) {
            const lowerLine = line.toLowerCase();
            if (keywords.some(k => lowerLine.includes(k))) {
                const numbers = line.match(/[\d,.]+/g);
                if (numbers) {
                    const lastNum = numbers[numbers.length - 1];
                    const cleanNum = lastNum.replace(/\D/g, ''); 
                    
                    if (cleanNum.length > 3) {
                         foundAmount = cleanNum;
                         break; 
                    }
                }
            }
        }

        if (!foundAmount) {
             setScanStatus('Could not find strict "Total". Please verify.');
        } else {
             setBillCost(foundAmount);
             setScanStatus('Bill Recognized!');
             success(`Detected amount: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(foundAmount)}`);
        }
    };

    const handleSubmit = async () => {
        // Validate bill cost
        if (!billCost || parseFloat(billCost) <= 0) {
            showError('Please enter a valid bill amount');
            return;
        }

        // Validate that we have live scores
        if (!liveScores) {
            showError('Please update the scoreboard first');
            return;
        }

        // Calculate winner based on score differential (wins - losses)
        let winner = null;
        let loser = null;
        let maxDiff = -Infinity;
        let minDiff = Infinity;

        Object.entries(liveScores).forEach(([player, scores]) => {
            const diff = scores.wins - scores.losses;
            if (diff > maxDiff) {
                maxDiff = diff;
                winner = player;
            }
            if (diff < minDiff) {
                minDiff = diff;
                loser = player;
            }
        });

        // Check if there's a clear winner
        if (!winner || !loser || winner === loser) {
            showError('Unable to determine winner. Scores may be tied.');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await addMatch({
                winner,
                loser,
                cost: parseFloat(billCost)
            });

            if (result && result.success) {
                success(`Match logged! ${winner} wins! 🎉`);
                // Reset form
                setBillCost('');
                setScanStatus('');
            } else {
                showError(result?.error || 'Failed to log match. Please try again.');
            }
        } catch (err) {
            console.error('Error submitting match:', err);
            showError('Failed to log match. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-display font-bold mb-2">Log Match Result</h1>
                <p className="text-[var(--color-text-dim)] mb-8">Track your live billiard scores</p>

                {/* Live Scoreboard */}
                <div className="mb-8">
                    <ScoreBoard 
                        players={players} 
                        matches={matches}
                        onScoreUpdate={setLiveScores}
                    /> 
                </div>

                {/* Bill Input & Submit Section */}
                <div className="glass-panel p-8 rounded-2xl mb-6">
                    <h3 className="text-lg font-bold mb-4">Finalize Match</h3>
                    
                    {/* Next Payer Info */}
                    <div className="p-4 bg-[var(--color-secondary)]/10 border-l-4 border-[var(--color-secondary)] rounded-r-xl flex items-center justify-between mb-6">
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

                    {/* Bill Cost Input */}
                    <div className="space-y-2 mb-6">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Bill (VND)</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₫</div>
                            <input 
                                type="number" 
                                value={billCost}
                                onChange={(e) => setBillCost(e.target.value)}
                                placeholder="0"
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-10 text-2xl font-mono font-bold focus:border-[var(--color-accent)] outline-none transition-all placeholder:text-gray-700"
                            />
                            {/* Quick selection tags */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                {[50000, 100000, 200000].map(amt => (
                                    <button 
                                        key={amt}
                                        type="button"
                                        onClick={() => setBillCost(amt.toString())}
                                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-gray-400 hover:text-white transition-colors"
                                    >
                                        {(amt/1000)}k
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !billCost}
                        className="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-accent)]/30 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Trophy size={20} />
                                Submit Match Result
                            </>
                        )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-3">
                        Winner will be auto-calculated based on highest score differential (W - L)
                    </p>
                </div>

                {/* AI Scanner Section */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4">Bill Scanner (Optional)</h3>
                    <div className="relative group">
                        <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${isScanning ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'}`}>
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
                                        <p className="font-bold text-sm">AI Bill Scanner</p>
                                        <p className="text-xs text-gray-400">Upload receipt image to auto-fill bill amount</p>
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
                </div>
            </div>
        </div>
    );
};

export default LogMatchView;
