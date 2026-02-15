import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, DollarSign, User, Trophy, ScanLine, Loader, UploadCloud, Hash, ChevronDown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import Tesseract from 'tesseract.js';

const MatchLogger = ({ isOpen, onClose }) => {
    const { players, nextPayer, addMatch } = useGame();
    const { success, error: showError } = useToast();
    
    // Default to first two players if available
    const [numPlayers, setNumPlayers] = useState(2);
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [player3, setPlayer3] = useState('');
    const [score1, setScore1] = useState('');
    const [score2, setScore2] = useState('');
    const [score3, setScore3] = useState('');
    
    const [cost, setCost] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // AI Scanning States
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');

    // Initialize players when list loads
    useEffect(() => {
        if (players.length >= 2 && !player1 && !player2) {
            setPlayer1(players[0]);
            setPlayer2(players[1]);
            if (players.length >= 3) {
                setPlayer3(players[2]);
            }
        }
    }, [players]);

    const validateForm = () => {
        const newErrors = {};

        // Validate players
        const selectedPlayers = [player1, player2];
        if (numPlayers === 3) selectedPlayers.push(player3);

        if (selectedPlayers.some(p => !p)) {
            newErrors.players = 'Please select all players';
        } else if (new Set(selectedPlayers).size !== selectedPlayers.length) {
            newErrors.players = 'Players must be different';
        }

        // Validate scores
        const scores = [score1, score2];
        if (numPlayers === 3) scores.push(score3);

        if (scores.some(s => s === '')) {
            newErrors.scores = 'Please enter scores for all players';
        } else {
            const parsedScores = scores.map(s => parseInt(s));
            if (parsedScores.some(s => isNaN(s) || s < 0)) {
                newErrors.scores = 'Scores must be valid positive numbers';
            } else {
                // Check for unique winner
                const maxScore = Math.max(...parsedScores);
                const winners = parsedScores.filter(s => s === maxScore);
                if (winners.length > 1) {
                    newErrors.scores = 'Draws for 1st place are not allowed. Someone must win!';
                }
            }
        }

        // Validate cost
        if (!cost || String(cost).trim() === '') {
            newErrors.cost = 'Cost is required';
        } else if (parseFloat(cost) <= 0) {
            newErrors.cost = 'Cost must be greater than 0';
        } else if (parseFloat(cost) > 10000000) {
            newErrors.cost = 'Cost seems too high. Please verify.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showError('Please fix the errors before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            const s1 = parseInt(score1);
            const s2 = parseInt(score2);
            const s3 = numPlayers === 3 ? parseInt(score3) : -1;
            
            const participants = [
                { name: player1, score: s1 },
                { name: player2, score: s2 }
            ];
            if (numPlayers === 3) {
                participants.push({ name: player3, score: s3 });
            }

            // Sort by score descending
            participants.sort((a, b) => b.score - a.score);

            const winner = participants[0].name;
            const loser = participants[participants.length - 1].name;

            const result = await addMatch({
                winner,
                loser,
                cost: parseFloat(cost)
            });

            if (result && result.success) {
                success(`Match logged! ${winner} wins! 🎉`);
                // Reset form
                setCost('');
                setScore1('');
                setScore2('');
                setScore3('');
                setScanStatus('');
                setErrors({});
                onClose();
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
                        <div className="glass-panel w-full rounded-3xl p-6 md:p-8 shadow-2xl relative pointer-events-auto overflow-hidden text-[var(--color-text-main)] border border-[var(--color-border)]">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 blur-[80px] rounded-full pointer-events-none" />

                            <button 
                                onClick={onClose} 
                                aria-label="Close modal"
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-[var(--color-text-dim)] hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 flex items-center gap-3">
                                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dim)] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                                    <Trophy size={24} strokeWidth={2.5} />
                                </span>
                                Log Match Result
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* AI Scanner Section */}
                                <div className="relative group">
                                    <div 
                                        role="button"
                                        tabIndex={0}
                                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all min-h-[140px] ${isScanning ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-black/20 hover:bg-black/40'}`}
                                    >
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileUpload} 
                                            disabled={isScanning}
                                            aria-label="Upload receipt for AI scanning"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait z-10"
                                        />
                                        
                                        {isScanning ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="relative">
                                                    <Loader className="animate-spin text-[var(--color-primary)]" size={32} />
                                                    <div className="absolute inset-0 animate-ping opacity-50 bg-[var(--color-primary)] rounded-full" />
                                                </div>
                                                <div className="text-sm font-bold text-[var(--color-primary)] tracking-wide">{scanStatus}</div>
                                                <div className="w-48 h-1.5 bg-black/50 rounded-full mt-2 overflow-hidden">
                                                    <div className="h-full bg-[var(--color-primary)] transition-all duration-300 ease-out" style={{ width: `${scanProgress}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
                                                <div className="p-4 rounded-full bg-[var(--color-surface)] shadow-lg group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/10 group-hover:ring-[var(--color-primary)]/50">
                                                    <ScanLine size={28} className="text-[var(--color-text-dim)] group-hover:text-[var(--color-primary)] transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-base group-hover:text-[var(--color-primary)] transition-colors">AI Auto-Fill Bill</p>
                                                    <p className="text-sm text-[var(--color-text-dim)] mt-1">Tap to scan receipt total</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Success Indicator */}
                                    {!isScanning && scanStatus === 'Bill Recognized!' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute -top-3 right-4 px-3 py-1.5 bg-green-500 text-black text-xs font-bold rounded-full uppercase flex items-center gap-1.5 shadow-lg shadow-green-500/20"
                                        >
                                            <UploadCloud size={12} /> Recognized
                                        </motion.div>
                                    )}
                                </div>

                                {/* Next Payer Alert */}
                                <div className="p-5 bg-gradient-to-r from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/5 border-l-4 border-[var(--color-secondary)] rounded-r-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-[var(--color-secondary)] uppercase font-bold tracking-widest mb-1.5">Current Payer</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-xl font-bold text-white">{nextPayer}</p>
                                            <span className="text-[10px] font-bold text-black bg-[var(--color-secondary)] px-2 py-0.5 rounded-full">TURN</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)]/20 ring-1 ring-[var(--color-secondary)]/40 flex items-center justify-center text-[var(--color-secondary)] shadow-[0_0_15px_rgba(112,0,223,0.3)]">
                                        <DollarSign size={24} />
                                    </div>
                                </div>

                                {/* Player Scores Section */}
                                <div className="space-y-6">
                                    {/* Mode Toggle */}
                                    <div className="flex justify-center">
                                        <div className="bg-black/30 p-1.5 rounded-xl flex gap-1 border border-white/10">
                                            {[2, 3].map(count => (
                                                <button
                                                    key={count}
                                                    type="button"
                                                    onClick={() => setNumPlayers(count)}
                                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                                                        numPlayers === count 
                                                            ? 'bg-[var(--color-primary)] text-black shadow-lg shadow-[var(--color-primary)]/20' 
                                                            : 'text-[var(--color-text-dim)] hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    {count} Players
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Players Grid */}
                                    <div className="space-y-4">
                                        {[player1, player2, player3].slice(0, numPlayers).map((currentUser, idx) => {
                                            const setPlayer = [setPlayer1, setPlayer2, setPlayer3][idx];
                                            const score = [score1, score2, score3][idx];
                                            const setScore = [setScore1, setScore2, setScore3][idx];
                                            
                                            // Accessibility label for inputs
                                            const playerLabel = `Player ${idx + 1}`;
                                            const scoreLabel = `Score for Player ${idx + 1}`;

                                            return (
                                                <div key={idx} className="flex items-end gap-3 md:gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider ml-1">{playerLabel}</label>
                                                        <div className="relative group">
                                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)] group-focus-within:text-[var(--color-primary)] transition-colors">
                                                                <User size={20} />
                                                            </div>
                                                            <select 
                                                                value={currentUser} 
                                                                onChange={(e) => setPlayer(e.target.value)}
                                                                aria-label={playerLabel}
                                                                className={`w-full bg-black/20 border ${errors.players ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-10 text-lg focus:border-[var(--color-primary)] outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors`}
                                                            >
                                                                <option value="" disabled>Select Player</option>
                                                                {players.map(p => (
                                                                    <option key={p} value={p}>{p}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                                <ChevronDown size={18} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-28 space-y-2">
                                                        <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider text-center block">Wins</label>
                                                        <input 
                                                            type="number" 
                                                            value={score}
                                                            onChange={(e) => setScore(e.target.value)}
                                                            placeholder="0"
                                                            aria-label={scoreLabel}
                                                            className={`w-full bg-black/20 border ${errors.scores ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-4 text-xl font-mono font-bold text-center focus:border-[var(--color-primary)] outline-none transition-all hover:bg-white/5`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {(errors.players || errors.scores) && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {errors.players || errors.scores}
                                    </div>
                                )}

                                <div className="space-y-3 pt-2">
                                    <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider ml-1">Total Bill Amount</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] group-focus-within:text-[var(--color-accent)] font-bold text-xl transition-colors">₫</div>
                                        <input 
                                            type="number" 
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            placeholder="0"
                                            required
                                            aria-label="Total cost in VND"
                                            className={`w-full bg-black/30 border ${errors.cost ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-5 pl-12 text-3xl font-mono font-bold focus:border-[var(--color-accent)] outline-none transition-all placeholder:text-white/10`}
                                        />
                                        {/* Quick Amount Pills */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                            {[50000, 100000, 200000].map(amt => (
                                                <button 
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setCost(amt)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-[var(--color-accent)]/20 border border-white/5 hover:border-[var(--color-accent)] rounded-lg text-xs font-medium text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-all hidden sm:block"
                                                >
                                                    {(amt/1000)}k
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.cost && (
                                        <p className="text-xs text-red-500 font-medium ml-1">{errors.cost}</p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-black font-box font-black text-xl rounded-2xl transition-all shadow-[0_4px_20px_rgba(0,240,255,0.2)] hover:shadow-[0_4px_30px_rgba(57,255,20,0.4)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="animate-spin" size={24} />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        'LOG MATCH'
                                    )}
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
