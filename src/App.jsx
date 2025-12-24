import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LeaderboardView from './components/LeaderboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <GameProvider>
       <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'leaderboard' && <LeaderboardView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}
       </Layout>
    </GameProvider>
  )
}

export default App
