import { useGame } from '../context/GameContext';
import './LoadingSpinner.css';

export default function LoadingSpinner() {
  const { loading, error } = useGame();

  if (!loading && !error) return null;

  return (
    <div className="loading-container">
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading billiard data...</p>
        </div>
      )}
      {error && !loading && (
        <div className="error-message">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
}
