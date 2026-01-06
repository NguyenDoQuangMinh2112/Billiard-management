import {
  LayoutDashboard,
  Trophy,
  History,
  Settings,
  Plus,
  Film,
} from "lucide-react";
import { motion } from "framer-motion";

const MobileNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "logmatch", label: "Log", icon: Plus },
    { id: "leaderboard", label: "Ranks", icon: Trophy },
    { id: "history", label: "History", icon: History },
    { id: "highlights", label: "Videos", icon: Film },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-[var(--color-border)] pb-safe block md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-center p-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative w-16 cursor-pointer ${
                isActive
                  ? "text-[var(--color-primary)] font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  : "text-[var(--color-text-dim)] hover:text-[var(--color-text-main)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/10 to-transparent rounded-xl border-t border-[var(--color-primary)]/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "animate-pulse" : ""}
              />
              <span className="text-[10px] tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for notched phones if needed via pb-safe class usage or padding */}
      <div className="h-4 w-full" />
    </div>
  );
};

export default MobileNav;
