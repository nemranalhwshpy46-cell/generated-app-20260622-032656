/* This is a demo sidebar. **COMPULSORY** Edit this file to customize the sidebar OR remove it from appLayout OR don't use appLayout at all */
import React from "react";
import { Home, Layers, Compass, Star, Settings, LifeBuoy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarInput,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "About", path: "/about", icon: Compass },
];

function isActiveRoute(pathname: string, path: string): boolean {
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(`${path}/`);
}

export function AppSidebar(): React.JSX.Element {
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 [[data-collapsible=icon]_&]:justify-center [[data-collapsible=icon]_&]:px-0">
          <div className="size-8 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500" />
          <span className="text-sm font-medium [[data-collapsible=icon]_&]:hidden">Demo Sidebar</span>
        </div>
        <SidebarInput className="[[data-collapsible=icon]_&]:hidden" placeholder="Search" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isActiveRoute(pathname, item.path)} tooltip={item.label}>
                  <Link to={item.path}><item.icon /> <span>{item.label}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActiveRoute(pathname, "/")} tooltip="Starred">
                <Link to="/"><Star /> <span>Starred</span></Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>5</SidebarMenuBadge>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 text-xs text-muted-foreground [[data-collapsible=icon]_&]:hidden">A simple shadcn sidebar</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
