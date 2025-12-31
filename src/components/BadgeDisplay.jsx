import { useState, useEffect } from "react";
import { billiardAPI } from "../services/api";
import "./BadgeDisplay.css";

const BadgeDisplay = ({ playerId, inline = false }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerBadges();
  }, [playerId]);

  const fetchPlayerBadges = async () => {
    if (!playerId) return;

    setLoading(true);
    try {
      const response = await billiardAPI.getPlayerBadges(playerId);
      if (response.success) {
        setBadges(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching player badges:", error);
      setBadges([]);
    }
    setLoading(false);
  };

  if (loading) return null;
  if (badges.length === 0) return null;

  return (
    <div className={`badge-display ${inline ? "badge-display-inline" : ""}`}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="badge-item"
          title={badge.short_description}
        >
          <span className="badge-icon">{badge.icon}</span>
          {!inline && <span className="badge-name">{badge.name}</span>}
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
