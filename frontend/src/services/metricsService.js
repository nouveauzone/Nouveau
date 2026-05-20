import API_URL from "../config/api";

export const metricsService = {
  /**
   * Get current search count
   */
  async getSearchCount() {
    try {
<<<<<<< HEAD
      const response = await fetch(`${API_URL}/api/metrics/searches`, {
  /**
   * Get current month site view count
   */
  async getSiteViews() {
    try {
      const response = await fetch(`${API_URL}/api/metrics/views`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch site views");
      const data = await response.json();
      return data.views || 0;
    } catch (error) {
      console.error("Error fetching site views:", error);
      return 0;
    }
  },
    try {
      const response = await fetch(`${API_URL}/api/metrics/views`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch site views");
      const data = await response.json();
      return data.views || 0;
    } catch (error) {
      console.error("Error fetching site views:", error);
      return 0;
    }
  },

  /**
>>>>>>> e3a8116 (Footer: surface site views + restore Made with ♥ in India; metrics helper added)
   * Track a user search
   */
  async trackSearch(query) {
    try {
<<<<<<< HEAD
      const response = await fetch(`${API_URL}/api/metrics/searches`, {
=======
      const response = await fetch(`${API_URL}/api/metrics/searches`, {
>>>>>>> e3a8116 (Footer: surface site views + restore Made with ♥ in India; metrics helper added)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query || "" }),
      });
      if (!response.ok) throw new Error("Failed to track search");
      const data = await response.json();
      return data.totalSearches || 0;
    } catch (error) {
      console.error("Error tracking search:", error);
      return 0;
    }
  },
};
