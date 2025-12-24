import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LeaderboardView from './components/LeaderboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ToastProvider>
      <GameProvider>
         <LoadingSpinner />
         <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'leaderboard' && <LeaderboardView />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'settings' && <SettingsView />}
         </Layout>
      </GameProvider>
    </ToastProvider>
  )
}

export default App
