import { Button, Form, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import React from 'react';

const StockSearch = () => {
  return (
    <Form layout="inline" style={styles.form} onFinish={handleSearch}>
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
          icon={<SearchOutlined />}
          style={styles.button}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Form.Item>
    </Form>
  )
}

export default StockSearch;