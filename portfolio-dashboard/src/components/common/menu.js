import React from 'react';
import { Menu } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const items = [
  {
    key: 'watchlist',
    label: 'Watchlist',
    icon: <MailOutlined />,
  },
];

const SidebarMenu = () => {
  const navigate = useNavigate();

  const onClick = (e) => {
    if (e.key === 'watchlist') {
      navigate('/watchlist');
    } else {
      console.log('Clicked item:', e);
    }
  };

  return (
    <div style={{ width: 256, height: '100vh', background: '#001529' }}>
      <div style={styles.logoContainer}>
        {/* Placeholder Text for Logo */}
        <h2 style={styles.logoTitle}>Stock Watchlist</h2>
      </div>

      <Menu
        onClick={onClick}
        style={{ height: 'calc(100% - 64px)' }}
        defaultSelectedKeys={['watchlist']}
        mode="inline"
        items={items}
        theme="dark"
      />
    </div>
  );
};

const styles = {
  logoContainer: {
    height: '64px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#001529',
    marginBottom: '16px',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
  },
};

export default SidebarMenu;