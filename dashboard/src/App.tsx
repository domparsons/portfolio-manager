// src/App.tsx

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { AssetList } from '@/app/assets/asset-list'
import { Dashboard } from '@/app/dashboard/dashboard'
import { Portfolio } from '@/app/portfolio/portfolio'
import { Backtesting } from '@/app/backtesting/backtesting'
import { Separator } from '@/components/ui/separator'
import * as React from 'react'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { DynamicBreadcrumb } from '@/components/breadcrumb'
import { MonteCarloSimulation } from '@/app/monte-carlo-simulation/monte-carlo-simulation'
import { Toaster } from '@/components/ui/sonner'
import LoginPage from '@/app/login/page'
import { useAuth0 } from '@auth0/auth0-react'
import { Watchlist } from '@/app/watchlist/watchlist'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

const App = () => {
  const { isAuthenticated } = useAuth0()

  // return <LoginPage />

  if (import.meta.env.MODE !== 'development' && !isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Router>
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
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/asset-list" element={<AssetList />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/backtesting" element={<Backtesting />} />
              <Route
                path="/monte-carlo-simulation"
                element={<MonteCarloSimulation />}
              />
              <Route path="/watchlist" element={<Watchlist />} />
            </Routes>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </Router>
  )
}

export default App
