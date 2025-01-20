import * as React from "react";
import {
  AudioWaveform,
  GalleryVerticalEnd,
  PieChart,
  Bookmark,
  House,
} from "lucide-react";

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

const data = {
  user: {
    name: "Dom P",
    email: "example@icloud.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Team",
      logo: GalleryVerticalEnd,
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
      title: "Home",
      url: "#",
      icon: House,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/",
        },
        {
          title: "Asset List",
          url: "/asset-list",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: PieChart,
      isActive: true,
      items: [
        {
          title: "Portfolio",
          url: "portfolio",
        },

        {
          title: "Backtesting",
          url: "backtesting",
        },
        {
          title: "Monte Carlo Simulation",
          url: "monte-carlo-simulation",
        },
      ],
    },
    {
      title: "Watchlist",
      url: "#",
      icon: Bookmark,
      isActive: true,
      items: [
        {
          title: "Tesla",
          url: "watchlist/tesla",
        },
        {
          title: "Apple",
          url: "watchlist/apple",
        },
        {
          title: "NVIDIA",
          url: "watchlist/nvidia",
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
