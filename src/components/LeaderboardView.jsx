import { useState, useEffect, memo } from "react";
import { useGame } from "../context/GameContext";
import { billiardAPI } from "../services/api";
import {
  Trophy,
  Medal,
  Award,
  DollarSign,
  TrendingUp,
  Crown,
  Star,
  Flame,
  Sparkles,
  Calendar,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const LeaderboardView = memo(() => {
  const { allStats } = useGame();
  const [sortKey, setSortKey] = useState("wins");
  const [viewMode, setViewMode] = useState("all"); // 'all' (Global) or 'today' (Daily)
  const [dailyStats, setDailyStats] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Fetch Daily Stats
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (viewMode === "today") {
        setLoadingDaily(true);
        try {
          const res = await billiardAPI.getStats({ timeframe: "daily" });
          if (!cancelled && res.success) setDailyStats(res.data);
        } catch (error) {
          if (!cancelled) console.error("Failed to fetch daily stats", error);
        } finally {
          if (!cancelled) setLoadingDaily(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  const currentStats = viewMode === "all" ? allStats : dailyStats;

  // Stats for Table
  const sortedStats = [...currentStats].sort((a, b) => {
    if (sortKey === "winRate") {
      const rateA = a.matchesPlayed ? a.wins / a.matchesPlayed : 0;
      const rateB = b.matchesPlayed ? b.wins / b.matchesPlayed : 0;
      return rateB - rateA;
    }
    return b[sortKey] - a[sortKey];
  });

  // Stats for Podium (Always sort by Wins first for the visual podium)
  const podiumStats = [...currentStats].sort((a, b) => b.wins - a.wins);
  const top1 = podiumStats[0];
  const top2 = podiumStats[1];
  const top3 = podiumStats[2];

  const getMedal = (index) => {
    if (index === 0) return <Trophy className="text-yellow-400" size={24} />;
    if (index === 1) return <Medal className="text-gray-300" size={24} />;
    if (index === 2) return <Award className="text-orange-400" size={24} />;
    return (
      <span className="font-mono text-[var(--color-text-dim)] font-bold">
        #{index + 1}
      </span>
    );
  };

  const PodiumSpot = ({ player, rank, delay }) => {
    if (!player) return <div className="w-1/3 invisible" />;

    const isFirst = rank === 1;

    // Configuration per rank
    const config = {
      1: {
        color: "yellow",
        baseGradient: "from-yellow-600 via-yellow-400 to-yellow-700",
        medalGradient: "from-yellow-300 via-yellow-500 to-yellow-700",
        glow: "shadow-[0_0_50px_rgba(234,179,8,0.6)]",
        beam: "bg-gradient-to-t from-yellow-500/20 to-transparent",
        ringColor: "border-yellow-400",
        height: "h-32",
        scale: 1.2,
      },
      2: {
        color: "cyan", // Silver/Cyan look from image
        baseGradient: "from-slate-400 via-cyan-300 to-slate-500",
        medalGradient: "from-slate-200 via-cyan-200 to-slate-400",
        glow: "shadow-[0_0_40px_rgba(34,211,238,0.4)]",
        beam: "bg-gradient-to-t from-cyan-400/10 to-transparent",
        ringColor: "border-cyan-400",
        height: "h-24",
        scale: 1,
      },
      3: {
        color: "orange", // Bronze/Orange
        baseGradient: "from-orange-700 via-orange-500 to-orange-800",
        medalGradient: "from-orange-300 via-orange-500 to-orange-700",
        glow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]",
        beam: "bg-gradient-to-t from-orange-500/10 to-transparent",
        ringColor: "border-orange-500",
        height: "h-20",
        scale: 0.9,
      },
    };

    const cfg = config[rank];

    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, type: "spring", bounce: 0.4 }}
        className={`flex flex-col items-center justify-end relative z-10 w-full md:w-1/3 ${
          isFirst ? "-mt-12 z-20" : ""
        }`}
      >
        {/* Floating Medal Section */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay,
          }} // Floating animation
          className="relative flex flex-col items-center mb-6"
        >
          {/* Crown for Winner */}
          {isFirst && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.5 }}
              className="absolute -top-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            >
              <Crown size={42} fill="currentColor" />
            </motion.div>
          )}

          {/* The Medal/Badge */}
          <div
            className={`
                        w-24 h-24 rounded-full bg-gradient-to-br ${cfg.medalGradient}
                        flex items-center justify-center relative
                        border-4 border-white/20 shadow-2xl ${cfg.glow}
                    `}
          >
            {/* Inner Ring */}
            <div className="absolute inset-1 rounded-full border-2 border-white/30" />

            {/* Rank Number */}
            <span className="text-4xl font-black text-white drop-shadow-md italic font-display">
              {rank}
            </span>

            {/* Decoration Wings (CSS Shapes) */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/10 skew-y-12 rounded-l-full blur-[1px]" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/10 -skew-y-12 rounded-r-full blur-[1px]" />
          </div>
        </motion.div>

        {/* Holographic Beam */}
        <div className="w-full h-16 relative flex justify-center items-end -mb-4">
          {/* The Cone Beam */}
          <div
            className={`
                        absolute bottom-0 w-24 h-28 
                        ${cfg.beam} blur-xl rounded-t-full opacity-60
                     `}
          />

          {/* Hologram Rings */}
          <div
            className={`absolute bottom-4 w-20 h-4 rounded-[100%] border ${cfg.ringColor} opacity-30 blur-[1px] animate-pulse`}
          />
          <div
            className={`absolute bottom-10 w-16 h-3 rounded-[100%] border ${cfg.ringColor} opacity-20 blur-[1px]`}
          />
        </div>

        {/* 3D Base Platform */}
        <div className="relative w-32 md:w-36 flex flex-col items-center group cursor-pointer perspective-[1000px]">
          {/* Player Name Floating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-12 z-30 whitespace-nowrap"
          >
            <span
              className={`text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10`}
            >
              {player.name}
            </span>
          </motion.div>

          {/* Top Face of Cylinder */}
          <div
            className={`
                        w-full h-12 rounded-[100%] 
                        bg-gradient-to-r ${cfg.baseGradient}
                        relative z-10 border-t border-white/40
                        flex items-center justify-center
                        shadow-[inset_0_-4px_10px_rgba(0,0,0,0.3)]
                    `}
          >
            {/* Inner circle on top face */}
            <div className="w-20 h-6 rounded-[100%] bg-black/10 blur-[1px]" />
          </div>

          {/* Side Face of Cylinder (The Height) */}
          <div
            className={`
                        w-full ${cfg.height} -mt-6 
                        bg-gradient-to-b ${cfg.baseGradient}
                        flex flex-col items-center justify-start relative
                    `}
          >
            {/* Shine effect on cylinder */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-white/10 to-black/40" />

            {/* Winner Label - Absolutely positioned for perfection */}
            {isFirst && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-black/40 px-3 py-1 rounded text-yellow-200 text-[10px] font-bold uppercase tracking-[0.2em] border border-yellow-400/40 shadow-lg backdrop-blur-sm">
                  Winner
                </div>
              </div>
            )}

            {/* Stats on Base */}
            <div className="absolute bottom-4 text-white/90 font-mono font-bold text-sm z-20 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {player.wins} Wins
            </div>
          </div>

          {/* Bottom Face of Cylinder */}
          <div
            className={`
                        absolute -bottom-3 w-full h-12 rounded-[100%] 
                        bg-black/60 z-0 blur-sm scale-95
                    `}
          />
          <div
            className={`
                        absolute -bottom-1 w-[101%] h-12 rounded-[100%] 
                        bg-gradient-to-r ${cfg.baseGradient} brightness-50 z-0
                    `}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 overflow-hidden min-h-screen">
      <div className="flex flex-col items-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-center text-gradient mb-4 flex items-center gap-3">
          <Trophy
            className="text-[var(--color-accent)] hidden md:block"
            strokeWidth={2.5}
            size={36}
          />
          Leaderboard
        </h1>
        <p className="text-[var(--color-text-dim)] text-lg text-center font-light max-w-md">
          Who rules the table? See the top performers and stats.
        </p>
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center mb-12">
        <div className="p-1 rounded-full bg-white/5 border border-white/10 flex items-center relative gap-1">
          <button
            onClick={() => setViewMode("all")}
            className={`
                            relative px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all z-10 cursor-pointer
                            ${
                              viewMode === "all"
                                ? "text-white"
                                : "text-gray-500 hover:text-gray-300"
                            }
                        `}
          >
            {viewMode === "all" && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-[var(--color-primary)] rounded-full -z-10 shadow-lg shadow-blue-500/20"
              />
            )}
            <Globe size={16} /> Global
          </button>

          <button
            onClick={() => setViewMode("today")}
            className={`
                            relative px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all z-10 cursor-pointer
                            ${
                              viewMode === "today"
                                ? "text-white"
                                : "text-gray-500 hover:text-gray-300"
                            }
                        `}
          >
            {viewMode === "today" && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-green-500 rounded-full -z-10 shadow-lg shadow-green-500/20"
              />
            )}
            <Calendar size={16} /> Per session
          </button>
        </div>
      </div>

      {/* Podium Section - Centered 3D Layout */}
      {currentStats.length > 0 && (
        <div className="relative mb-24 mt-4 w-full max-w-4xl mx-auto h-[450px]">
          {/* Ambient Spotlight Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="flex items-end justify-center gap-2 md:gap-4 h-full pb-10">
            {/* 2nd Place (Left) */}
            <PodiumSpot player={top2} rank={2} delay={0.2} />

            {/* 1st Place (Center) */}
            <PodiumSpot player={top1} rank={1} delay={0.4} />

            {/* 3rd Place (Right) */}
            <PodiumSpot player={top3} rank={3} delay={0.6} />
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="glass-panel overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-2xl backdrop-blur-xl">
        {/* Table header bar */}
        <div className="p-4 md:p-5 border-b border-[var(--color-border)] flex justify-between items-center">
          <h3 className="font-bold text-base flex items-center gap-2.5">
            <span className="p-1.5 bg-yellow-500/15 rounded-lg border border-yellow-500/20">
              <Star size={15} className="text-yellow-500" />
            </span>
            Full Rankings
          </h3>
          <div className="chip text-[var(--color-text-dim)]">
            {currentStats.length} players
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-surface)]/70 text-[var(--color-text-dim)] text-[11px] uppercase tracking-widest border-b border-[var(--color-border)]">
                <th className="px-5 py-3.5 font-semibold">#</th>
                <th className="px-5 py-3.5 font-semibold">Player</th>
                <th
                  className="px-5 py-3.5 font-semibold cursor-pointer hover:text-white transition-colors text-center select-none"
                  onClick={() => setSortKey("wins")}
                >
                  Wins{" "}
                  {sortKey === "wins" && (
                    <span className="text-[var(--color-primary)]">↓</span>
                  )}
                </th>
                <th className="px-5 py-3.5 font-semibold text-center">
                  Losses
                </th>
                <th
                  className="px-5 py-3.5 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => setSortKey("winRate")}
                >
                  Win Rate{" "}
                  {sortKey === "winRate" && (
                    <span className="text-[var(--color-accent)]">↓</span>
                  )}
                </th>
                <th className="px-5 py-3.5 font-semibold hidden md:table-cell text-right">
                  Invested
                </th>
                <th className="px-5 py-3.5 font-semibold hidden md:table-cell text-center">
                  Games
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 text-sm">
              {sortedStats.map((stat, index) => {
                const wr =
                  stat.matchesPlayed > 0
                    ? (stat.wins / stat.matchesPlayed) * 100
                    : 0;
                const wrDisplay = wr.toFixed(1);
                const isTop3 = index < 3;
                const rankColors = [
                  {
                    bg: "bg-yellow-500/15",
                    text: "text-yellow-400",
                    border: "border-yellow-500/40",
                    glow: "shadow-yellow-500/20",
                  },
                  {
                    bg: "bg-slate-400/15",
                    text: "text-slate-300",
                    border: "border-slate-400/40",
                    glow: "shadow-slate-400/20",
                  },
                  {
                    bg: "bg-orange-500/15",
                    text: "text-orange-400",
                    border: "border-orange-500/40",
                    glow: "shadow-orange-500/20",
                  },
                ];
                const rc = rankColors[index] || null;

                return (
                  <motion.tr
                    key={stat.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="table-row-hover group relative"
                  >
                    {/* Left rank accent line for top 3 */}
                    <td className="pl-5 pr-3 py-4">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm
                        ${rc ? `${rc.bg} ${rc.text} border ${rc.border} shadow-md ${rc.glow}` : "bg-white/5 text-[var(--color-text-dim)] border border-white/8"}
                      `}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar letter */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
                          ${isTop3 ? `bg-gradient-to-br ${index === 0 ? "from-yellow-600 to-yellow-400" : index === 1 ? "from-slate-500 to-slate-300" : "from-orange-600 to-orange-400"} text-black` : "bg-white/8 text-white/60"}
                        `}
                        >
                          {stat.name?.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`font-semibold ${isTop3 ? "text-white" : "text-white/80"}`}
                        >
                          {stat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-green-400 tabular-nums">
                        {stat.wins}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-red-400 tabular-nums">
                        {stat.losses}
                      </span>
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${wr >= 60 ? "bg-[var(--color-accent)]" : wr >= 40 ? "bg-[var(--color-primary)]" : "bg-[var(--color-text-dim)]"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(wr, 100)}%` }}
                            transition={{
                              duration: 0.8,
                              delay: index * 0.06 + 0.3,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[var(--color-text-dim)] w-10 text-right tabular-nums">
                          {wrDisplay}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-[var(--color-text-dim)] text-xs hidden md:table-cell tabular-nums">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(stat.totalSpent)}
                    </td>
                    <td className="px-5 py-4 text-center text-[var(--color-text-dim)] hidden md:table-cell tabular-nums">
                      {stat.matchesPlayed}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-[var(--color-text-dim)]/40 text-[10px] uppercase tracking-[0.25em]">
          Quang Minh • From • Withlove
        </p>
      </div>
    </div>
  );
});

LeaderboardView.displayName = "LeaderboardView";

export default LeaderboardView;
