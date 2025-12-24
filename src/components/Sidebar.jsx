import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, Trophy, History, Settings, LogOut, ChevronRight, ChevronLeft, Sun, Moon } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
    const { theme, toggleTheme } = useGame();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'history', label: 'Match History', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <motion.div 
            animate={{ width: collapsed ? 80 : 250 }}
            className="h-screen bg-[var(--color-surface)] border-r border-white/5 flex flex-col sticky top-0 z-40 transition-all"
        >
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex-shrink-0 flex items-center justify-center">
                    <span className="font-display font-bold text-black text-xl">P</span>
                </div>
                {!collapsed && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="font-display font-bold text-xl whitespace-nowrap"
                    >
                        Pool<span className="text-[var(--color-primary)]">Stats</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive ? 'bg-[var(--color-primary)] text-black font-bold shadow-lg shadow-[var(--color-primary)]/20' : 'text-[var(--color-text-dim)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-text-main)]'}`}
                        >
                            <Icon size={20} className={isActive ? 'text-black' : ''} />
                            
                            {!collapsed && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            
                            {isActive && !collapsed && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-black"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Area */}
            <div className="p-4 border-t border-white/5 space-y-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'light' ? 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400' : 'bg-blue-500/10 text-blue-400'} hover:scale-[1.02]`}
                    title="Toggle Theme"
                >
                    {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                    {!collapsed && (
                        <span className="font-bold text-sm">
                            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    )}
                </button>

                {/* Collapse Toggle */}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
