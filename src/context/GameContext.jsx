import { createContext, useContext, useState, useEffect } from 'react';
import { billiardAPI } from '../services/api';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('pool_theme') || 'dark');

  // Update Body Class on Theme Change
  useEffect(() => {
      if (theme === 'light') {
          document.body.classList.add('light-mode');
      } else {
          document.body.classList.remove('light-mode');
      }
      localStorage.setItem('pool_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(curr => curr === 'dark' ? 'light' : 'dark');
  };

  // Initialize with default pool players
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [payerIndex, setPayerIndex] = useState(0);
  const [nextPayer, setNextPayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch players
        const playersResponse = await billiardAPI.getPlayers();
        if (playersResponse.success && playersResponse.data) {
          setPlayers(playersResponse.data.map(p => p.name));
        }

        // Fetch recent matches
        const matchesResponse = await billiardAPI.getRecentMatches(50);
        if (matchesResponse.success && matchesResponse.data) {
          setMatches(matchesResponse.data);
        }

        // Fetch next payer
        const payerResponse = await billiardAPI.getNextPayer();
        if (payerResponse.success && payerResponse.data) {
          setNextPayer(payerResponse.data.nextPayer);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run once on mount

  // Update payerIndex when players or nextPayer changes
  useEffect(() => {
    if (nextPayer && players.length > 0) {
      const index = players.indexOf(nextPayer);
      if (index !== -1) {
        setPayerIndex(index);
      }
    }
  }, [nextPayer, players]);

  const addMatch = async (matchData) => {
    try {
      // matchData: { winner, loser, cost }
      const response = await billiardAPI.createMatch(
        matchData.winner,
        matchData.loser,
        matchData.cost
      );

      if (response.success && response.data) {
        // Add the new match to local state
        setMatches([response.data, ...matches]);
        
        // Update next payer info
        const payerResponse = await billiardAPI.getNextPayer();
        if (payerResponse.success && payerResponse.data) {
          setNextPayer(payerResponse.data.nextPayer);
        }
        
        return { success: true, data: response.data };
      } else {
        console.error('Failed to create match:', response.error);
        return { success: false, error: response.error || 'Failed to create match' };
      }
    } catch (error) {
      console.error('Error creating match:', error);
      return { success: false, error: 'Failed to create match' };
    }
  };

  const deleteMatch = async (id) => {
    try {
      const response = await billiardAPI.deleteMatch(id);
      
      if (response.success) {
        // Remove match from local state
        setMatches(matches.filter(m => m.id !== id));
        
        // Refresh next payer info
        const payerResponse = await billiardAPI.getNextPayer();
        if (payerResponse.success && payerResponse.data) {
          setNextPayer(payerResponse.data.nextPayer);
        }
        
        return { success: true };
      } else {
        console.error('Failed to delete match:', response.error);
        return { success: false, error: response.error || 'Failed to delete match' };
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      return { success: false, error: 'Failed to delete match' };
    }
  };

  const getStats = () => {
    const stats = players.map(name => ({
        name,
        wins: matches.filter(m => m.winner === name).length,
        losses: matches.filter(m => m.loser === name).length,
        totalSpent: matches.filter(m => m.payer === name).reduce((sum, m) => sum + Number(m.cost), 0),
        matchesPlayed: matches.filter(m => m.winner === name || m.loser === name).length
    }));

    // Sort by Wins (desc)
    return stats.sort((a, b) => b.wins - a.wins);
  };

  const getExpenses = (timeframe = 'month') => {
    // Simple aggregator for now
    // In a real app we'd use date-fns to group by week/month/year
    const now = new Date();
    
    return matches.reduce((acc, m) => {
        const d = new Date(m.date);
        
        let include = false;
        if (timeframe === 'week') {
            // Simple "Same Week" logic (ISO week would be better but this works for simple "this week")
            const oneDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.round(Math.abs((now - d) / oneDay));
            include = diffDays <= 7; 
        }
        if (timeframe === 'month') include = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (timeframe === 'year') include = d.getFullYear() === now.getFullYear();
        if (timeframe === 'all') include = true;

        if (include) {
            acc.total += Number(m.cost);
            acc.byPlayer[m.payer] = (acc.byPlayer[m.payer] || 0) + Number(m.cost);
        }
        return acc;
    }, { total: 0, byPlayer: {} });
  };

  const allStats = getStats();

  return (
    <GameContext.Provider value={{
        players,
        matches,
        payerIndex,
        allStats,
        nextPayer: nextPayer || players[payerIndex],
        addMatch,
        deleteMatch,
        getExpenses,
        theme,
        toggleTheme,
        loading,
        error
    }}>
      {children}
    </GameContext.Provider>
  );
};
