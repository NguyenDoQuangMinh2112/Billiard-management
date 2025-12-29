import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, DollarSign, X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useState, useRef, useEffect } from 'react';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAllAsRead, clearNotifications } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            markAllAsRead();
        }
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }).format(new Date(date));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon & Badge */}
            <button 
                onClick={toggleDropdown}
                className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[var(--color-surface)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                Notifications
                                <span className="text-xs font-normal text-gray-500 bg-black/20 px-2 py-0.5 rounded-full">
                                    {notifications.length}
                                </span>
                            </h3>
                            {notifications.length > 0 && (
                                <button 
                                    onClick={clearNotifications}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={12} /> Clear all
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                        <Bell size={20} className="opacity-50" />
                                    </div>
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className={`p-4 hover:bg-white/5 transition-colors group relative ${!notif.read ? 'bg-[var(--color-primary)]/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Icon based on type */}
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                                                    notif.type === 'payment' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {notif.type === 'payment' ? <DollarSign size={18} /> : <Check size={18} />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                                            {formatDate(notif.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 leading-relaxed break-words">
                                                        {notif.message}
                                                    </p>
                                                    
                                                    {/* Context Data Visualization */}
                                                    {notif.data && notif.data.currentPayer && (
                                                        <div className="mt-2 text-[10px] flex items-center gap-2">
                                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                                                                {notif.data.currentPayer}
                                                            </span>
                                                            <span className="text-gray-600">→</span>
                                                            <span className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-1.5 py-0.5 rounded font-bold border border-[var(--color-primary)]/20">
                                                                {notif.data.nextPayer}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Unread Indicator */}
                                            {!notif.read && (
                                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/50" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
