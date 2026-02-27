import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AudioWaveform, ChartSpline, House, PieChart } from "lucide-react";
import * as React from "react";

const data = {
  teams: [
    {
      name: "Team",
      logo: ChartSpline,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navMain: [
    {
      title: "Portfolio",
      url: "/dashboard",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Transaction History",
          url: "/transaction-history",
        },
      ],
    },
    {
      title: "Assets",
      url: "/assets",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Asset List",
          url: "/assets",
        },
        {
          title: "Watchlist",
          url: "/watchlist",
        },
      ],
    },
    {
      title: "Analysis",
      url: "/backtesting",
      icon: PieChart,
      isActive: true,
      items: [
        {
          title: "Backtesting",
          url: "/backtesting",
        },
        {
          title: "Backtesting History",
          url: "/backtest-history",
        },
        {
          title: "Portfolio Rebalancing",
          url: "/portfolio-rebalancing",
        },
        {
          title: "Monte-Carlo Simulation",
          url: "/monte-carlo-simulation",
        },
        {
          title: "Learn",
          url: "/learn",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
