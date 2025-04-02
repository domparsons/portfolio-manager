import * as React from 'react'
import {
  AudioWaveform,
  GalleryVerticalEnd,
  PieChart,
  Bookmark,
  House,
  Heading,
  ChartSpline,
} from 'lucide-react'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const data = {
  teams: [
    {
      name: 'Team',
      logo: ChartSpline,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navMain: [
    {
      title: 'Home',
      url: '#',
      icon: House,
      isActive: true,
      items: [
        {
          title: 'Dashboard',
          url: '/',
        },
        {
          title: 'Watchlist',
          url: '/watchlist',
        },
        {
          title: 'Asset List',
          url: '/asset-list',
        },
      ],
    },
    {
      title: 'Analytics',
      url: '#',
      icon: PieChart,
      isActive: true,
      items: [
        {
          title: 'Portfolio',
          url: 'portfolio',
        },

        {
          title: 'Backtesting',
          url: 'backtesting',
        },
        {
          title: 'Monte Carlo Simulation',
          url: 'monte-carlo-simulation',
        },
      ],
    },
  ],
}

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
  )
}
