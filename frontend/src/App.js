import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Menu from './components/common/menu';
import Watchlist from './components/features/watchlist/watchlist';

const { Sider, Content, Header, Footer } = Layout;

const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider>
          <Menu />
        </Sider>

        <Layout>
          <Content style={{ margin: '0px', padding: '85px', background: '#fff' }}>
            <Routes>
              <Route path="/watchlist" element={<Watchlist />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;