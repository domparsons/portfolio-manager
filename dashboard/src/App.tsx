import { AssetList } from "@/app/assets/asset-list";
import AssetPageWrapper from "@/app/assets/asset-page-wrapper";
import { Backtesting } from "@/app/backtesting/backtesting";
import { Dashboard } from "@/app/dashboard/dashboard";
import LoginPage from "@/app/login/page";
import { Watchlist } from "@/app/watchlist/watchlist";
import { useAuthInit } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { TransactionHistory } from "@/app/transactions/transaction-history";
import { PortfolioProvider } from "@/context/portfolio-metrics";
import NoAccess from "@/app/login/no-access";
import LoadingPage from "@/app/login/loading-page";
import ErrorPage from "@/app/login/error-page";

const App = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { status } = useAuthInit();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (status === "loading") return <LoadingPage />;
  if (status === "denied") return <NoAccess />;
  if (status === "error") return <ErrorPage />;

  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumb />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <PortfolioProvider>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/assets" element={<AssetList />} />
                  <Route
                    path="/assets/:ticker"
                    element={<AssetPageWrapper />}
                  />
                  {/*<Route path="/portfolio" element={<Portfolio />} />*/}
                  <Route
                    path="/transaction-history"
                    element={<TransactionHistory />}
                  />
                  <Route path="/backtesting" element={<Backtesting />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                </Routes>
              </PortfolioProvider>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster visibleToasts={10} duration={10000} />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </Router>
  );
};

export default App;
