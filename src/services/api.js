// API Integration Helper for Billiard Management Frontend
// This file connects the React frontend to the backend API

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// API Response Type (for documentation purposes in JS)
// interface ApiResponse<T> {
//     success: boolean;
//     data?: T;
//     error?: string;
//     message?: string;
// }

// API Client Class
class BilliardAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      // Check if response was successful
      if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // ============ Players ============
  async getPlayers() {
    return this.request("/players");
  }

  async createPlayer(name) {
    return this.request("/players", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async deletePlayer(id) {
    return this.request(`/players/${id}`, {
      method: "DELETE",
    });
  }

  // ============ Matches ============
  async getMatches() {
    return this.request("/matches");
  }

  async getRecentMatches(limit = 10) {
    return this.request(`/matches/recent?limit=${limit}`);
  }

  async createMatch(winners, loser, cost, participants = [], details = []) {
    return this.request("/matches", {
      method: "POST",
      body: JSON.stringify({ winners, loser, cost, participants, details }),
    });
  }

  async deleteMatch(id) {
    return this.request(`/matches/${id}`, {
      method: "DELETE",
    });
  }

  async getNextPayer() {
    return this.request("/matches/payer/next");
  }

  // ============ Statistics ============
  async getStats(params = {}) {
    const query = new URLSearchParams();
    if (params.timeframe) query.append("timeframe", params.timeframe);
    return this.request(`/stats?${query.toString()}`);
  }

  async getPlayerStats(id) {
    return this.request(`/stats/player/${id}`);
  }

  async getExpenses(timeframe = "month") {
    return this.request(`/stats/expenses?timeframe=${timeframe}`);
  }

  async getLeaderboard(limit = 10) {
    return this.request(`/stats/leaderboard?limit=${limit}`);
  }

  // ============ 1v1 Duel ============
  async createDuelSession(player1Name, player2Name) {
    return this.request("/duel/sessions", {
      method: "POST",
      body: JSON.stringify({ player1Name, player2Name }),
    });
  }

  async getDuelSessions(limit = 20) {
    return this.request(`/duel/sessions?limit=${limit}`);
  }

  async getDuelSession(id) {
    return this.request(`/duel/sessions/${id}`);
  }

  async completeDuelSession(id, totalCost, payerType) {
    return this.request(`/duel/sessions/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ totalCost, payerType }),
    });
  }

  async deleteDuelSession(id) {
    return this.request(`/duel/sessions/${id}`, { method: "DELETE" });
  }

  async addDuelRound(
    sessionId,
    player1Wins,
    player1Losses,
    player2Wins,
    player2Losses,
    cost,
    payerType,
  ) {
    return this.request("/duel/rounds", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        player1Wins,
        player1Losses,
        player2Wins,
        player2Losses,
        cost,
        payerType,
      }),
    });
  }

  async getDuelRounds(sessionId) {
    return this.request(`/duel/sessions/${sessionId}/rounds`);
  }

  async deleteDuelRound(id) {
    return this.request(`/duel/rounds/${id}`, { method: "DELETE" });
  }

  async getDuelPlayers() {
    return this.request("/duel/players");
  }

  async getDuelLeaderboard(limit = 20) {
    return this.request(`/duel/leaderboard?limit=${limit}`);
  }

  async getDuelHistory(limit = 50) {
    return this.request(`/duel/history?limit=${limit}`);
  }
}

// Export singleton instance
export const billiardAPI = new BilliardAPI();

// Export the class for testing or custom instances
export default BilliardAPI;
