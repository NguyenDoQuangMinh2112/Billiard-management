import { memo } from "react";
import { LayoutDashboard, Trophy, History, Plus, Swords } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "logmatch", label: "Log", icon: Plus },
  { id: "1v1", label: "1v1", icon: Swords },
  { id: "leaderboard", label: "Ranks", icon: Trophy },
  { id: "history", label: "History", icon: History },
];

const MobileNav = memo(({ activeTab, onTabChange }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Top neon line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent" />

      <div className="bg-[var(--color-surface)]/90 backdrop-blur-2xl">
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl relative min-w-0 flex-1 cursor-pointer transition-all duration-200 active:scale-90"
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-bg"
                    className="absolute inset-0 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={{
                    color: isActive
                      ? "var(--color-primary)"
                      : "var(--color-text-dim)",
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.span>

                {/* Label */}
                <motion.span
                  animate={{
                    color: isActive
                      ? "var(--color-primary)"
                      : "var(--color-text-dim)",
                  }}
                  transition={{ duration: 0.15 }}
                  className="text-[9px] font-semibold tracking-wide relative"
                >
                  {tab.label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

MobileNav.displayName = "MobileNav";
export default MobileNav;
