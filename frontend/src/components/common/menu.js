import React from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
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
    <Menu
      onClick={onClick}
      style={{ width: 256, height: '100vh' }}
      defaultSelectedKeys={['watchlist']}
      mode="inline"
      items={items}
    />
  );
};

export default SidebarMenu;