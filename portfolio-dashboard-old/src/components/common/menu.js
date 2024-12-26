import React from 'react';
import { Menu, Input, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../index.css';  // Move up two levels to reach the src folder
const { Search } = Input;

const items = [
  {
    key: 'watchlist',
    label: 'Watchlist',
    icon: <FontAwesomeIcon icon={['fas', 'chart-line']} />,
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: <FontAwesomeIcon icon={['fas', 'chart-line']} />,
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
    <div style={styles.sidebarContainer}>
      <div style={styles.innerSidebarContainer}>
        <div style={styles.logoContainer}>
          <h2 style={styles.logoTitle}>Stock Watchlist</h2>
        </div>

        <Menu
          onClick={onClick}
          style={styles.menu}
          defaultSelectedKeys={['watchlist']}
          mode="inline"
          items={items}
        />
      </div>
    </div>
  );
};

const styles = {
  sidebarContainer: {
    width: 256,
    height: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
  },
  innerSidebarContainer: {
    height: '100vh',
    // add an inner shaddow for 3d effect
    boxShadow: '0 0 1px 2px rgba(0,0,0,0.1)',
    backgroundColor: '#f7f7f7',
    borderRadius: '16px',
    padding: '20px',
  },
  logoContainer: {
    height: '32px',
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '12px',
    marginLeft: '8px',
  },
  logoTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  searchContainer: {
    padding: '0 16px',
    marginBottom: '16px',
  },
  menu: {
    flex: 1,
  },

};

export default SidebarMenu;