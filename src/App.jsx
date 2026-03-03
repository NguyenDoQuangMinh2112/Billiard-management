import { useState, lazy, Suspense } from "react";
import { GameProvider } from "./context/GameContext";
import { ToastProvider } from "./components/Toast";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load heavy views — each becomes its own chunk
const Dashboard = lazy(() => import("./components/Dashboard"));
const LeaderboardView = lazy(() => import("./components/LeaderboardView"));
const HistoryView = lazy(() => import("./components/HistoryView"));
const SettingsView = lazy(() => import("./components/SettingsView"));
const LogMatchView = lazy(() => import("./components/LogMatchView"));
const HighlightsView = lazy(() => import("./components/HighlightsView"));
const OneVOneView = lazy(() => import("./components/OneVOneView"));

// Skeleton fallback while lazy chunks load
const TabSkeleton = () => (
  <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 min-h-screen animate-pulse">
    <div className="h-10 w-48 bg-white/5 rounded-2xl mb-8" />
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-36 bg-white/5 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-white/5 rounded-2xl mb-8" />
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-80 bg-white/5 rounded-2xl" />
      <div className="h-80 bg-white/5 rounded-2xl" />
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <ToastProvider>
      <GameProvider>
        <LoadingSpinner />
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "logmatch" && <LogMatchView />}
            {activeTab === "1v1" && <OneVOneView />}
            {activeTab === "leaderboard" && <LeaderboardView />}
            {activeTab === "history" && <HistoryView />}
            {activeTab === "highlights" && <HighlightsView />}
            {activeTab === "settings" && <SettingsView />}
          </Suspense>
        </Layout>
      </GameProvider>
    </ToastProvider>
  );
}

export default App;
