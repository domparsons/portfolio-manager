import React, { useState, useEffect } from 'react';
import { fetchStockData } from '../../../services/alphaVantage';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Card, Input, Button, Form, Spin, Typography, Row, Col, Statistic, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const Watchlist = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [stockInput, setStockInput] = useState('');
  const [watchlist, setWatchlist] = useState([]);

  const userId = 1;

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get(`/api/watchlist/${userId}`);
        setWatchlist(response.data);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
  }, [userId]);

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

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const formatChartData = () => {
    if (!data || !data['Time Series (Daily)']) return [];

    const timeSeries = data['Time Series (Daily)'];
    const formattedData = Object.keys(timeSeries).map((date) => ({
      date: dayjs(date).format('MMM D, YYYY'), // Format date
      price: parseFloat(timeSeries[date]['4. close']),
    }));

    return formattedData.reverse();
  };

  const chartData = formatChartData();

  const getStockInfo = () => {
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

  const stockInfo = getStockInfo();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newSymbol = stockInput.toUpperCase().trim();

    if (newSymbol && !watchlist.includes(newSymbol)) {
      try {
        const response = await axios.post('/api/watchlist', {
          symbol: newSymbol,
          user_id: userId,
        });

        setWatchlist([...watchlist, newSymbol]);
        setSymbol(newSymbol);
        setStockInput('');
      } catch (error) {
        console.error('Error adding to watchlist:', error);
      }
    }
  };

  const removeFromWatchlist = (stock) => {
    setWatchlist(watchlist.filter((s) => s !== stock)); // Remove stock from watchlist
  };

  // Function to set clicked stock symbol
  const handleWatchlistClick = (stock) => {
    setSymbol(stock);
  };

  return (
    <div style={styles.container}>
      <Title level={2} style={styles.title}>
        Stock Watchlist
      </Title>

      <Form layout="inline" onSubmitCapture={handleSubmit} style={styles.form}>
        <Form.Item>
          <Input
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            placeholder="Enter stock symbol..."
            size="large"
            style={styles.input}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<SearchOutlined />}
            style={styles.button}
          >
            Search
          </Button>
        </Form.Item>
      </Form>

      <div>
        {loading ? (
          <Spin size="large" style={styles.spinner} />
        ) : error ? (
          <Text type="danger" style={styles.error}>
            {error}
          </Text>
        ) : (
          <>
            {/* Full-width Watchlist */}
            <Row>
              <Col span={24}>
                <Card title="Your Watchlist" style={{ ...styles.card, marginBottom: '20px' }}>
                  <List
                    dataSource={watchlist}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button onClick={() => removeFromWatchlist(item)}>Remove</Button>,
                        ]}
                      >
                  <span
                    onClick={() => handleWatchlistClick(item)}
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {item}
                  </span>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            {/* Row for Chart and Stock Information */}
            <Row gutter={16}>
              {/* Stock Chart */}
              <Col xs={24} lg={12}>
                {data && chartData.length > 0 && (
                  <Card title={`Stock Data for ${symbol}`} style={styles.card}>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin', 'dataMax']} />
                        <Tooltip
                          formatter={(value) => `$${value.toFixed(2)}`}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="price" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </Col>

              {/* Stock Information */}
              <Col xs={24} lg={12}>
                <Card title="Stock Information" style={styles.infoCard}>
                  {stockInfo ? (
                    <>
                      <Statistic
                        title="Latest Close Price"
                        value={`$${stockInfo.close.toFixed(2)}`}
                        precision={2}
                        style={styles.stat}
                      />
                      <Statistic
                        title="High Price (Daily)"
                        value={`$${stockInfo.high.toFixed(2)}`}
                        precision={2}
                        style={styles.stat}
                      />
                      <Statistic
                        title="Low Price (Daily)"
                        value={`$${stockInfo.low.toFixed(2)}`}
                        precision={2}
                        style={styles.stat}
                      />
                      <Statistic
                        title="Trading Volume"
                        value={stockInfo.volume.toLocaleString()}
                        style={styles.stat}
                      />
                      <Text type="secondary" style={styles.date}>
                        Data as of {dayjs(stockInfo.date).format('MMM D, YYYY')}
                      </Text>
                    </>
                  ) : (
                    <Text>No stock data available</Text>
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

// Custom styles for better layout
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  title: {
    marginBottom: '20px',
  },
  form: {
    marginBottom: '20px',
  },
  input: {
    width: '300px',
  },
  button: {
    marginLeft: '10px',
  },
  spinner: {
    marginTop: '50px',
  },
  error: {
    marginTop: '20px',
    fontSize: '16px',
  },
  row: {
    marginTop: '20px',
  },
  card: {
    width: '100%',
  },
  infoCard: {
    height: '100%',
  },
  stat: {
    marginBottom: '16px',
  },
  date: {
    marginTop: '16px',
    display: 'block',
  },
};

export default Watchlist;