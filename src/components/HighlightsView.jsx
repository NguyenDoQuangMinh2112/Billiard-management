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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <Film className="text-[var(--color-primary)]" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Highlights
                        </span>
                    </h1>
                     <p className="text-[var(--color-text-dim)] mt-1">Best moments and replays</p>
                </div>
                
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    Add Highlight
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {highlights.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-[var(--color-text-dim)] bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <Video size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No highlights yet.</p>
                            <button onClick={() => setIsAddModalOpen(true)} className="text-[var(--color-primary)] hover:underline mt-2">
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
                                    className="glass-panel group rounded-2xl overflow-hidden flex flex-col"
                                >
                                    {/* Thumbnail Area */}
                                    <div className="relative aspect-video bg-black/50 group">
                                        {item.thumbnail ? (
                                            <img 
                                                src={item.thumbnail} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <Video size={40} />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <button 
                                                onClick={() => setSelectedVideo(item)}
                                                className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black shadow-lg transform scale-90 group-hover:scale-110 transition-transform"
                                            >
                                                <Play size={20} fill="currentColor" />
                                            </button>
                                        </div>
                                        
                                        {item.type === 'youtube' && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1">
                                                <Youtube size={12} /> YouTube
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-500/50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {match && (
                                            <div className="mt-auto pt-3 border-t border-white/10">
                                                <div className="text-xs text-[var(--color-text-dim)] mb-1 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Match from {new Date(match.date).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {Array.isArray(match.winners) ? match.winners.join(', ') : match.winner} 
                                                    <span className="text-[var(--color-text-dim)] mx-1">vs</span> 
                                                    {match.loser}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="mt-2 text-xs text-[var(--color-text-dim)]">
                                            Added {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={(e) => {
                            if(e.target === e.currentTarget) setIsAddModalOpen(false);
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold font-display">Add New Highlight</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-text-dim)] hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddHighlight} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-dim)] mb-1">
                                        Video URL (YouTube preferred)
                                    </label>
                                    <div className="relative">
                                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" size={18} />
                                        <input 
                                            type="url" 
                                            required
                                            value={newVideoUrl}
                                            onChange={e => setNewVideoUrl(e.target.value)}
                                            placeholder="https://youtube.com/..."
                                            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-dim)] mb-1">
                                        Title / Description
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newVideoTitle}
                                        onChange={e => setNewVideoTitle(e.target.value)}
                                        placeholder="Epic comeback..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-dim)] mb-1">
                                        Link to Match (Optional)
                                    </label>
                                    <select 
                                        value={selectedMatchId}
                                        onChange={e => setSelectedMatchId(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none"
                                    >
                                        <option value="">-- No Match Linked --</option>
                                        {matches.slice(0, 20).map(m => (
                                            <option key={m.id} value={m.id}>
                                                {new Date(m.date).toLocaleDateString()} - {Array.isArray(m.winners) ? m.winners.join(', ') : m.winner} vs {m.loser}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:opacity-90 transition-opacity mt-4"
                                >
                                    Add Video
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={(e) => {
                            if(e.target === e.currentTarget) setSelectedVideo(null);
                        }}
                    >
                        <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
                            <button 
                                onClick={() => setSelectedVideo(null)} 
                                className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
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
