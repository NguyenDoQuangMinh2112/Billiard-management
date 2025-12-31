import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import StatsCharts from "./StatsCharts";
import Leaderboard from "./Leaderboard";
import {
  Wallet,
  Trophy,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Users,
  Target,
  Sparkles,
} from "lucide-react";

const Dashboard = () => {
  const { nextPayer, allStats, getExpenses, matches, players } = useGame();
  const [timeframe, setTimeframe] = useState("month");

  const expenses = getExpenses(timeframe);

  // Format currency
  const fmtMoney = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  // Top Player
  const topPlayer = allStats[0];

  // Calculate additional stats
  const totalMatches = matches.length;
  const activePlayers = players.length;
  const avgMatchCost =
    totalMatches > 0
      ? expenses.total /
        matches.filter((m) => {
          const d = new Date(m.date);
          const now = new Date();
          if (timeframe === "week") {
            const oneDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.round(Math.abs((now - d) / oneDay));
            return diffDays <= 7;
          }
          if (timeframe === "month")
            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );
          if (timeframe === "year")
            return d.getFullYear() === now.getFullYear();
          return false;
        }).length
      : 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header / Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            Overview
          </h1>
          <p className="text-[var(--color-text-dim)] mt-1">
            Welcome back to the arena. Let's check your stats.
          </p>
        </div>
        <div className="flex bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)] shadow-lg">
          {["week", "month", "year"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-all duration-300 ${
                timeframe === t
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg scale-105"
                  : "text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-white/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Top Widgets Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* 1. Next Payer Widget */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-primary)]/20 blur-[60px] rounded-full group-hover:bg-[var(--color-primary)]/40 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 rounded-xl text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300">
                <Wallet size={24} />
              </div>
              <span className="text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-full border border-[var(--color-primary)]/20">
                UP NEXT
              </span>
            </div>
            <h3 className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider mb-2">
              Next Payer
            </h3>
            <div className="text-3xl font-display font-bold text-[var(--color-text-main)] truncate">
              {nextPayer}
            </div>
          </div>
        </motion.div>

        {/* 2. Top Player Widget */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-secondary)]/20 blur-[60px] rounded-full group-hover:bg-[var(--color-secondary)]/40 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/5 rounded-xl text-[var(--color-secondary)] group-hover:scale-110 transition-transform duration-300">
                <Trophy size={24} />
              </div>
              <span className="text-xs font-bold bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-3 py-1.5 rounded-full border border-[var(--color-secondary)]/20">
                #1
              </span>
            </div>
            <h3 className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider mb-2">
              Top Player
            </h3>
            <div className="text-3xl font-display font-bold text-[var(--color-text-main)] truncate">
              {topPlayer?.name || "-"}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-sm text-[var(--color-text-dim)]">
                {topPlayer?.wins || 0} Wins
              </div>
              <div className="h-1 w-1 rounded-full bg-[var(--color-text-dim)]"></div>
              <div className="text-sm text-[var(--color-accent)]">
                {topPlayer?.winRate ? `${topPlayer.winRate}%` : "0%"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Total Spent Widget */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-accent)]/20 blur-[60px] rounded-full group-hover:bg-[var(--color-accent)]/40 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 rounded-xl text-[var(--color-accent)] group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1.5 rounded-full border border-[var(--color-accent)]/20 capitalize">
                {timeframe}
              </span>
            </div>
            <h3 className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider mb-2">
              Total Expenses
            </h3>
            <div className="text-2xl lg:text-3xl font-display font-bold text-[var(--color-text-main)]">
              {fmtMoney(expenses.total)}
            </div>
          </div>
        </motion.div>

        {/* 4. Total Matches Widget */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-[var(--color-primary)]/10 blur-[60px] rounded-full group-hover:bg-[var(--color-primary)]/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-xl text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300">
                <Target size={24} />
              </div>
              <span className="text-xs font-bold bg-white/5 text-[var(--color-text-dim)] px-3 py-1.5 rounded-full border border-white/10">
                TOTAL
              </span>
            </div>
            <h3 className="text-[var(--color-text-dim)] text-xs font-medium uppercase tracking-wider mb-2">
              Total Matches
            </h3>
            <div className="text-3xl font-display font-bold text-[var(--color-text-main)]">
              {totalMatches}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Users size={14} className="text-[var(--color-text-dim)]" />
              <div className="text-sm text-[var(--color-text-dim)]">
                {activePlayers} Players
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StatsCharts expenses={expenses} winStats={allStats} />
      </motion.div>

      {/* Bottom Section: Leaderboard & History */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Leaderboard - Take up 2 cols */}
        <div className="lg:col-span-2">
          <Leaderboard stats={allStats} />
        </div>

        {/* Recent History - Take up 1 col */}
        <div className="glass-panel p-6 rounded-2xl h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 rounded-lg">
                <Clock className="text-[var(--color-primary)]" size={20} />
              </div>
              Recent Matches
            </h3>
            <Sparkles className="text-[var(--color-accent)]" size={18} />
          </div>
          <div className="space-y-4 p-2 max-h-[500px] overflow-y-auto no-scrollbar">
            {matches.slice(0, 8).map((match, idx) => {
              let thirdPlayer = null;
              if (match.participants && match.participants.length > 0) {
                thirdPlayer = match.participants.find(
                  (p) => p !== match.winner && p !== match.loser
                );
              } else {
                thirdPlayer = players.find(
                  (p) => p !== match.winner && p !== match.loser
                );
              }
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-6 pb-4 border-l-2 border-[var(--color-border)] last:pb-0 last:border-0 hover:border-[var(--color-primary)] transition-colors group"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] border-2 border-[var(--color-surface)] group-hover:scale-125 transition-transform" />
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--color-text-main)] text-sm flex items-center gap-1 flex-wrap">
                        <span className="text-[var(--color-accent)]">
                          {match.winner}
                        </span>
                        <span className="text-[var(--color-text-dim)] font-normal text-xs">
                          vs
                        </span>
                        <span>{match.loser}</span>
                        {thirdPlayer && (
                          <>
                            <span className="text-[var(--color-text-dim)] font-normal text-xs">
                              vs
                            </span>
                            <span>{thirdPlayer}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-[var(--color-text-dim)] mt-1 flex items-center gap-2">
                        <Clock size={12} />
                        {new Date(match.date).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-[var(--color-primary)] text-sm font-bold">
                        {fmtMoney(match.cost)}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-dim)] uppercase bg-white/5 px-2 py-0.5 rounded mt-1">
                        {match.payer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {matches.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Clock className="text-[var(--color-text-dim)]" size={24} />
                </div>
                <p className="text-[var(--color-text-dim)] text-sm">
                  No matches recorded yet.
                </p>
                <p className="text-[var(--color-text-dim)] text-xs mt-1">
                  Start playing to see history!
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
