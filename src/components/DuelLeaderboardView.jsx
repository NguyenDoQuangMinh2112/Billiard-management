import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Crown,
  TrendingUp,
  DollarSign,
  Swords,
  RefreshCw,
  Loader,
  AlertCircle,
  Medal,
} from "lucide-react";
import { billiardAPI } from "../services/api";

const fmtMoney = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n) || 0,
  );

const SORT_KEYS = [
  { key: "total_wins", label: "Wins" },
  { key: "win_rate", label: "Win Rate" },
  { key: "rounds_played", label: "Rounds" },
  { key: "total_spent", label: "Spent" },
];

const RankIcon = ({ rank }) => {
  if (rank === 1)
    return (
      <Crown
        size={18}
        className="text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.7)]"
      />
    );
  if (rank === 2) return <Medal size={18} className="text-slate-300" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return (
    <span className="text-[var(--color-text-dim)] font-mono text-sm w-[18px] text-center">
      {rank}
    </span>
  );
};

const StatBar = ({ value, max, color }) => (
  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`h-full rounded-full ${color}`}
    />
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const DuelLeaderboardView = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("total_wins");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await billiardAPI.getDuelLeaderboard(30);
      if (!res.success) throw new Error(res.error);
      setPlayers(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = [...players].sort((a, b) => {
    if (sortKey === "win_rate")
      return parseFloat(b.win_rate) - parseFloat(a.win_rate);
    if (sortKey === "total_spent")
      return parseFloat(b.total_spent) - parseFloat(a.total_spent);
    return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
  });

  const maxWins = Math.max(...players.map((p) => p.total_wins), 1);
  const maxRounds = Math.max(...players.map((p) => p.rounds_played), 1);

  // Podium top 3
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sort tabs */}
        <div className="flex gap-1 p-1 bg-black/30 rounded-xl border border-[var(--color-border)]">
          {SORT_KEYS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortKey === s.key
                  ? "bg-[var(--color-primary)] text-black"
                  : "text-[var(--color-text-dim)] hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-[var(--color-text-dim)] hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader
            className="animate-spin text-[var(--color-primary)]"
            size={28}
          />
          <span className="text-[var(--color-text-dim)] text-sm">
            Loading leaderboard…
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle className="text-red-400" size={28} />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm cursor-pointer transition-all"
          >
            Retry
          </button>
        </div>
      ) : players.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-dim)]">
          <Trophy size={36} className="opacity-30" />
          <p className="text-sm">No ranked players yet</p>
          <p className="text-xs opacity-60">
            Play some 1v1 sessions to appear here
          </p>
        </div>
      ) : (
        <>
          {/* ── Podium ── */}
          {top3.length >= 2 && (
            <div className="flex items-end justify-center gap-3 py-6">
              {/* 2nd */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-2 flex-1 max-w-[140px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-500/20 border border-slate-400/30 flex items-center justify-center text-xl font-black text-slate-300">
                    {top3[1].name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-sm text-slate-300 truncate w-full text-center">
                    {top3[1].name}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)]">
                    {top3[1].total_wins}W ·{" "}
                    {parseFloat(top3[1].win_rate).toFixed(0)}%
                  </p>
                  <div className="w-full h-16 bg-slate-500/20 border border-slate-400/20 rounded-t-xl flex items-center justify-center">
                    <span className="text-2xl font-black text-slate-300">
                      2
                    </span>
                  </div>
                </motion.div>
              )}
              {/* 1st */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 flex-1 max-w-[160px]"
              >
                <Crown
                  size={24}
                  className="text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                />
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-2xl font-black text-yellow-300">
                  {top3[0].name.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-base text-yellow-300 truncate w-full text-center">
                  {top3[0].name}
                </p>
                <p className="text-xs text-[var(--color-text-dim)]">
                  {top3[0].total_wins}W ·{" "}
                  {parseFloat(top3[0].win_rate).toFixed(0)}%
                </p>
                <div className="w-full h-24 bg-yellow-500/10 border border-yellow-400/20 rounded-t-xl flex items-center justify-center">
                  <span className="text-3xl font-black text-yellow-300">1</span>
                </div>
              </motion.div>
              {/* 3rd */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-2 flex-1 max-w-[140px]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-xl font-black text-amber-500">
                    {top3[2].name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-sm text-amber-500 truncate w-full text-center">
                    {top3[2].name}
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)]">
                    {top3[2].total_wins}W ·{" "}
                    {parseFloat(top3[2].win_rate).toFixed(0)}%
                  </p>
                  <div className="w-full h-10 bg-amber-600/20 border border-amber-500/20 rounded-t-xl flex items-center justify-center">
                    <span className="text-xl font-black text-amber-500">3</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ── Full rankings table ── */}
          <div className="glass-panel rounded-2xl border border-[var(--color-border)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_60px_60px_80px_80px] gap-2 px-4 py-3 border-b border-white/5 text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Wins</span>
              <span className="text-right">Rate</span>
              <span className="text-right hidden sm:block">Rounds</span>
              <span className="text-right hidden md:block">Spent</span>
            </div>

            {sorted.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`grid grid-cols-[40px_1fr_60px_60px_80px_80px] gap-2 items-center px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                  i === 0
                    ? "bg-yellow-500/5"
                    : i === 1
                      ? "bg-slate-500/5"
                      : i === 2
                        ? "bg-amber-600/5"
                        : ""
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  <RankIcon rank={i + 1} />
                </div>

                {/* Player */}
                <div className="min-w-0">
                  <p
                    className={`font-bold truncate text-sm ${i === 0 ? "text-yellow-300" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-500" : "text-white"}`}
                  >
                    {p.name}
                  </p>
                  <StatBar
                    value={p.total_wins}
                    max={maxWins}
                    color={
                      i === 0 ? "bg-yellow-400" : "bg-[var(--color-primary)]"
                    }
                  />
                </div>

                {/* Wins */}
                <div className="text-right">
                  <span className="font-bold text-[var(--color-accent)] text-sm">
                    {p.total_wins}
                  </span>
                  <span className="text-[var(--color-text-dim)] text-xs">
                    /{p.total_losses}
                  </span>
                </div>

                {/* Win rate */}
                <div className="text-right">
                  <span
                    className={`font-bold text-sm ${parseFloat(p.win_rate) >= 60 ? "text-[var(--color-accent)]" : parseFloat(p.win_rate) >= 40 ? "text-yellow-400" : "text-red-400"}`}
                  >
                    {parseFloat(p.win_rate).toFixed(0)}%
                  </span>
                </div>

                {/* Rounds */}
                <div className="text-right hidden sm:block">
                  <span className="text-[var(--color-text-dim)] text-sm">
                    {p.rounds_played}
                  </span>
                </div>

                {/* Spent */}
                <div className="text-right hidden md:block">
                  <span className="text-[var(--color-text-dim)] text-xs font-mono">
                    {fmtMoney(p.total_spent)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary cards */}
          {sorted.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Most Wins",
                  value: sorted[0]?.name ?? "—",
                  sub: `${sorted[0]?.total_wins ?? 0} wins`,
                  icon: <Trophy size={16} className="text-yellow-400" />,
                },
                {
                  label: "Best Rate",
                  value:
                    [...sorted].sort(
                      (a, b) => parseFloat(b.win_rate) - parseFloat(a.win_rate),
                    )[0]?.name ?? "—",
                  sub: `${parseFloat([...sorted].sort((a, b) => parseFloat(b.win_rate) - parseFloat(a.win_rate))[0]?.win_rate ?? 0).toFixed(0)}%`,
                  icon: (
                    <TrendingUp
                      size={16}
                      className="text-[var(--color-primary)]"
                    />
                  ),
                },
                {
                  label: "Most Active",
                  value:
                    [...sorted].sort(
                      (a, b) => b.rounds_played - a.rounds_played,
                    )[0]?.name ?? "—",
                  sub: `${[...sorted].sort((a, b) => b.rounds_played - a.rounds_played)[0]?.rounds_played ?? 0} rounds`,
                  icon: (
                    <Swords
                      size={16}
                      className="text-[var(--color-secondary)]"
                    />
                  ),
                },
                {
                  label: "Top Spender",
                  value:
                    [...sorted].sort(
                      (a, b) =>
                        parseFloat(b.total_spent) - parseFloat(a.total_spent),
                    )[0]?.name ?? "—",
                  sub: fmtMoney(
                    [...sorted].sort(
                      (a, b) =>
                        parseFloat(b.total_spent) - parseFloat(a.total_spent),
                    )[0]?.total_spent ?? 0,
                  ),
                  icon: (
                    <DollarSign
                      size={16}
                      className="text-[var(--color-accent)]"
                    />
                  ),
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="glass-panel rounded-xl border border-[var(--color-border)] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {card.icon}
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
                      {card.label}
                    </span>
                  </div>
                  <p className="font-bold text-white truncate">{card.value}</p>
                  <p className="text-xs text-[var(--color-text-dim)] mt-0.5">
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DuelLeaderboardView;
