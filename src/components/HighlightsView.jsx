import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { 
    Play, 
    Plus, 
    Trash2, 
    Video, 
    Calendar,
    X,
    ExternalLink,
    Film,
    Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const HighlightsView = () => {
    const { matches } = useGame();
    const [highlights, setHighlights] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Form State
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [selectedMatchId, setSelectedMatchId] = useState('');

    // Load highlights from local storage
    useEffect(() => {
        const saved = localStorage.getItem('pool_highlights');
        if (saved) {
            try {
                setHighlights(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse highlights", e);
            }
        }
    }, []);

    // Save highlights to local storage
    useEffect(() => {
        localStorage.setItem('pool_highlights', JSON.stringify(highlights));
    }, [highlights]);

    const handleAddHighlight = (e) => {
        e.preventDefault();
        
        let thumbnail = null;
        let type = 'video';
        const ytId = getYoutubeId(newVideoUrl);
        
        if (ytId) {
            type = 'youtube';
            thumbnail = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
        }

        const newHighlight = {
            id: Date.now(),
            url: newVideoUrl,
            title: newVideoTitle || 'Untitled Highlight',
            matchId: selectedMatchId || null,
            createdAt: new Date().toISOString(),
            type,
            thumbnail
        };

        setHighlights([newHighlight, ...highlights]);
        setNewVideoUrl('');
        setNewVideoTitle('');
        setSelectedMatchId('');
        setIsAddModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this highlight?')) {
            setHighlights(highlights.filter(h => h.id !== id));
        }
    };

    const getMatchDetails = (matchId) => {
        return matches.find(m => m.id === matchId);
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                     <h1 className="text-4xl md:text-5xl font-display font-bold flex items-center gap-3 text-gradient">
                        <Film className="hidden md:block text-[var(--color-primary)]" strokeWidth={2.5} />
                        Highlights
                    </h1>
                     <p className="text-[var(--color-text-dim)] mt-2 text-lg font-light">Best moments and replays from your matches</p>
                </div>
                
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-black font-black uppercase tracking-wider text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform hover:scale-105 active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    Add Highlight
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {highlights.length === 0 ? (
                        <div className="col-span-full py-24 text-center text-[var(--color-text-dim)] glass-panel rounded-3xl border border-[var(--color-border)] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/5 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                                <Video size={40} className="text-[var(--color-primary)] opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No highlights yet</h3>
                            <p className="max-w-md mx-auto mb-8 font-light">Start building your library of epic moments. Add your first match replay or highlight clip now.</p>
                            <button 
                                onClick={() => setIsAddModalOpen(true)} 
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[var(--color-primary)] font-bold rounded-xl transition-all border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50"
                            >
                                Add your first video
                            </button>
                        </div>
                    ) : (
                        highlights.map((item) => {
                            const match = getMatchDetails(item.matchId);
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="glass-panel group rounded-2xl overflow-hidden flex flex-col border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                                >
                                    {/* Thumbnail Area */}
                                    <div className="relative aspect-video bg-black/50 group overflow-hidden">
                                        {item.thumbnail ? (
                                            <img 
                                                src={item.thumbnail} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20 bg-gradient-to-br from-black to-[var(--color-surface)]">
                                                <Video size={40} />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors backdrop-blur-[2px] group-hover:backdrop-blur-none">
                                            <button 
                                                onClick={() => setSelectedVideo(item)}
                                                className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transform scale-90 group-hover:scale-110 transition-transform"
                                            >
                                                <Play size={24} fill="currentColor" className="ml-1" />
                                            </button>
                                        </div>
                                        
                                        {item.type === 'youtube' && (
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-lg">
                                                <Youtube size={12} /> YouTube
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <h3 className="font-bold text-lg leading-snug line-clamp-2 text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">{item.title}</h3>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="text-[var(--color-text-dim)] hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {match && (
                                            <div className="mt-auto pt-4 border-t border-white/5">
                                                <div className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] mb-1 flex items-center gap-1 tracking-wider">
                                                    <Calendar size={10} />
                                                    Match Info
                                                </div>
                                                <div className="text-sm font-medium flex items-center gap-2">
                                                    <span className="text-[var(--color-accent)]">{Array.isArray(match.winners) ? match.winners.join(', ') : match.winner}</span> 
                                                    <span className="text-[var(--color-text-dim)] text-xs">vs</span> 
                                                    <span className="text-red-400">{match.loser}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!match && (
                                            <div className="mt-auto pt-4 border-t border-white/5">
                                                 <div className="text-xs text-[var(--color-text-dim)] flex items-center gap-2 opacity-50">
                                                    <Calendar size={12} />
                                                    Added {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={(e) => {
                            if(e.target === e.currentTarget) setIsAddModalOpen(false);
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0f0f1a] w-full max-w-md rounded-2xl border border-[var(--color-border)] shadow-2xl relative overflow-hidden"
                        >
                             {/* Glossy overlay */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] opacity-50" />
                            
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-bold font-display flex items-center gap-2">
                                    <Plus className="text-[var(--color-primary)]" />
                                    Add New Highlight
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-text-dim)] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddHighlight} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
                                        Video URL (YouTube)
                                    </label>
                                    <div className="relative group/input">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] group-focus-within/input:text-[var(--color-primary)] transition-colors">
                                           <Video size={18} />
                                        </div>
                                        <input 
                                            type="url" 
                                            required
                                            value={newVideoUrl}
                                            onChange={e => setNewVideoUrl(e.target.value)}
                                            placeholder="https://youtube.com/..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:bg-black/60 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
                                        Title / Description
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newVideoTitle}
                                        onChange={e => setNewVideoTitle(e.target.value)}
                                        placeholder="e.g. Epic comeback vs Alex..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:bg-black/60 transition-all placeholder:text-white/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-2">
                                        Link to Match (Optional)
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={selectedMatchId}
                                            onChange={e => setSelectedMatchId(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:bg-black/60 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Select a match --</option>
                                            {matches.slice(0, 20).map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {new Date(m.date).toLocaleDateString()} • {Array.isArray(m.winners) ? m.winners.join(', ') : m.winner} vs {m.loser}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-dim)]">
                                            <Calendar size={14} />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 hover:scale-[1.02] active:scale-[0.98] transition-all mt-2"
                                >
                                    Add Video Highlight
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
                        onClick={(e) => {
                            if(e.target === e.currentTarget) setSelectedVideo(null);
                        }}
                    >
                        <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 ring-1 ring-white/5">
                            <button 
                                onClick={() => setSelectedVideo(null)} 
                                className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-red-500/80 rounded-full p-2 transition-all backdrop-blur-md"
                            >
                                <X size={24} />
                            </button>

                            {selectedVideo.type === 'youtube' && getYoutubeId(selectedVideo.url) ? (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.url)}?autoplay=1`}
                                    title={selectedVideo.title} 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <p className="mb-4 text-xl">We cannot direct embed this video type.</p>
                                    <a 
                                        href={selectedVideo.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200"
                                    >
                                        Open in New Tab <ExternalLink size={18} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HighlightsView;
