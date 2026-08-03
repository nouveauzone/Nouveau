import API_URL from "../config/api";

export const metricsService = {
  /**
   * Get current search count
   */
  async getSearchCount() {
    try {
      const response = await fetch(`${API_URL}/api/metrics/searches`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch search count");
      const data = await response.json();
      return data.totalSearches || 0;
    } catch (error) {
      console.error("Error fetching search count:", error);
      return 0;
    }
  },

  /**
    * Get site view count
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

  /**
   * Track a user search
   */
  async trackSearch(query) {
    try {
      const response = await fetch(`${API_URL}/api/metrics/searches`, {
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
