import React, { useState } from "react";
import "./App.css";
import { Layout } from "antd";
import SidebarMenu from "./components/common/SidebarMenu";
import Dashboard from "./components/features/dashboard.jsx";

const { Sider, Content } = Layout;

function App() {
  const [selectedMenuKey, setSelectedMenuKey] = useState("dashboard");

  const handleMenuClick = (e) => {
    setSelectedMenuKey(e.key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={256} style={{ background: "#FFFFFF" }}>
        <SidebarMenu
          selectedKey={selectedMenuKey}
          onMenuClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: "20px", background: "#fff" }}>
          {selectedMenuKey === "dashboard" && <Dashboard />}
          {selectedMenuKey === "backtesting" && (
            <div>Backtesting Component</div>
          )}
          {selectedMenuKey === "portfolio" && (
            <div>Portfolio Management Component</div>
          )}
          {selectedMenuKey === "market-data" && (
            <div>Market Data Component</div>
          )}
          {selectedMenuKey === "risk-analysis" && (
            <div>Risk Analysis Component</div>
          )}
          {selectedMenuKey === "reports" && <div>Reports Component</div>}
          {selectedMenuKey === "settings" && <div>Settings Component</div>}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
