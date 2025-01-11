import React from 'react';
import { Menu, Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SidebarMenu = ({ selectedKey, onMenuClick }) => {
  const items = [
    {
      key: 'dashboard',
      label: (
        <Tooltip title="View overall portfolio performance" placement="right">
          Dashboard
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'tachometer-alt']} />,
    },
    {
      key: 'backtesting',
      label: (
        <Tooltip title="Run backtesting strategies" placement="right">
          Backtesting
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'flask']} />,
    },
    {
      key: 'portfolio',
      label: (
        <Tooltip title="Manage your portfolio assets" placement="right">
          Portfolio Management
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'wallet']} />,
    },
    {
      key: 'market-data',
      label: (
        <Tooltip title="View live and historical market data" placement="right">
          Market Data
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'chart-line']} />,
    },
    {
      key: 'risk-analysis',
      label: (
        <Tooltip title="Analyze portfolio risk" placement="right">
          Risk Analysis
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'exclamation-triangle']} />,
    },
    {
      key: 'reports',
      label: (
        <Tooltip title="Generate and view detailed reports" placement="right">
          Reports
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'file-alt']} />,
    },
    {
      key: 'settings',
      label: (
        <Tooltip title="Configure app settings" placement="right">
          Settings
        </Tooltip>
      ),
      icon: <FontAwesomeIcon icon={['fas', 'cog']} />,
    },
  ];

  return (
    <div>
      <div className="p-5">
        <div className="sidebar-title font-bold text-lg">Portfolio Dashboard</div>
      </div>
      <Menu
        selectedKeys={[selectedKey]}
        // mode="inline"
        onClick={onMenuClick}
        items={items}
      />
    </div>
  );
};

export default SidebarMenu;