import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, Typography, Row, Spin, Button, Select } from 'antd';
import { getData, getStockInfo } from '../../services/alphaVantage.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Title: AntTitle, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticker, setTicker] = useState('AAPL');
  const [chartData, setChartData] = useState(null)


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawData = await getData(ticker, setError, setLoading);

      const labels = Object.keys(rawData);
      const data = Object.values(rawData);

      labels.reverse();
      data.reverse();

      setChartData({
        labels,
        datasets: [
          {
            label: `${ticker} Closing Prices`,
            data,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.2,
          },
        ],
      });
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTickerChange = (value) => {
    setTicker(value);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `Price: $${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
        },
      },
    },
  };

  useEffect(() => {
    fetchData().then(r => console.log(r));
  }, [ticker]);

  return (
    <div style={styles.container}>
      <AntTitle level={2} style={styles.title}>
        Dashboard
      </AntTitle>

      <Select
        defaultValue="AAPL"
        style={{ width: 120 }}
        onChange={handleTickerChange}
        options={[
        { value: 'AAPL', label: <span>Apple</span> },
        { value: 'TSLA', label: <span>Tesla</span> },
        { value: 'NVDA', label: <span>NVIDIA</span> }
      ]} />

      <div>
        {loading ? (
          <Spin size="large" style={styles.spinner} />
        ) : error ? (
          <Text type="danger" style={styles.error}>
            {error}
          </Text>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Card title="Price Chart" style={styles.card}>
                {chartData ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Text>No chart data available</Text>
                )}
              </Card>

              {/*<Col xs={24} lg={12}>*/}
              {/*  <Card title="Stock Information" style={styles.card}>*/}
              {/*    {stockInfo ? (*/}
              {/*      <>*/}
              {/*        <Statistic*/}
              {/*          title="Latest Close Price"*/}
              {/*          value={`$${stockInfo.close.toFixed(2)}`}*/}
              {/*          style={styles.stat}*/}
              {/*        />*/}
              {/*        <Statistic*/}
              {/*          title="High Price (Daily)"*/}
              {/*          value={`$${stockInfo.high.toFixed(2)}`}*/}
              {/*          style={styles.stat}*/}
              {/*        />*/}
              {/*        <Statistic*/}
              {/*          title="Low Price (Daily)"*/}
              {/*          value={`$${stockInfo.low.toFixed(2)}`}*/}
              {/*          style={styles.stat}*/}
              {/*        />*/}
              {/*        <Statistic*/}
              {/*          title="Trading Volume"*/}
              {/*          value={stockInfo.volume.toLocaleString()}*/}
              {/*          style={styles.stat}*/}
              {/*        />*/}
              {/*        <Text type="secondary" style={styles.date}>*/}
              {/*          Data as of {dayjs(stockInfo.date).format('MMM D, YYYY')}*/}
              {/*        </Text>*/}
              {/*      </>*/}
              {/*    ) : (*/}
              {/*      <Text>No stock data available</Text>*/}
              {/*    )}*/}
              {/*  </Card>*/}
              {/*</Col>*/}
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

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
  card: {
    width: '100%',
    marginTop: '20px',
  },
  stat: {
    marginBottom: '16px',
  },
  date: {
    marginTop: '16px',
    display: 'block',
  },
};

export default Dashboard;