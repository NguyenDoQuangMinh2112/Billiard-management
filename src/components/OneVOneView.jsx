import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords,
  Trophy,
  RotateCcw,
  Plus,
  Minus,
  DollarSign,
  CheckCircle,
  Loader,
  ArrowRight,
  Crown,
  Zap,
  Users,
  TrendingUp,
  PlayCircle,
  StopCircle,
  History,
  Medal,
} from "lucide-react";
import { useToast } from "./Toast";
import { billiardAPI } from "../services/api";
import DuelHistoryView from "./DuelHistoryView";
import DuelLeaderboardView from "./DuelLeaderboardView";

const TABS = [
  { id: "match", label: "Match", icon: Swords },
  { id: "history", label: "History", icon: History },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

// ─────────────────────────────────────────────
// Standalone 1v1 state — no GameContext dependency
// ─────────────────────────────────────────────

const fmtMoney = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n) || 0,
  );

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000];

const DEFAULT_PLAYER = { name: "", wins: 0, losses: 0 };

// ── Mini scoreboard counter ──────────────────
const ScoreCounter = ({ value, onInc, onDec, color }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={onDec}
      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer ${
        color === "green"
          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
          : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
      }`}
    >
      <Minus size={16} />
    </button>

    <motion.span
      key={value}
      initial={{ scale: 1.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`font-display text-5xl font-bold w-16 text-center tabular-nums ${
        color === "green"
          ? "text-[var(--color-accent)] drop-shadow-[0_0_12px_rgba(57,255,20,0.5)]"
          : "text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
      }`}
    >
      {value}
    </motion.span>

    <button
      onClick={onInc}
      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer ${
        color === "green"
          ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
          : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
      }`}
    >
      <Plus size={16} />
    </button>
  </div>
);

