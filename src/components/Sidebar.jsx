import { useState } from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Plus,
  Film
} from "lucide-react";

const Sidebar = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme, nextPayer } = useGame();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "logmatch", label: "Log Match", icon: Plus },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "history", label: "Match History", icon: History },
    { id: "highlights", label: "Highlights", icon: Film },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 250 }}
      className="hidden md:flex h-screen bg-[var(--color-surface)] border-r border-[var(--color-border,rgba(255,255,255,0.05))] flex-col sticky top-0 z-40 transition-all shadow-sm"
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                isActive
                  ? "bg-[var(--color-primary)] text-black font-bold shadow-lg shadow-[var(--color-primary)]/20"
                  : "text-[var(--color-text-dim)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-text-main)]"
              }`}
            >
              <Icon size={20} className={isActive ? "text-black" : ""} />

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
      <div className="p-4 border-t border-[var(--color-border,rgba(255,255,255,0.05))] space-y-2">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-[var(--color-highlight)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
