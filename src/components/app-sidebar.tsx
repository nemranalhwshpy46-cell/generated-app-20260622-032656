import React from "react";
import { 
  Home, 
  Cpu, 
  Terminal, 
  LayoutGrid, 
  Code, 
  Globe, 
  Smartphone,
  CheckCircle2,
  CpuIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNimranStore, translations } from "@/store/nimranStore";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

function isActiveRoute(pathname: string, path: string): boolean {
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(`${path}/`);
}

export function AppSidebar(): React.JSX.Element {
  const { pathname } = useLocation();
  
  // Zustand selectors following absolute rules (primitive selectors only)
  const language = useNimranStore((state) => state.language);
  const setLanguage = useNimranStore((state) => state.setLanguage);
  
  const t = translations[language];

  const handleLanguageToggle = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const navItems = [
    { label: t.dashboard, path: "/", icon: Home },
    { label: t.ideSuite, path: "/ide", icon: Code },
    { label: t.visualDesigner, path: "/designer", icon: LayoutGrid },
    { label: t.systemsTuning, path: "/tuning", icon: Cpu },
    { label: t.terminalAi, path: "/terminal", icon: Terminal },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-cyan-950/40 bg-zinc-950 text-zinc-100">
      <SidebarHeader className="border-b border-cyan-950/30 p-4">
        <div className="flex items-center gap-3 [[data-collapsible=icon]_&]:justify-center [[data-collapsible=icon]_&]:px-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-950/50 border border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-cyan-400">
            <Smartphone className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col [[data-collapsible=icon]_&]:hidden">
            <span className="text-sm font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              {t.nimranBranding}
            </span>
            <span className="text-[10px] text-cyan-500/80 font-mono tracking-tighter">
              MOBILE COMPILER v3.0
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-cyan-500/60 uppercase px-2 mb-2 [[data-collapsible=icon]_&]:hidden">
            {language === "ar" ? "أدوات البرمجة" : "DEVELOPMENT SUITE"}
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActiveRoute(pathname, item.path)} 
                  tooltip={item.label}
                  className="hover:bg-cyan-950/30 hover:text-cyan-400 active:bg-cyan-950/50 data-[active=true]:bg-cyan-950/50 data-[active=true]:text-cyan-400 data-[active=true]:border-l-2 data-[active=true]:border-cyan-400 transition-all duration-200"
                >
                  <Link to={item.path} className="flex items-center gap-3 py-2.5">
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="bg-cyan-950/30 my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-cyan-500/60 uppercase px-2 mb-2 [[data-collapsible=icon]_&]:hidden">
            {language === "ar" ? "حالة بيئة نمران" : "NIMRAN ENVIRONMENT"}
          </SidebarGroupLabel>
          <SidebarMenu className="[[data-collapsible=icon]_&]:hidden">
            <div className="px-3 py-2 space-y-2 rounded-lg bg-cyan-950/15 border border-cyan-950/40 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">{language === "ar" ? "نظام الترجمة سحابي:" : "Compiler Engine:"}</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">{language === "ar" ? "الذاكرة السحابية:" : "Cloud Sandbox:"}</span>
                <span className="text-cyan-400 font-mono">Convex DB v1.0</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">{language === "ar" ? "المطور الرئيسي:" : "Lead Architect:"}</span>
                <span className="text-indigo-300 font-bold">المبرمج نمران</span>
              </div>
            </div>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-cyan-950/30 p-4">
        {/* Localization Toggle */}
        <button
          onClick={handleLanguageToggle}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/40 px-3 py-2 text-xs text-cyan-400 transition-all duration-200 [[data-collapsible=icon]_&]:justify-center [[data-collapsible=icon]_&]:p-2"
          title={language === "ar" ? "Switch to English" : "تغيير إلى العربية"}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="font-semibold tracking-wider [[data-collapsible=icon]_&]:hidden">
              {language === "ar" ? "English (EN)" : "العربية (AR)"}
            </span>
          </div>
          <span className="text-[10px] bg-cyan-950/80 px-1.5 py-0.5 rounded text-cyan-300 border border-cyan-500/10 [[data-collapsible=icon]_&]:hidden">
            {language === "ar" ? "EN" : "AR"}
          </span>
        </button>
        <div className="text-[10px] text-center text-zinc-500 mt-2 font-mono [[data-collapsible=icon]_&]:hidden">
          {t.creatorCredits}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
