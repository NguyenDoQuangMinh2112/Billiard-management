import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { billiardAPI } from "../services/api";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  // Initialize with default pool players
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState([]); // Store server stats
  const [payerIndex, setPayerIndex] = useState(0);
  const [nextPayer, setNextPayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from API
  useEffect(() => {
    let cancelled = false; // prevent state update after unmount

    const fetchData = async () => {
      try {
        setLoading(true);

        const [playersRes, matchesRes, statsRes, payerRes] = await Promise.all([
          billiardAPI.getPlayers(),
          billiardAPI.getRecentMatches(50),
          billiardAPI.getStats(),
          billiardAPI.getNextPayer(),
        ]);

        if (cancelled) return;

        if (playersRes.success && playersRes.data)
          setPlayers(playersRes.data.map((p) => p.name));
        if (matchesRes.success && matchesRes.data) setMatches(matchesRes.data);
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (payerRes.success && payerRes.data) setNextPayer(payerRes.data.name);

        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch data:", err);
          setError("Failed to load data from server");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Helper to refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const statsResponse = await billiardAPI.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (e) {
      console.error("Failed to refresh stats", e);
    }
  }, []);

  // Update payerIndex when players or nextPayer changes
  useEffect(() => {
    if (nextPayer && players.length > 0) {
      const index = players.indexOf(nextPayer);
      if (index !== -1) {
        setPayerIndex(index);
      }
    }
  }, [nextPayer, players]);

  // ... (Notification logic unchanged)

  // Notification History State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (type, title, message, data = {}) => {
    // ... (unchanged)
    const newNotif = {
      id: Date.now(),
      type, // 'success', 'info', 'warning'
      title,
      message,
      timestamp: new Date(),
      read: false,
      data,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const addMatch = useCallback(
    async (matchData) => {
      try {
        // Get current payer BEFORE creating match
        const currentPayerName = nextPayer;

        // matchData: { winners, loser, cost, participants, details }
        const response = await billiardAPI.createMatch(
          matchData.winners, // Changed from matchData.winner to matchData.winners
          matchData.loser,
          matchData.cost,
          matchData.participants,
          matchData.details,
        );

        if (response.success && response.data) {
          // Add the new match to local state
          setMatches([response.data, ...matches]);

          // Update next payer info
          const payerResponse = await billiardAPI.getNextPayer();
          if (payerResponse.success && payerResponse.data) {
            const newNextPayer = payerResponse.data.name;
            setNextPayer(newNextPayer);

            // Add to Notification History
            addNotification(
              "payment",
              "Bill Submitted",
              `${currentPayerName} paid ${Number(
                matchData.cost,
              ).toLocaleString()}đ. Next up: ${newNextPayer}`,
              {
                currentPayer: currentPayerName,
                nextPayer: newNextPayer,
                cost: matchData.cost,
              },
            );
          }

          // IMPORTANT: Refresh Stats from Backend
          await refreshStats();

          return { success: true, data: response.data };
        } else {
          console.error("Failed to create match:", response.error);
          return {
            success: false,
            error: response.error || "Failed to create match",
          };
        }
      } catch (error) {
        console.error("Error creating match:", error);
        return { success: false, error: "Failed to create match" };
      }
    },
    [matches, nextPayer, refreshStats, addNotification],
  );

  const deleteMatch = useCallback(
    async (id) => {
      try {
        const response = await billiardAPI.deleteMatch(id);

        if (response.success) {
          // Remove match from local state
          setMatches(matches.filter((m) => m.id !== id));

          // Refresh next payer info
          const payerResponse = await billiardAPI.getNextPayer();
          if (payerResponse.success && payerResponse.data) {
            setNextPayer(payerResponse.data.nextPayer);
          }

          // Refresh Stats
          await refreshStats();

          return { success: true };
        } else {
          console.error("Failed to delete match:", response.error);
          return {
            success: false,
            error: response.error || "Failed to delete match",
          };
        }
      } catch (error) {
        console.error("Error deleting match:", error);
        return { success: false, error: "Failed to delete match" };
      }
    },
    [matches, refreshStats],
  );

  const getExpenses = useCallback(
    (timeframe = "month") => {
      const now = new Date();
      return matches.reduce(
        (acc, m) => {
          const d = new Date(m.date);

          let include = false;
          if (timeframe === "week") {
            const oneDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.round(Math.abs((now - d) / oneDay));
            include = diffDays <= 7;
          }
          if (timeframe === "month")
            include =
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear();
          if (timeframe === "year")
            include = d.getFullYear() === now.getFullYear();
          if (timeframe === "all") include = true;

          if (include) {
            acc.total += Number(m.cost);
            acc.byPlayer[m.payer] =
              (acc.byPlayer[m.payer] || 0) + Number(m.cost);
          }
          return acc;
        },
        { total: 0, byPlayer: {} },
      );
    },
    [matches],
  );

  const allStats = stats; // Use server stats instead of getStats() calculation

  return (
    <GameContext.Provider
      value={{
        players,
        matches,
        payerIndex,
        allStats,
        nextPayer: nextPayer || players[payerIndex],
        addMatch,
        deleteMatch,
        getExpenses,
        loading,
        error,
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
