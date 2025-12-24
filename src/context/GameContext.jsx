import { createContext, useContext, useState, useEffect } from 'react';

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
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('pool_players');
    return saved ? JSON.parse(saved) : ['Minh', 'Toàn', 'Hải'];
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('pool_matches');
    return saved ? JSON.parse(saved) : [];
  });

  // Track who is paying next (index of players array)
  // We can derive this from match history, but storing an index allows for flexibility overrides
  const [payerIndex, setPayerIndex] = useState(() => {
    const saved = localStorage.getItem('pool_payer_index');
    return saved ? JSON.parse(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('pool_players', JSON.stringify(players));
    localStorage.setItem('pool_matches', JSON.stringify(matches));
    localStorage.setItem('pool_payer_index', JSON.stringify(payerIndex));
  }, [players, matches, payerIndex]);

  const addMatch = (matchData) => {
    // matchData: { winner, loser, cost, date }
    const newMatch = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        payer: players[payerIndex], // The current designated payer pays this match
        ...matchData
    };

    setMatches([newMatch, ...matches]);
    
    // Rotate payer
    setPayerIndex((prev) => (prev + 1) % players.length);
  };

  const deleteMatch = (id) => {
     setMatches(matches.filter(m => m.id !== id));
     // Optional: Revert payer rotation? For now, keep it simple.
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
  const nextPayer = players[payerIndex];

  return (
    <GameContext.Provider value={{
        players,
        matches,
        payerIndex,
        allStats,
        nextPayer,
        addMatch,
        deleteMatch,
        getExpenses,
        theme,
        toggleTheme
    }}>
      {children}
    </GameContext.Provider>
  );
};
