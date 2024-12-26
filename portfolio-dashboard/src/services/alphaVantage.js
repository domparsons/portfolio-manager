// import axios from 'axios';
// import mockData from '../data/stockData.json';
// import dayjs from 'dayjs';
//
// // const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
// const BASE_URL = 'https://www.alphavantage.co/query';
//
// const USE_MOCK_DATA = true;
//
// const fetchStockData = async (symbol, interval = '60min') => {
//   try {
//     const response = await axios.get(BASE_URL, {
//       params: {
//         function: 'TIME_SERIES_DAILY',
//         symbol: symbol,
//         apikey: ALPHA_VANTAGE_API_KEY,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching stock data:', error);
//     throw error;
//   }
// };
//
// export const getData = async (symbol, setError, setLoading) => {
//   setLoading(true);
//   try {
//     if (USE_MOCK_DATA) {
//       console.log('Using mock stock data:', mockData);
//       return mockData;
//     } else {
//       const liveData = await fetchStockData(symbol);
//       console.log('Using live stock data:', liveData);
//       return liveData;
//     }
//   } catch (err) {
//     console.error('Error in getData:', err);
//     setError('Failed to fetch stock data.');
//     return null;
//   } finally {
//     setLoading(false);
//   }
// };
//
// export const formatChartData = (data, timeframe) => {
//   if (!data || !data['Time Series (Daily)']) {
//     console.error('Invalid data format or missing "Time Series (Daily)"', data);
//     return [];
//   }
//
//   const timeSeries = data['Time Series (Daily)'];
//   const now = dayjs();
//
//   const filteredData = Object.keys(timeSeries).map((timestamp) => {
//     const stockDate = dayjs(timestamp);
//     const price = parseFloat(timeSeries[timestamp]['4. close']);
//
//     switch (timeframe) {
//       case '7d': // Last 7 days
//         if (stockDate.isAfter(now.subtract(7, 'days'), 'day')) {
//           return { date: stockDate.format('MMM D, YYYY'), price }; // Only date comparison (not time)
//         }
//         break;
//       case '30d': // Last 30 days
//         if (stockDate.isAfter(now.subtract(30, 'days'))) {
//           return { date: stockDate.format('MMM D, YYYY HH:mm'), price };
//         }
//         break;
//       default:
//         return { date: stockDate.format('MMM D, YYYY HH:mm'), price };
//     }
//     return null;
//   }).filter((item) => item !== null); // Remove null values
//
//   // Reverse the data to display the most recent data on the right
//   return filteredData.reverse();
// };
//
// export const getStockInfo = (data) => {
//   if (!data || !data['Time Series (Daily)']) return null;
//
//   const latestDate = Object.keys(data['Time Series (Daily)'])[0];
//   const latestData = data['Time Series (Daily)'][latestDate];
//
//   return {
//     date: latestDate,
//     close: parseFloat(latestData['4. close']),
//     high: parseFloat(latestData['2. high']),
//     low: parseFloat(latestData['3. low']),
//     volume: parseInt(latestData['5. volume'], 10),
//   };
// };
