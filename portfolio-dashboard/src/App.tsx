import React, { useState } from "react";
import "./App.css";
import Page from "./app/dashboard/page";

function App() {
  const [selectedMenuKey, setSelectedMenuKey] = useState("dashboard");

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    setSelectedMenuKey(e.currentTarget.getAttribute("data-key") || "dashboard");
  };

  return <Page selectedKey={selectedMenuKey} onMenuClick={handleMenuClick} />;
}

export default App;
