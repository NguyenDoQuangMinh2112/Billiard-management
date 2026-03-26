import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  ChevronDown,
  ChevronRight,
  Trash2,
  Trophy,
  DollarSign,
  Clock,
  Loader,
  AlertCircle,
  RefreshCw,
  Handshake,
} from "lucide-react";
import { billiardAPI } from "../services/api";
import { useToast } from "./Toast";

const fmtMoney = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(n) || 0,
  );

const fmtDate = (d) => {
  const date = new Date(d);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDuration = (start, end) => {
  if (!end) return "—";
  const ms = new Date(end) - new Date(start);
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
};

// ── Single session card ──────────────────────────────────────────────────────
const SessionCard = ({ session, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [rounds, setRounds] = useState(null);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { success, error: showError } = useToast();

  const p1Wins = session.player1_session_wins ?? 0;
  const p2Wins = session.player2_session_wins ?? 0;
  const winnerName =
    p1Wins > p2Wins
      ? session.player1_name
      : p2Wins > p1Wins
        ? session.player2_name
        : null;

  const handleExpand = async () => {
    setExpanded((v) => !v);
    if (!expanded && rounds === null) {
      setLoadingRounds(true);
      try {
        const res = await billiardAPI.getDuelRounds(session.id);
        setRounds(res.success ? res.data : []);
      } catch {
        setRounds([]);
      } finally {
        setLoadingRounds(false);
      }
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (
      !confirm(
        `Delete session ${session.player1_name} vs ${session.player2_name}?`,
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await billiardAPI.deleteDuelSession(session.id);
      if (!res.success) throw new Error(res.error);
      success("Session deleted");
      onDelete(session.id);
    } catch (err) {
      showError(err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-panel rounded-2xl border border-[var(--color-border)] overflow-hidden"
    >
      {/* Header row */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left cursor-pointer"
      >
        {/* Expand icon */}
        <span className="text-[var(--color-text-dim)] shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        {/* Players + score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-bold truncate ${p1Wins >= p2Wins && p1Wins > 0 ? "text-[var(--color-accent)]" : "text-white"}`}
            >
              {session.player1_name}
            </span>
            <span className="text-[var(--color-text-dim)] font-mono text-lg font-bold px-2">
              {p1Wins} – {p2Wins}
            </span>
            <span
              className={`font-bold truncate ${p2Wins > p1Wins ? "text-[var(--color-accent)]" : "text-white"}`}
            >
              {session.player2_name}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-dim)]">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {fmtDate(session.created_at)}
            </span>
            <span>·</span>
            <span>{session.total_rounds} rounds</span>
            <span>·</span>
            <span>{fmtDuration(session.created_at, session.ended_at)}</span>
          </div>
        </div>

        {/* Winner badge */}
        <div className="shrink-0 flex items-center gap-3">
          <span
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              session.status === "completed"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/20 text-amber-300"
            }`}
          >
            {session.status === "completed" ? "Completed" : "Active"}
          </span>

          {winnerName ? (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
              <Trophy size={11} />
              {winnerName}
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[var(--color-text-dim)] text-xs font-bold">
              <Handshake size={11} />
              Draw
            </span>
          )}

          <span className="text-[var(--color-accent)] font-mono font-bold text-sm shrink-0">
            {fmtMoney(session.total_cost)}
          </span>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--color-text-dim)] hover:text-red-400 transition-all cursor-pointer disabled:opacity-40"
          >
            {deleting ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </button>

      {/* Expanded rounds */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              {loadingRounds ? (
                <div className="flex justify-center py-4">
                  <Loader
                    className="animate-spin text-[var(--color-text-dim)]"
                    size={20}
                  />
                </div>
              ) : rounds && rounds.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-dim)] mb-3">
                    Rounds
                  </p>
                  {rounds.map((r, i) => {
                    const isP1Winner = r.winner_id === session.player1_id;
                    const isP2Winner = r.winner_id === session.player2_id;
                    const isDraw = r.result === "draw";
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2.5 border border-white/5 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--color-text-dim)] font-mono text-xs w-5">
                            #{i + 1}
                          </span>
                          <span
                            className={`font-bold ${isP1Winner ? "text-[var(--color-accent)]" : "text-white/60"}`}
                          >
                            {session.player1_name}
                          </span>
                          <span className="text-[var(--color-text-dim)] font-mono">
                            {r.player1_wins}–{r.player2_wins}
                          </span>
                          <span
                            className={`font-bold ${isP2Winner ? "text-[var(--color-accent)]" : "text-white/60"}`}
                          >
                            {session.player2_name}
                          </span>
                          {isDraw && (
                            <span className="text-xs text-[var(--color-text-dim)] italic">
                              draw
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-[var(--color-accent)] font-mono text-xs">
                            {fmtMoney(r.cost)}
                          </span>
                          <span className="text-[var(--color-text-dim)] text-xs hidden sm:block">
                            {r.payer_type === "split"
                              ? "split"
                              : r.payer_type === "player1"
                                ? session.player1_name
                                : session.player2_name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-dim)] italic text-center py-3">
                  No rounds recorded
                </p>
              )}

              {/* Session payer summary */}
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
                <DollarSign size={12} />
                <span>
                  Paid by:{" "}
                  <span className="text-white font-bold">
                    {session.payer_type === "split"
                      ? "Split 50/50"
                      : session.payer_type === "player1"
                        ? session.player1_name
                        : session.player2_name}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main DuelHistoryView ─────────────────────────────────────────────────────
const DuelHistoryView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await billiardAPI.getDuelHistory(50);
      if (!res.success) throw new Error(res.error);
      setSessions(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--color-text-dim)] text-sm">
          <History size={16} />
          <span>
            {sessions.length} session
            {sessions.length !== 1 ? "s" : ""}
          </span>
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

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader
            className="animate-spin text-[var(--color-primary)]"
            size={28}
          />
          <span className="text-[var(--color-text-dim)] text-sm">
            Loading history…
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle className="text-red-400" size={28} />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={load}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--color-text-dim)]">
          <History size={36} className="opacity-30" />
          <p className="text-sm">No 1v1 sessions yet</p>
          <p className="text-xs opacity-60">
            Play at least one round to see it in history
          </p>
        </div>
      ) : (
        <AnimatePresence>
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default DuelHistoryView;
