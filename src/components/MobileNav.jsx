import { LayoutDashboard, Trophy, History, Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";

const MobileNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "logmatch", label: "Log", icon: Plus },
    { id: "leaderboard", label: "Ranks", icon: Trophy },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] border-t border-[var(--color-border,rgba(255,255,255,0.05))] pb-safe block md:hidden shadow-lg">
      <div className="flex justify-around items-center p-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative w-16 ${
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-dim)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area spacer for notched phones if needed via pb-safe class usage or padding */}
      <div className="h-1 w-full" />
    </div>
  );
};

export default MobileNav;
