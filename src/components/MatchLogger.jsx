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
                        <div className="bg-[var(--color-surface)] w-full border border-[var(--color-highlight)] rounded-2xl p-6 shadow-2xl relative pointer-events-auto overflow-hidden text-[var(--color-text-main)]">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 blur-[80px] rounded-full pointer-events-none" />

                            <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors">
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
                                    <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${isScanning ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-highlight)] hover:border-[var(--color-text-dim)] bg-[var(--color-background)] hover:bg-[var(--color-highlight)]'}`}>
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
                                                <div className="p-3 rounded-full bg-[var(--color-highlight)] group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors">
                                                    <ScanLine size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">AI Auto-Fill</p>
                                                    <p className="text-xs text-[var(--color-text-dim)]">Upload receipt image to extract total</p>
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
                                            <span className="text-xs font-normal text-[var(--color-text-dim)] bg-[var(--color-background)] px-2 py-0.5 rounded-full">It's their turn</span>
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)]">
                                        <DollarSign size={20} />
                                    </div>
                                </div>

                                {/* Player Scores Section */}
                                <div className="space-y-4">
                                    {/* Mode Toggle */}
                                    <div className="flex justify-center mb-2">
                                        <div className="bg-[var(--color-background)] p-1 rounded-lg flex gap-1 border border-[var(--color-highlight)]">
                                            <button
                                                type="button"
                                                onClick={() => setNumPlayers(2)}
                                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${numPlayers === 2 ? 'bg-[var(--color-primary)] text-black shadow-lg' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]'}`}
                                            >
                                                2 Players
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNumPlayers(3)}
                                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${numPlayers === 3 ? 'bg-[var(--color-primary)] text-black shadow-lg' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]'}`}
                                            >
                                                3 Players
                                            </button>
                                        </div>
                                    </div>

                                    {/* Player 1 */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider">Player 1</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                    <User size={18} />
                                                </div>
                                                <select 
                                                    value={player1} 
                                                    onChange={(e) => setPlayer1(e.target.value)}
                                                    className={`w-full bg-[var(--color-background)] border ${errors.players ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl py-3 pl-10 pr-10 text-lg focus:border-[var(--color-primary)] outline-none appearance-none cursor-pointer hover:bg-[var(--color-highlight)] transition-colors`}
                                                >
                                                    <option value="" disabled>Select Player</option>
                                                    {players.map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider text-center block">Wins</label>
                                            <input 
                                                type="number" 
                                                value={score1}
                                                onChange={(e) => setScore1(e.target.value)}
                                                placeholder="0"
                                                className={`w-full bg-[var(--color-background)] border ${errors.scores ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl p-3 text-lg font-mono font-bold text-center focus:border-[var(--color-primary)] outline-none transition-all`}
                                            />
                                        </div>
                                    </div>

                                    {/* Player 2 */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider">Player 2</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                    <User size={18} />
                                                </div>
                                                <select 
                                                    value={player2} 
                                                    onChange={(e) => setPlayer2(e.target.value)}
                                                    className={`w-full bg-[var(--color-background)] border ${errors.players ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl py-3 pl-10 pr-10 text-lg focus:border-[var(--color-primary)] outline-none appearance-none cursor-pointer hover:bg-[var(--color-highlight)] transition-colors`}
                                                >
                                                    <option value="" disabled>Select Player</option>
                                                    {players.map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider text-center block">Wins</label>
                                            <input 
                                                type="number" 
                                                value={score2}
                                                onChange={(e) => setScore2(e.target.value)}
                                                placeholder="0"
                                                className={`w-full bg-[var(--color-background)] border ${errors.scores ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl p-3 text-lg font-mono font-bold text-center focus:border-[var(--color-primary)] outline-none transition-all`}
                                            />
                                        </div>
                                    </div>

                                    {/* Player 3 (Conditional) */}
                                    <AnimatePresence>
                                        {numPlayers === 3 && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-end gap-3 overflow-hidden"
                                            >
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider">Player 3</label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                            <User size={18} />
                                                        </div>
                                                        <select 
                                                            value={player3} 
                                                            onChange={(e) => setPlayer3(e.target.value)}
                                                            className={`w-full bg-[var(--color-background)] border ${errors.players ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl py-3 pl-10 pr-10 text-lg focus:border-[var(--color-primary)] outline-none appearance-none cursor-pointer hover:bg-[var(--color-highlight)] transition-colors`}
                                                        >
                                                            <option value="" disabled>Select Player</option>
                                                            {players.map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                                            <ChevronDown size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider text-center block">Wins</label>
                                                    <input 
                                                        type="number" 
                                                        value={score3}
                                                        onChange={(e) => setScore3(e.target.value)}
                                                        placeholder="0"
                                                        className={`w-full bg-[var(--color-background)] border ${errors.scores ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl p-3 text-lg font-mono font-bold text-center focus:border-[var(--color-primary)] outline-none transition-all`}
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {(errors.players || errors.scores) && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.players || errors.scores}</p>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider">Total Cost (VND)</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] font-bold text-lg">₫</div>
                                        <input 
                                            type="number" 
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            placeholder="0"
                                            className={`w-full bg-[var(--color-background)] border ${errors.cost ? 'border-red-500' : 'border-[var(--color-highlight)]'} rounded-xl p-4 pl-10 text-2xl font-mono font-bold focus:border-[var(--color-accent)] outline-none transition-all placeholder:text-[var(--color-text-dim)]`}
                                            required
                                        />
                                        {/* Quick selection tags */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            {[50000, 100000, 200000].map(amt => (
                                                <button 
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setCost(amt)}
                                                    className="px-2 py-1 bg-[var(--color-highlight)] hover:bg-[var(--color-primary)]/20 rounded text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors"
                                                >
                                                    {(amt/1000)}k
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {errors.cost && (
                                        <p className="text-xs text-red-500 font-medium">{errors.cost}</p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-accent)]/30 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            Logging...
                                        </>
                                    ) : (
                                        'Log Match'
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
