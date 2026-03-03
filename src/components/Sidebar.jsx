import { useState, memo } from "react";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  History,
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  Film,
  Swords,
} from "lucide-react";

const Sidebar = memo(({ activeTab, onTabChange }) => {
  const { theme, toggleTheme, nextPayer } = useGame();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "logmatch", label: "Log Match (3P)", icon: Plus },
    { id: "1v1", label: "1v1 Match", icon: Swords },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "history", label: "Match History", icon: History },
    { id: "highlights", label: "Highlights", icon: Film },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 250 }}
      className="hidden md:flex h-screen bg-[var(--color-surface)]/80 backdrop-blur-xl border-r border-[var(--color-border)] flex-col sticky top-0 z-40 transition-all shadow-2xl"
    >
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dim)] flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <span className="font-display font-bold text-black text-xl">P</span>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-xl whitespace-nowrap tracking-wide"
          >
            Pool
            <span className="text-[var(--color-primary)] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
              Stats
            </span>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden cursor-pointer ${
                isActive
                  ? "bg-[var(--color-primary)] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  : "text-[var(--color-text-dim)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-text-main)] hover:pl-5"
              }`}
            >
              <Icon
                size={20}
                className={`transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />

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
                  className="absolute right-3 w-1.5 h-1.5 rounded-full bg-black animate-pulse"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-[var(--color-border)] space-y-2">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-[var(--color-highlight)] text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] transition-colors border border-transparent hover:border-[var(--color-border)] cursor-pointer"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.div>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
