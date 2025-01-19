import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Heading1,
  Heading3Icon,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Bookmark,
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
import { Header } from "antd/es/layout/layout";

// This is sample data.
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
      title: "General",
      url: "#",
      icon: Frame,
      isActive: true,
      items: [
        {
          title: "Stocks List",
          url: "#",
        },
      ],
    },
    {
      title: "Watchlist",
      url: "#",
      icon: Bookmark,
      isActive: false,
      items: [
        {
          title: "Tesla",
          url: "#",
        },
        {
          title: "Apple",
          url: "#",
        },
        {
          title: "NVIDIA",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: PieChart,
      isActive: false,
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Backtesting",
          url: "#",
        },
        {
          title: "Portfolio",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
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
