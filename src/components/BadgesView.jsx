import { useState, useEffect } from "react";
import { billiardAPI } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import Toast from "./Toast";
import "./BadgesView.css";

const BadgesView = () => {
  const [badges, setBadges] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerBadges, setPlayerBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [badgesRes, playersRes, playerBadgesRes] = await Promise.all([
      billiardAPI.getBadges(),
      billiardAPI.getPlayers(),
      billiardAPI.getAllPlayerBadges(),
    ]);

    if (badgesRes.success) {
      setBadges(badgesRes.data || []);
    }

    if (playersRes.success) {
      setPlayers(playersRes.data || []);
    }

    if (playerBadgesRes.success) {
      setPlayerBadges(playerBadgesRes.data || []);
    }

    setLoading(false);
  };

  const handleAwardBadge = async () => {
    if (!selectedPlayer || !selectedBadge) {
      setToast({
        type: "error",
        message: "Please select both a player and a badge",
      });
      return;
    }

    const response = await billiardAPI.awardBadge(
      parseInt(selectedPlayer),
      selectedBadge
    );

    if (response.success) {
      setToast({
        type: "success",
        message: "Badge awarded successfully!",
      });
      setSelectedPlayer("");
      setSelectedBadge("");
      fetchData();
    } else {
      setToast({
        type: "error",
        message: response.error || "Failed to award badge",
      });
    }
  };

  const handleRemoveBadge = async (
    playerId,
    badgeId,
    playerName,
    badgeName
  ) => {
    if (!confirm(`Remove ${badgeName} from ${playerName}?`)) return;

    const response = await billiardAPI.removeBadge(playerId, badgeId);

    if (response.success) {
      setToast({
        type: "success",
        message: "Badge removed successfully",
      });
      fetchData();
    } else {
      setToast({
        type: "error",
        message: response.error || "Failed to remove badge",
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="badges-view">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="badges-header">
        <h2>🏆 Badges & Achievements</h2>
        <p>Manage player badges and achievements</p>
      </div>

      {/* Available Badges */}
      <div className="badges-section">
        <h3>Available Badges</h3>
        <div className="badges-list">
          {badges.map((badge) => (
            <div key={badge.id} className="badge-card">
              <div className="badge-card-icon">{badge.icon}</div>
              <div className="badge-card-info">
                <h4>{badge.name}</h4>
                <p className="badge-criterion">{badge.short_description}</p>
                <p className="badge-details">{badge.criterion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Award Badge */}
      <div className="badges-section">
        <h3>Award Badge</h3>
        <div className="award-badge-form">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="form-select"
          >
            <option value="">Select Player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          <select
            value={selectedBadge}
            onChange={(e) => setSelectedBadge(e.target.value)}
            className="form-select"
          >
            <option value="">Select Badge</option>
            {badges.map((badge) => (
              <option key={badge.id} value={badge.id}>
                {badge.icon} {badge.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleAwardBadge}
            className="btn-primary"
            disabled={!selectedPlayer || !selectedBadge}
          >
            Award Badge
          </button>
        </div>
      </div>

      {/* Player Badges */}
      <div className="badges-section">
        <h3>Player Badges</h3>
        {playerBadges.length === 0 ? (
          <p className="no-badges">No badges awarded yet</p>
        ) : (
          <div className="player-badges-list">
            {playerBadges.map((pb) => (
              <div key={pb.id} className="player-badge-item">
                <div className="player-badge-info">
                  <span className="player-badge-icon">{pb.icon}</span>
                  <div>
                    <strong>{pb.player_name}</strong> earned{" "}
                    <span className="badge-highlight">{pb.badge_name}</span>
                  </div>
                  <span className="player-badge-date">
                    {new Date(pb.awarded_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleRemoveBadge(
                      pb.player_id,
                      pb.badge_id,
                      pb.player_name,
                      pb.badge_name
                    )
                  }
                  className="btn-remove"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesView;
