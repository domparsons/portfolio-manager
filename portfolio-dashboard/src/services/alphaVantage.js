import axios from 'axios';
import mockData from '../data/stockData.json';
import dayjs from 'dayjs';

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

const USE_MOCK_DATA = true;

const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

export const getData = async (symbol, setError, setLoading) => {
  try {
    if (USE_MOCK_DATA) {
      console.log('Using mock stock data:', mockData);
      return formatChartData(mockData, 'week');
    } else {
      const liveData = await fetchStockData(symbol);
      console.log('Using live stock data:', liveData);

      if (liveData['Time Series (Daily)']) {
        return formatChartData(liveData, 'week');
      } else {
        setError('Failed to fetch stock data.');
        return null;
      }
    }
  } catch (err) {
    console.error('Error in getData:', err);
    setError('Failed to fetch stock data.');
    return null;
  } finally {
    setLoading(false);
  }
};

export const formatChartData = (data) => {
  if (!data) {
    console.error('Invalid data format or missing "Time Series (Daily)"', data);
    return [];
  }
  const now = dayjs();
  return extractDailyClose(data);
};

function extractDailyClose(data) {
  const timeSeries = data["Time Series (Daily)"];
  const dailyClose = {};

  for (const [date, values] of Object.entries(timeSeries)) {
    dailyClose[date] = parseFloat(values["4. close"]);
  }

  return dailyClose;
}

export const getStockInfo = (data) => {
  if (!data || !data['Time Series (Daily)']) return null;

  const latestDate = Object.keys(data['Time Series (Daily)'])[0];
  const latestData = data['Time Series (Daily)'][latestDate];

  return {
    date: latestDate,
    close: parseFloat(latestData['4. close']),
    high: parseFloat(latestData['2. high']),
    low: parseFloat(latestData['3. low']),
    volume: parseInt(latestData['5. volume'], 10),
  };
};
