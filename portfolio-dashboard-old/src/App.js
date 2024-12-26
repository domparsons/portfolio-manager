import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import SidebarMenu from './components/common/menu';
import Watchlist from './components/features/watchlist/watchlist';

const { Sider, Content } = Layout;

const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider width={256} style={{ background: '#001529' }}>
          <SidebarMenu />
        </Sider>

        <Layout>
          <Content style={{ padding: '20px', background: '#fff' }}>
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