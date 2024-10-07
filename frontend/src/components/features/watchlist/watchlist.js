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
import { Card, Input, Button, Form, Spin, Typography, Row, Col, Statistic } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

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

  // Format chart data using dayjs
  const formatChartData = () => {
    if (!data || !data['Time Series (Daily)']) return [];

    const timeSeries = data['Time Series (Daily)'];
    const formattedData = Object.keys(timeSeries).map((date) => ({
      date: dayjs(date).format('MMM D, YYYY'), // Format date as "Oct 6, 2023"
      price: parseFloat(timeSeries[date]['4. close']),
    }));

    return formattedData.reverse();
  };

  const chartData = formatChartData();

  // Get latest stock information from the most recent trading day
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (stockInput) {
      setSymbol(stockInput.toUpperCase());
      setStockInput('');
    }
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

      {loading ? (
        <Spin size="large" style={styles.spinner} />
      ) : error ? (
        <Text type="danger" style={styles.error}>
          {error}
        </Text>
      ) : (
        data && chartData.length > 0 && (
          <Row gutter={24} style={styles.row}>
            {/* Chart Card */}
            <Col span={16}>
              <Card title={`Stock Data for ${symbol}`} style={styles.card}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin', 'dataMax']} />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`}
                             labelFormatter={(label) => `Date: ${label}`} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="price" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Stock Information Card */}
            <Col span={8}>
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
        )
      )}
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