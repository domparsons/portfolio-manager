import { Asset } from '@/api/asset'

export const getWatchlist = async (
  user_id: string | null,
  setWatchlistAssets: (assets: Asset[]) => void
) => {
  const response = await fetch(`http://localhost:8000/watchlist/${user_id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  setWatchlistAssets(data)
}
