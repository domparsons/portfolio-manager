import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page(
  selectedMenuKey: string,
  handleMenuClick: (e: React.MouseEvent<HTMLElement>) => void,
) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// import React from "react";
// import { Menu, Tooltip } from "antd";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//
// const SidebarMenu = ({ selectedKey, onMenuClick }) => {
//   const items = [
//     {
//       key: "dashboard",
//       label: (
//         <Tooltip title="View overall portfolio performance" placement="right">
//           Dashboard
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "tachometer-alt"]} />,
//     },
//     {
//       key: "backtesting",
//       label: (
//         <Tooltip title="Run backtesting strategies" placement="right">
//           Backtesting
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "flask"]} />,
//     },
//     {
//       key: "portfolio",
//       label: (
//         <Tooltip title="Manage your portfolio assets" placement="right">
//           Portfolio Management
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "wallet"]} />,
//     },
//     {
//       key: "market-data",
//       label: (
//         <Tooltip title="View live and historical market data" placement="right">
//           Market Data
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "chart-line"]} />,
//     },
//     {
//       key: "risk-analysis",
//       label: (
//         <Tooltip title="Analyze portfolio risk" placement="right">
//           Risk Analysis
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} />,
//     },
//     {
//       key: "reports",
//       label: (
//         <Tooltip title="Generate and view detailed reports" placement="right">
//           Reports
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "file-alt"]} />,
//     },
//     {
//       key: "settings",
//       label: (
//         <Tooltip title="Configure app settings" placement="right">
//           Settings
//         </Tooltip>
//       ),
//       icon: <FontAwesomeIcon icon={["fas", "cog"]} />,
//     },
//   ];
//
//   return (
//     <div>
//       <div className="p-5">
//         <div className="sidebar-title font-bold text-lg">
//           Portfolio Dashboard
//         </div>
//       </div>
//       <Menu selectedKeys={[selectedKey]} onClick={onMenuClick} items={items} />
//     </div>
//   );
// };
//
// export default SidebarMenu;
