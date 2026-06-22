/*
Wraps children in a sidebar layout. Don't use this if you don't need a sidebar.
Supports both direct children and React Router Outlet (layout route) usage.
*/
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

type AppLayoutProps = {
  children?: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};

export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): React.JSX.Element {
  const content = children ?? <Outlet />;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <div className="absolute left-2 top-2 z-20">
          <SidebarTrigger
            className="h-9 w-9 rounded-md border border-border bg-background/90 shadow-sm backdrop-blur hover:bg-accent"
            title="Toggle sidebar"
          />
        </div>
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>{content}</div>
        ) : (
          content
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
