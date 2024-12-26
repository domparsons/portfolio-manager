import React, { useState, useEffect } from 'react';
import { formatChartData, getData, getStockInfo } from '../../../services/alphaVantage';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const { Title, Text } = Typography;

const Watchlist = () => {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbol, setSymbol] = useState('AAPL');
  const [stockInput, setStockInput] = useState('');
  const [strokeColour, setStrokeColour] = useState('#602e7f');
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await getData(symbol, setError, setLoading);
        setRawData(result);

      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol, timeframe]);


  const chartData = formatChartData(rawData, timeframe);

  const stockInfo = getStockInfo();

  const handleOptionClick = (option) => {
    setTimeframe(option); // Update the selected timeframe
  };

  return (
    <div style={styles.container}>
      <Title level={2} style={styles.title}>
        Stock Watchlist
      </Title>

      <Form layout="inline" style={styles.form}>
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


            {/* Row for Chart and Stock Information */}
            <Row gutter={16}>
              {/* Stock Chart */}
              {rawData && chartData.length > 0 && (
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{`Stock Data for ${symbol}`}</span>
                      <div>
                        <button style={styles.optionButton} onClick={() => handleOptionClick('24h')}>24h</button>
                        <button style={styles.optionButton} onClick={() => handleOptionClick('7d')}>7d</button>
                        <button style={styles.optionButton} onClick={() => handleOptionClick('30d')}>30d</button>
                      </div>
                    </div>
                  }
                  style={styles.card}
                > <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin', 'dataMax']} />
                    <Tooltip
                      formatter={(value) => `$${value.toFixed(2)}`}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="price" stroke={strokeColour} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                </Card>
              )}
            </Row>
            <Row gutter={16} style={styles.row}>
              Stock Information
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