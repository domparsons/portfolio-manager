const fetchWatchlist = async (token, userId) => {
  const API_BASE_URL = "http://127.0.0.1:8000";
  const endpoint = `${API_BASE_URL}/api/v1/watchlist/watchlist/user/${userId}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch watchlist: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
};

export { fetchWatchlist };
