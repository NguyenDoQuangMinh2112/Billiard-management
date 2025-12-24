// API Integration Helper for Billiard Management Frontend
// This file connects the React frontend to the backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const data = await response.json();
            
            // Check if response was successful
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    // ============ Players ============
    async getPlayers() {
        return this.request('/players');
    }

    async createPlayer(name) {
        return this.request('/players', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    async deletePlayer(id) {
        return this.request(`/players/${id}`, {
            method: 'DELETE',
        });
    }

    // ============ Matches ============
    async getMatches() {
        return this.request('/matches');
    }

    async getRecentMatches(limit = 10) {
        return this.request(`/matches/recent?limit=${limit}`);
    }

    async createMatch(winner, loser, cost) {
        return this.request('/matches', {
            method: 'POST',
            body: JSON.stringify({ winner, loser, cost }),
        });
    }

    async deleteMatch(id) {
        return this.request(`/matches/${id}`, {
            method: 'DELETE',
        });
    }

    async getNextPayer() {
        return this.request('/matches/payer/next');
    }

    // ============ Statistics ============
    async getStats() {
        return this.request('/stats');
    }

    async getPlayerStats(id) {
        return this.request(`/stats/player/${id}`);
    }

    async getExpenses(timeframe = 'month') {
        return this.request(`/stats/expenses?timeframe=${timeframe}`);
    }

    async getLeaderboard(limit = 10) {
        return this.request(`/stats/leaderboard?limit=${limit}`);
    }
}

// Export singleton instance
export const billiardAPI = new BilliardAPI();

// Export the class for testing or custom instances
export default BilliardAPI;
