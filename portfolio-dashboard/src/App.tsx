import React, { useState } from "react";
import "./App.css";
import Page from "./app/dashboard/page";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const [selectedMenuKey, setSelectedMenuKey] = useState("dashboard");

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    setSelectedMenuKey(e.currentTarget.getAttribute("data-key") || "dashboard");
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Page selectedKey={selectedMenuKey} onMenuClick={handleMenuClick} />;
    </ThemeProvider>
  );
}

export default App;
