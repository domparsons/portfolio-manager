import React, { useState } from 'react'
import './App.css'
import { Layout, Menu } from 'antd';
import Sider from 'antd/es/layout/Sider.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  const [count, setCount] = useState(0);
  const items = [
    {
      key: 'watchlist',
      label: 'Watchlist',
      // icon: <FontAwesomeIcon icon={['fas', 'chart-line']} />,
    },
    {
      key: 'projects',
      label: 'Projects',
      // icon: <FontAwesomeIcon icon={['fas', 'chart-line']} />,
    },
  ];
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={256} style={{ background: '#001529' }}>
                <Menu
          defaultSelectedKeys={['watchlist']}
          mode="inline"
          items={items}
        />
      </Sider>
      HI

      {/*<Layout>*/}
      {/*  <Content style={{ padding: '20px', background: '#fff' }}>*/}
      {/*    <Routes>*/}
      {/*      <Route path="/watchlist" element={<Watchlist />} />*/}
      {/*    </Routes>*/}
      {/*  </Content>*/}
      {/*</Layout>*/}
    </Layout>
  );
}

export default App
