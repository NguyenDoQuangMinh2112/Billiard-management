import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import NotificationDropdown from "./NotificationDropdown";
import {
  LayoutDashboard,
  Plus,
  Swords,
  Trophy,
  History,
  Film,
  Settings,
  Clock,
  Sun,
  Moon,
} from "lucide-react";

const PAGE_META = {
  dashboard: {
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "var(--color-primary)",
  },
  logmatch: { label: "Log Match", icon: Plus, color: "var(--color-secondary)" },
  "1v1": { label: "1v1 Match", icon: Swords, color: "var(--color-accent)" },
  leaderboard: { label: "Leaderboard", icon: Trophy, color: "#facc15" },
  history: {
    label: "Match History",
    icon: History,
    color: "var(--color-primary)",
  },
  highlights: { label: "Highlights", icon: Film, color: "#f472b6" },
  settings: {
    label: "Settings",
    icon: Settings,
    color: "var(--color-text-dim)",
  },
};

const LiveClock = memo(() => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm tabular-nums text-[var(--color-text-dim)]">
      {time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </span>
  );
});
LiveClock.displayName = "LiveClock";

const Header = memo(({ title }) => {
  const { theme, toggleTheme } = useGame();
  const tab = title?.toLowerCase().replace(" ", "") || "dashboard";
  const meta = PAGE_META[tab] || PAGE_META["dashboard"];
  const PageIcon = meta.icon;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
      {/* Left — breadcrumb + page title */}
      <div className="flex items-center gap-3">
        <motion.div
          key={tab}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="p-2 rounded-xl"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          <PageIcon size={18} strokeWidth={2.5} />
        </motion.div>

        <motion.div
          key={`title-${tab}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h2
            className="text-base font-bold font-display tracking-wide leading-none"
            style={{ color: meta.color }}
          >
            {meta.label}
          </h2>
          <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5 hidden sm:block">
            Pool Stats &rsaquo; {meta.label}
          </p>
        </motion.div>
      </div>

      {/* Right — clock + notifications + avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Live clock — hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-[var(--color-border)]">
          <Clock size={13} className="text-[var(--color-text-dim)]" />
          <LiveClock />
        </div>

        {/* Theme toggle */}
        {toggleTheme && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--color-border)] text-[var(--color-text-dim)] hover:text-white transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        <NotificationDropdown />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-[1.5px] shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer">
          <div className="w-full h-full rounded-[10px] bg-[var(--color-surface)] flex items-center justify-center overflow-hidden group relative">
            <span className="font-black text-xs text-white group-hover:scale-110 transition-transform select-none">
              U
            </span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-[10px]" />
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
