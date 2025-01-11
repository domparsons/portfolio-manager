const API_URL = 'http://127.0.0.1:8000/api/watchlists';

export const createWatchlist = async (watchlistData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(watchlistData),
  });

  if (!response.ok) {
    throw new Error('Failed to create watchlist');
  }

  return await response.json();
};

export const getWatchlistById = async (watchlistId) => {
  const response = await fetch(`${API_URL}/${watchlistId}`);

  if (!response.ok) {
    throw new Error('Dashboard not found');
  }

  return await response.json();
};