// ── Player card ───────────────────────────────
const PlayerCard = ({ player, index, onChange, scores, onScoreChange }) => {
  const isLeft = index === 0;
  const diff = (scores?.wins ?? 0) - (scores?.losses ?? 0);
  const isLeading = diff > 0;

  return (
    <motion.div
      layout
      className={`flex-1 glass-panel rounded-3xl border p-6 relative overflow-hidden transition-all duration-300 ${
        isLeading
          ? "border-[var(--color-accent)]/50 shadow-[0_0_30px_rgba(57,255,20,0.1)]"
          : "border-[var(--color-border)]"
      }`}
    >
      {/* Leading glow */}
      {isLeading && (
        <div className="absolute inset-0 bg-[var(--color-accent)]/5 pointer-events-none" />
      )}

      {/* Crown for leader */}
      {isLeading && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-3 right-3"
        >
          <Crown
            size={20}
            className="text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]"
          />
        </motion.div>
      )}

      {/* Player index badge */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black mb-4 ${
          isLeft
            ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
            : "bg-purple-500/20 text-purple-400"
        }`}
      >
        P{index + 1}
      </div>

      {/* Player name input */}
      <input
        type="text"
        value={player.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        placeholder={`Player ${index + 1}`}
        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-[var(--color-primary)]/60 transition-colors placeholder:text-white/20 mb-6"
      />

      {/* Score section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Wins
          </span>
          <ScoreCounter
            value={scores?.wins ?? 0}
            color="green"
            onInc={() => onScoreChange(index, "wins", 1)}
            onDec={() => onScoreChange(index, "wins", -1)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)]">
            Losses
          </span>
          <ScoreCounter
            value={scores?.losses ?? 0}
            color="red"
            onInc={() => onScoreChange(index, "losses", 1)}
            onDec={() => onScoreChange(index, "losses", -1)}
          />
        </div>
      </div>

      {/* Diff badge */}
      <div
        className={`mt-5 text-center text-sm font-bold py-2 rounded-xl ${
          diff > 0
            ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
            : diff < 0
              ? "bg-red-500/10 text-red-400"
              : "bg-white/5 text-[var(--color-text-dim)]"
        }`}
      >
        {diff > 0 ? `+${diff} ahead` : diff < 0 ? `${diff} behind` : "Tied"}
      </div>
    </motion.div>
  );
};

// ── Result modal ──────────────────────────────
const ResultModal = ({ data, onClose }) => {
  const { winner, loser, cost, payerName } = data;
  const isDraw = !winner;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-panel rounded-3xl border border-[var(--color-border)] p-8 relative overflow-hidden cursor-default"
      >
        {/* Gradient top bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />

        <div className="text-center">
          <div className="text-6xl mb-4">{isDraw ? "🤝" : "🏆"}</div>
          <h2 className="text-3xl font-display font-bold text-white mb-1">
            {isDraw ? "It's a Draw!" : `${winner} Wins!`}
          </h2>
          {!isDraw && (
            <p className="text-[var(--color-text-dim)] mb-6">
              Better luck next time,{" "}
              <span className="text-red-400 font-bold">{loser}</span>
            </p>
          )}

          {/* Cost summary */}
          <div className="bg-black/40 rounded-2xl p-5 border border-[var(--color-border)] mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-dim)] text-sm">
                Total Bill
              </span>
              <span className="text-[var(--color-accent)] font-bold font-mono text-xl">
                {fmtMoney(cost)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-white/5 pt-3">
              <span className="text-[var(--color-text-dim)] text-sm">
                Paid by
              </span>
              <span className="text-white font-bold flex items-center gap-2">
                <DollarSign
                  size={14}
                  className="text-[var(--color-secondary)]"
                />
                {payerName || "—"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold rounded-2xl transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────
const OneVOneView = () => {
  const { success, error: showError } = useToast();

  // Players
  const [players, setPlayers] = useState([
    { ...DEFAULT_PLAYER },
    { ...DEFAULT_PLAYER },
  ]);

  // Scores indexed by player index
  const [scores, setScores] = useState([
    { wins: 0, losses: 0 },
    { wins: 0, losses: 0 },
  ]);

  // Payment
  const [billCost, setBillCost] = useState("");
  const [payerIndex, setPayerIndex] = useState(0); // 0 = P1, 1 = P2, 2 = split
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active DB session
  const [activeSession, setActiveSession] = useState(null); // { id, player1Id, player2Id }
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // History — loaded from DB when session is active
  const [sessionHistory, setSessionHistory] = useState([]);

  // Result modal
  const [result, setResult] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("match");

  // ── helpers ──────────────────────────────────
  const handlePlayerChange = (idx, field, val) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleScoreChange = useCallback((playerIdx, type, delta) => {
    setScores((prev) => {
      const next = prev.map((s) => ({ ...s }));
      const newVal = Math.max(0, next[playerIdx][type] + delta);
      next[playerIdx] = { ...next[playerIdx], [type]: newVal };
      return next;
    });
  }, []);

  const resetScores = () => {
    setScores([
      { wins: 0, losses: 0 },
      { wins: 0, losses: 0 },
    ]);
  };

  // ── determine winner ─────────────────────────
  const getDiff = (i) => (scores[i]?.wins ?? 0) - (scores[i]?.losses ?? 0);

  const getWinnerIdx = () => {
    const d0 = getDiff(0);
    const d1 = getDiff(1);
    if (d0 === d1) return null; // draw
    return d0 > d1 ? 0 : 1;
  };

  // ── Start session ─────────────────────────────
  const handleStartSession = async () => {
    const p0 = players[0].name.trim();
    const p1 = players[1].name.trim();
    if (!p0 || !p1) {
      showError("Please enter both player names before starting");
      return;
    }
    if (p0.toLowerCase() === p1.toLowerCase()) {
      showError("Player names must be different");
      return;
    }
    setIsStarting(true);
    try {
      const res = await billiardAPI.createDuelSession(p0, p1);
      if (!res.success)
        throw new Error(res.error || "Failed to create session");
      setActiveSession(res.data);
      setSessionHistory([]);
      resetScores();
      setBillCost("");
      success(`Session started: ${p0} vs ${p1} 🎮`);
    } catch (err) {
      showError(err.message || "Could not start session");
    } finally {
      setIsStarting(false);
    }
  };

  // ── End session ───────────────────────────────
  const handleEndSession = async () => {
    if (!activeSession) return;
    const totalSpent = sessionHistory.reduce((sum, h) => sum + h.cost, 0);
    if (totalSpent === 0) {
      // No rounds were played — just discard
      setActiveSession(null);
      setSessionHistory([]);
      resetScores();
      success("Session ended (no rounds recorded)");
      return;
    }

    // Determine overall payer by who paid the most rounds
    const p0Paid = sessionHistory
      .filter((h) => h.payerRaw === "player1")
      .reduce((s, h) => s + h.cost, 0);
    const p1Paid = sessionHistory
      .filter((h) => h.payerRaw === "player2")
      .reduce((s, h) => s + h.cost, 0);
    const splitPaid = sessionHistory
      .filter((h) => h.payerRaw === "split")
      .reduce((s, h) => s + h.cost, 0);
    let overallPayer = "split";
    if (p0Paid > p1Paid && p0Paid > splitPaid) overallPayer = "player1";
    else if (p1Paid > p0Paid && p1Paid > splitPaid) overallPayer = "player2";

    setIsEnding(true);
    try {
      const res = await billiardAPI.completeDuelSession(
        activeSession.id,
        totalSpent,
        overallPayer,
      );
      if (!res.success) throw new Error(res.error || "Failed to end session");
      success(`Session completed! Total: ${fmtMoney(totalSpent)} 🏁`);
      setActiveSession(null);
      setSessionHistory([]);
      resetScores();
      setBillCost("");
      setActiveTab("history"); // auto-navigate to history
    } catch (err) {
      showError(err.message || "Could not end session");
    } finally {
      setIsEnding(false);
    }
  };

  // ── submit round ──────────────────────────────
  const handleConfirm = async () => {
    const p0 = players[0].name.trim() || "Player 1";
    const p1 = players[1].name.trim() || "Player 2";

    if (!billCost || parseFloat(billCost) <= 0) {
      showError("Please enter a valid bill amount");
      return;
    }

    const totalGames =
      scores[0].wins + scores[0].losses + scores[1].wins + scores[1].losses;
    if (totalGames === 0) {
      showError("Please update the scoreboard first");
      return;
    }

    setIsSubmitting(true);
    try {
      const winnerIdx = getWinnerIdx();
      const winnerName = winnerIdx !== null ? [p0, p1][winnerIdx] : null;
      const loserName =
        winnerIdx !== null ? [p0, p1][winnerIdx === 0 ? 1 : 0] : null;
      const cost = parseFloat(billCost);
      const payerTypeMap = ["player1", "player2", "split"];
      const payerRaw = payerTypeMap[payerIndex];
      const payerName = payerIndex === 2 ? "Split" : [p0, p1][payerIndex];

      if (activeSession) {
        // Save round to DB
        const res = await billiardAPI.addDuelRound(
          activeSession.id,
          scores[0].wins,
          scores[0].losses,
          scores[1].wins,
          scores[1].losses,
          cost,
          payerRaw,
        );
        if (!res.success) throw new Error(res.error || "Failed to save round");

        const entry = {
          id: res.data?.id || Date.now(),
          date: res.data?.played_at || new Date().toISOString(),
          player1: { name: p0, ...scores[0] },
          player2: { name: p1, ...scores[1] },
          winner: winnerName,
          loser: loserName,
          cost,
          payer: payerName,
          payerRaw,
        };
        setSessionHistory((prev) => [entry, ...prev]);
        success(
          winnerName
            ? `Round saved! ${winnerName} wins 🎉`
            : "Draw! Round saved 🤝",
        );
      } else {
        // Offline fallback (no active session)
        const entry = {
          id: Date.now(),
          date: new Date().toISOString(),
          player1: { name: p0, ...scores[0] },
          player2: { name: p1, ...scores[1] },
          winner: winnerName,
          loser: loserName,
          cost,
          payer: payerName,
          payerRaw,
        };
        setSessionHistory((prev) => [entry, ...prev]);
        success(
          winnerName
            ? `${winnerName} wins 🎉 (not saved — start a session first)`
            : "Draw! 🤝",
        );
      }

      setResult({ winner: winnerName, loser: loserName, cost, payerName });
      resetScores();
      setBillCost("");
    } catch (err) {
      showError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── session stats ─────────────────────────────
  const p0Name = players[0].name.trim() || "Player 1";
  const p1Name = players[1].name.trim() || "Player 2";

  const sessionStats = {
    [p0Name]: { wins: 0, losses: 0, spent: 0 },
    [p1Name]: { wins: 0, losses: 0, spent: 0 },
  };
  let totalSessionSpent = 0;

  sessionHistory.forEach((h) => {
    totalSessionSpent += h.cost;
    if (h.winner === p0Name) sessionStats[p0Name].wins++;
    if (h.winner === p1Name) sessionStats[p1Name].wins++;
    if (h.loser === p0Name) sessionStats[p0Name].losses++;
    if (h.loser === p1Name) sessionStats[p1Name].losses++;
    if (h.payer === p0Name || h.payer === "Split") {
      if (h.payer === "Split") {
        sessionStats[p0Name].spent += h.cost / 2;
        sessionStats[p1Name].spent += h.cost / 2;
      } else {
        sessionStats[p0Name].spent += h.cost;
      }
    }
    if (h.payer === p1Name) sessionStats[p1Name].spent += h.cost;
  });

  const winnerIdx = getWinnerIdx();

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold flex items-center gap-3 text-gradient">
            <Swords
              className="hidden md:block text-[var(--color-primary)]"
              strokeWidth={2.5}
            />
            1v1 Match
          </h1>
          <p className="text-[var(--color-text-dim)] mt-2 text-lg font-light">
            Head-to-head scoreboard &amp; payment tracker
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Session live badge */}
          {activeSession && sessionHistory.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/20 border border-[var(--color-border)] text-sm font-mono backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[var(--color-text-dim)]">Live:</span>
              <span className="text-[var(--color-primary)] font-bold">
                {sessionHistory.length} rounds
              </span>
              <span className="text-[var(--color-text-dim)]">|</span>
              <span className="text-[var(--color-accent)] font-bold">
                {fmtMoney(sessionHistory.reduce((s, h) => s + h.cost, 0))}
              </span>
            </div>
          )}

          {/* Start / End session button */}
          {!activeSession ? (
            <button
              onClick={handleStartSession}
              disabled={isStarting || activeTab !== "match"}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black font-bold rounded-2xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isStarting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <PlayCircle size={18} />
              )}
              {isStarting ? "Starting…" : "Start Session"}
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex items-center gap-2 px-5 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isEnding ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <StopCircle size={18} />
              )}
              {isEnding ? "Ending…" : "End Session"}
            </button>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-1 p-1 bg-black/30 rounded-2xl border border-[var(--color-border)] mb-8 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[var(--color-primary)] text-black shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                  : "text-[var(--color-text-dim)] hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {/* MATCH TAB */}
        {activeTab === "match" && (
          <motion.div
            key="match"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* ── Left: Scoreboard ── */}
              <div className="xl:col-span-2 space-y-6">
                {/* VS Header */}
                <div className="glass-panel rounded-3xl border border-[var(--color-border)] p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold font-display flex items-center gap-2">
                      <Trophy
                        className="text-[var(--color-primary)]"
                        size={22}
                      />
                      Live Scoreboard
                    </h3>
                    <button
                      onClick={resetScores}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-[var(--color-text-dim)] hover:text-white transition-all cursor-pointer"
                    >
                      <RotateCcw size={15} />
                      Reset
                    </button>
                  </div>

                  {/* Player cards side by side */}
                  <div className="flex gap-4 flex-col sm:flex-row">
                    {players.map((p, i) => (
                      <PlayerCard
                        key={i}
                        index={i}
                        player={p}
                        scores={scores[i]}
                        onChange={handlePlayerChange}
                        onScoreChange={handleScoreChange}
                      />
                    ))}
                  </div>

                  {/* VS divider result */}
                  <div className="mt-6 text-center">
                    {winnerIdx !== null ? (
                      <motion.div
                        key={winnerIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] font-bold text-sm"
                      >
                        <Crown size={16} />
                        {[p0Name, p1Name][winnerIdx]} is leading
                      </motion.div>
                    ) : (
                      <span className="text-[var(--color-text-dim)] text-sm italic">
                        — Scores are tied —
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Session History ── */}
                {sessionHistory.length > 0 && (
                  <div className="glass-panel rounded-3xl border border-[var(--color-border)] p-6">
                    <h3 className="text-lg font-bold font-display flex items-center gap-2 mb-5">
                      <TrendingUp
                        className="text-[var(--color-secondary)]"
                        size={20}
                      />
                      Session History
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      <AnimatePresence>
                        {sessionHistory.map((h, i) => (
                          <motion.div
                            key={h.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3 border border-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[var(--color-text-dim)] font-mono w-4">
                                #{sessionHistory.length - i}
                              </span>
                              <span
                                className={`font-bold text-sm ${h.winner === p0Name ? "text-[var(--color-accent)]" : h.winner === p1Name ? "text-purple-400" : "text-[var(--color-text-dim)]"}`}
                              >
                                {h.winner ?? "Draw"}
                              </span>
                              <span className="text-[var(--color-text-dim)] text-xs">
                                {h.player1.wins}–{h.player2.wins}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <span className="text-[var(--color-accent)] font-mono text-xs">
                                {fmtMoney(h.cost)}
                              </span>
                              <span className="text-[var(--color-text-dim)] text-xs">
                                {new Date(h.date).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Session player stats */}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
                      {[p0Name, p1Name].map((name) => (
                        <div
                          key={name}
                          className="bg-black/20 rounded-xl p-4 border border-white/5"
                        >
                          <div className="font-bold text-white mb-2 truncate">
                            {name}
                          </div>
                          <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
                            <span>
                              <span className="text-[var(--color-accent)] font-bold">
                                {sessionStats[name]?.wins ?? 0}W
                              </span>
                              {" / "}
                              <span className="text-red-400 font-bold">
                                {sessionStats[name]?.losses ?? 0}L
                              </span>
                            </span>
                            <span className="text-[var(--color-accent)] font-mono">
                              {fmtMoney(sessionStats[name]?.spent ?? 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Payment Panel ── */}
              <div className="xl:col-span-1">
                <div className="glass-panel rounded-3xl border border-[var(--color-border)] p-6 sticky top-24 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold font-display">
                    Finalize Round
                  </h3>

                  {/* Who pays */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)] mb-3">
                      Who Pays?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[p0Name, p1Name, "Split"].map((label, i) => (
                        <button
                          key={label}
                          onClick={() => setPayerIndex(i)}
                          className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer truncate px-2 ${
                            payerIndex === i
                              ? "bg-[var(--color-primary)] text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                              : "bg-white/5 text-[var(--color-text-dim)] hover:bg-white/10 hover:text-white border border-white/5"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {payerIndex === 2 &&
                      billCost &&
                      parseFloat(billCost) > 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-[var(--color-text-dim)] mt-2 text-center"
                        >
                          Each pays{" "}
                          <span className="text-[var(--color-accent)] font-bold">
                            {fmtMoney(parseFloat(billCost) / 2)}
                          </span>
                        </motion.p>
                      )}
                  </div>

                  {/* Bill amount */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)] block mb-2">
                      Total Bill (VND)
                    </label>
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] font-bold text-xl group-focus-within/input:text-[var(--color-accent)] transition-colors">
                        ₫
                      </div>
                      <input
                        type="number"
                        value={billCost}
                        onChange={(e) => setBillCost(e.target.value)}
                        placeholder="0"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-10 text-3xl font-mono font-bold text-white focus:border-[var(--color-accent)] focus:bg-black/60 outline-none transition-all placeholder:text-white/10 shadow-inner"
                      />
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {QUICK_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setBillCost(amt.toString())}
                          className="px-3 py-1.5 bg-white/5 hover:bg-[var(--color-primary)]/20 border border-white/5 hover:border-[var(--color-primary)]/50 rounded-lg text-xs font-mono text-[var(--color-text-dim)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
                        >
                          {amt / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary preview */}
                  {billCost && parseFloat(billCost) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/30 rounded-2xl p-4 border border-white/5 space-y-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-dim)]">
                          Result
                        </span>
                        <span className="font-bold text-white">
                          {winnerIdx !== null
                            ? `${[p0Name, p1Name][winnerIdx]} wins`
                            : "Draw"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-dim)]">
                          Payer
                        </span>
                        <span className="font-bold text-[var(--color-secondary)]">
                          {payerIndex === 2
                            ? "Split 50/50"
                            : [p0Name, p1Name][payerIndex]}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2">
                        <span className="text-[var(--color-text-dim)]">
                          Total
                        </span>
                        <span className="font-bold text-[var(--color-accent)] font-mono">
                          {fmtMoney(parseFloat(billCost))}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Confirm button */}
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting || !billCost}
                    className="w-full py-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-bold text-xl rounded-2xl transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin" size={22} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={22} className="fill-white/20" />
                        <span className="relative z-10">Confirm Round</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[var(--color-text-dim)] text-center opacity-60">
                    {activeSession
                      ? "Rounds are saved to DB in real-time"
                      : "Start a session to enable DB persistence"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <DuelHistoryView />
          </motion.div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <DuelLeaderboardView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result modal */}
      <AnimatePresence>
        {result && (
          <ResultModal data={result} onClose={() => setResult(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OneVOneView;
