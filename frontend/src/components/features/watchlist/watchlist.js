import React, { useState, useEffect } from 'react';
import { fetchStockData } from '../../../services/alphaVantage';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const Watchlist = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [stockInput, setStockInput] = useState('');

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const stockData = await fetchStockData(symbol);
        setData(stockData);
      } catch (err) {
        setError('Failed to fetch stock data.');
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [symbol]);

  const formatChartData = () => {
    if (!data || !data['Time Series (15min)']) return [];

    const timeSeries = data['Time Series (15min)'];
    const formattedData = Object.keys(timeSeries).map((date) => ({
      date,
      price: parseFloat(timeSeries[date]['4. close']),
    }));

    return formattedData.reverse();
  };

  const chartData = formatChartData();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (stockInput) {
      setSymbol(stockInput.toUpperCase());
      setStockInput('');
    }
  };

  return (
    <div>
      <h1>Stock Data for {symbol}</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter stock symbol..."
          value={stockInput}
          onChange={(e) => setStockInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && chartData.length > 0 && (
        <div style={{ width: '100%', height: 300 }}>
          <h3>Data:</h3>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis domain={['dataMin', 'dataMax']} />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="price" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Watchlist;