import { useState } from "react";
import { motion } from "framer-motion";
import {
  ScanLine,
  Loader,
  UploadCloud,
  DollarSign,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { useToast } from "./Toast";
import Tesseract from "tesseract.js";
import ScoreBoard from "./ScoreBoard";
import WinnerScreen from "./WinnerScreen";

const LogMatchView = () => {
  const { nextPayer, addMatch, players, matches } = useGame();
  const { success, error: showError } = useToast();
  // AI Scanning States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");

  // Bill and submission
  const [billCost, setBillCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live scores from ScoreBoard
  const [liveScores, setLiveScores] = useState(null);

  // Winner Screen States
  const [showWinnerScreen, setShowWinnerScreen] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus("Initializing AI...");
    setScanProgress(0);

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng+vie", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanProgress(Math.round(m.progress * 100));
            setScanStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
          } else {
            setScanStatus(m.status);
          }
        },
      });

      console.log("OCR Result:", text);
      parseTotal(text);
    } catch (err) {
      console.error(err);
      setScanStatus("Scan failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const parseTotal = (text) => {
    const lines = text.split("\n");
    let foundAmount = null;

    const keywords = [
      "total",
      "tong",
      "amount",
      "due",
      "thanh toan",
      "thanh tien",
      "cong",
    ];

    for (let line of lines) {
      const lowerLine = line.toLowerCase();
      if (keywords.some((k) => lowerLine.includes(k))) {
        const numbers = line.match(/[\d,.]+/g);
        if (numbers) {
          const lastNum = numbers[numbers.length - 1];
          const cleanNum = lastNum.replace(/\D/g, "");

          if (cleanNum.length > 3) {
            foundAmount = cleanNum;
            break;
          }
        }
      }
    }

    if (!foundAmount) {
      setScanStatus('Could not find strict "Total". Please verify.');
    } else {
      setBillCost(foundAmount);
      setScanStatus("Bill Recognized!");
      success(
        `Detected amount: ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(foundAmount)}`
      );
    }
  };

  const handleSubmit = async () => {
    // Validate bill cost
    if (!billCost || parseFloat(billCost) <= 0) {
      showError("Please enter a valid bill amount");
      return;
    }

    // Validate that we have live scores
    if (!liveScores) {
      showError("Please update the scoreboard first");
      return;
    }

    // Calculate rankings for all players based on score differential (wins - losses)
    const playerRankings = Object.entries(liveScores)
      .map(([player, scores]) => ({
        name: player,
        wins: scores.wins,
        losses: scores.losses,
        differential: scores.wins - scores.losses,
      }))
      .sort((a, b) => b.differential - a.differential); // Sort by differential descending

    // Identify all winners (all players with the highest differential)
    const highestDifferential = playerRankings[0].differential;
    const winners = playerRankings.filter(
      (p) => p.differential === highestDifferential
    );

    // Find all losers (everyone except winners)
    const losers = playerRankings.filter(
      (p) => p.differential !== highestDifferential
    );

    // For backend API, we need to pick the worst loser (lowest differential)
    const worstLoser = playerRankings[playerRankings.length - 1];

    // Determine active participants (those who played)
    const participants = playerRankings
      .filter((p) => p.wins > 0 || p.losses > 0)
      .map((p) => p.name);

    // Prepare detailed stats
    const details = playerRankings.map((p) => ({
      name: p.name,
      wins: p.wins,
      losses: p.losses,
    }));

    setIsSubmitting(true);

    try {
      // Send all winners (supports draws/ties)
      const result = await addMatch({
        winners: winners.map((w) => w.name), // Array of winner names
        loser: worstLoser.name,
        cost: parseFloat(billCost),
        participants:
          participants.length > 0
            ? participants
            : [...winners.map((w) => w.name), worstLoser.name],
        details,
      });

      if (result && result.success) {
        // Prepare comprehensive winner data for the celebration screen
        const matchType = winners.length > 1 ? "draw" : "win";
        setWinnerData({
          winners: winners.map((w) => w.name), // Multiple winners for draws
          winnerScores: winners.map((w) => ({
            name: w.name,
            wins: w.wins,
            losses: w.losses,
            differential: w.differential,
          })),
          losers: losers.map((l) => ({
            name: l.name,
            wins: l.wins,
            losses: l.losses,
            differential: l.differential,
          })),
          allPlayers: playerRankings,
          cost: parseFloat(billCost),
          matchType,
        });

        // Show winner screen
        setShowWinnerScreen(true);

        // Show success toast
        if (winners.length > 1) {
          success(
            `Match logged! Draw between ${winners
              .map((w) => w.name)
              .join(", ")}! 🤝`
          );
        } else {
          success(`Match logged! ${winners[0].name} wins! 🎉`);
        }

        // Reset form
        setBillCost("");
        setScanStatus("");
      } else {
        showError(result?.error || "Failed to log match. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting match:", err);
      showError("Failed to log match. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 min-h-screen">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2 text-center">
          Log Match Result
        </h1>
        <p className="text-[var(--color-text-dim)] text-lg font-light">
          Track your live billiard scores & costs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column: Live Scoreboard */}
        <div className="lg:col-span-3 xl:col-span-2">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--color-border)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />
            <h3 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Trophy className="text-[var(--color-primary)]" size={24} />
              Live Scoreboard
            </h3>
            <ScoreBoard
              players={players}
              matches={matches}
              onScoreUpdate={setLiveScores}
            />
          </div>

          {/* AI Scanner Section (Moved below scoreboard for flow) */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--color-border)] mt-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[var(--color-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-lg font-bold mb-4 font-display flex items-center gap-2 relative z-10">
              <ScanLine className="text-[var(--color-secondary)]" />
              Bill Scanner{" "}
              <span className="text-xs font-normal text-[var(--color-text-dim)] bg-white/5 px-2 py-0.5 rounded-full">
                Optional
              </span>
            </h3>

            <div className="relative group/upload z-10">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${
                  isScanning
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-white/10 hover:border-[var(--color-primary)]/50 bg-black/20 hover:bg-black/30"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isScanning}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                />

                {isScanning ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine
                          size={16}
                          className="text-[var(--color-primary)]"
                        />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[var(--color-primary)] tracking-wider animate-pulse">
                      {scanStatus}
                    </div>
                    <div className="w-48 h-1 bg-black/50 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] transition-all duration-300 relative overflow-hidden"
                        style={{ width: `${scanProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] group-hover/upload:bg-[var(--color-primary)] group-hover/upload:text-black hover:scale-110 transition-all duration-300 flex items-center justify-center text-[var(--color-primary)] shadow-lg shadow-black/50">
                      <UploadCloud size={32} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-white group-hover/upload:text-[var(--color-primary)] transition-colors">
                        Click to Upload Receipt
                      </p>
                      <p className="text-sm text-[var(--color-text-dim)]">
                        AI will auto-detect the total amount
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Success Indicator */}
              {!isScanning && scanStatus === "Bill Recognized!" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-3 -right-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20 flex items-center gap-2 border border-white/20"
                >
                  <ScanLine size={14} /> SCAN COMPLETE
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Finalize Match */}
        <div className="lg:col-span-3 xl:col-span-1">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--color-border)] sticky top-24 shadow-2xl">
            <h3 className="text-xl font-bold font-display mb-6">
              Finalize Match
            </h3>

            {/* Next Payer Info */}
            <div className="p-5 bg-gradient-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/5 border border-[var(--color-secondary)]/30 rounded-2xl flex items-center justify-between mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--color-secondary)]/10 blur-xl group-hover:opacity-75 transition-opacity" />
              <div className="relative z-10">
                <p className="text-[10px] text-[var(--color-secondary)] uppercase font-bold tracking-widest mb-1">
                  Payment Rotation
                </p>
                <div className="flex items-center gap-3">
                  {/* Previous Payer (if exists) */}
                  {matches.length > 0 && (
                    <div className="flex items-center gap-2 text-[var(--color-text-dim)] opacity-50 text-xs">
                      <span className="font-medium">{matches[0].payer}</span>
                      <ArrowRight size={12} />
                    </div>
                  )}

                  {/* Current Payer (Next) */}
                  <p className="text-2xl font-display font-bold flex items-center gap-2 text-white">
                    {nextPayer}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[var(--color-secondary)] flex items-center justify-center text-white shadow-lg shadow-[var(--color-secondary)]/30 relative z-10">
                <DollarSign size={24} />
              </div>
            </div>

            {/* Bill Cost Input */}
            <div className="space-y-3 mb-8">
              <label className="text-xs text-[var(--color-text-dim)] font-bold uppercase tracking-wider ml-1">
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
                {/* Quick selection tags */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBillCost(amt.toString())}
                      className="px-3 py-1.5 bg-white/5 hover:bg-[var(--color-primary)]/20 border border-white/5 hover:border-[var(--color-primary)]/50 rounded-lg text-xs font-mono text-[var(--color-text-dim)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !billCost}
              className="w-full py-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-bold text-xl rounded-2xl transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Submitting...
                </>
              ) : (
                <>
                  <Trophy size={24} className="fill-white/20" />
                  <span className="relative z-10">Confirm Match</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-[var(--color-text-dim)] text-center mt-4 opacity-60">
              Winner & Loser calculated automatically from Scoreboard
            </p>
          </div>
        </div>
      </div>

      {/* Winner Screen Modal */}
      <WinnerScreen
        winner={winnerData?.winner}
        loser={winnerData?.loser}
        isOpen={showWinnerScreen}
        onClose={() => setShowWinnerScreen(false)}
        matchData={winnerData}
      />
    </div>
  );
};

export default LogMatchView;
