import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Home,
  Mail,
  FileText,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

/* ===================== MENU ===================== */

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["SuperAdmin", "admin", "Interviewer", "Recruiter", "Testing"],
  },
  {
    title: "Easy Flow",
    url: "/mail-merge",
    icon: Mail,
    roles: ["Testing"],
    license: "Mail Merge for Everyone",
  },
  {
    title: "Pro Sign Email",
    url: "/mail-signature",
    icon: FileText,
    roles: ["Testing"],
    license: "ProSign Email",
  },
  {
    title: "Plans",
    url: "/plans",
    icon: FileText,
    roles: ["Testing"],
  },
  {
    title: "UnSubscription",
    url: "/unsubscripion",
    icon: FileText,
    roles: ["Testing"],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["admin", "Testing", "SuperAdmin"],
  },
];

/* ===================== SIDEBAR ===================== */

function AppSidebar() {
  const location = useLocation();
  const { getUserDetails, getUserLicenses } = useAuth();

  const userRole = getUserDetails()?.roles?.toLowerCase() || "";
  const userLicenses = getUserLicenses();

const filteredMenuItems = menuItems.filter((item) => {

  const roleAllowed =
    !item.roles ||
    item.roles.some((role) => role.toLowerCase() === userRole);

  const licenseAllowed =
    !item.license ||
    userLicenses.includes(item.license.toLowerCase());
    console.log("User Licenses:", userLicenses);
console.log("Menu License:", item.license);

  return roleAllowed && licenseAllowed;
});
  return (
    <Sidebar className="border-r bg-slate-50/50 backdrop-blur-sm">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary-foreground" />
          </div>

          <span className="text-xl font-bold text-sidebar-foreground">
            Ams Tools
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "w-full justify-start hover:bg-blue-50 hover:text-blue-700",
                  location.pathname === item.url &&
                    "bg-blue-100 text-blue-700 font-medium"
                )}
              >
                <Link
                  to={item.url}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

/* ===================== LAYOUT ===================== */

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout, getUserDetails } = useAuth();
  const navigate = useNavigate();

  const userDetails = getUserDetails();
  const name = userDetails?.name || "Guest";

  const encodedName = encodeURIComponent(name);

  const [user] = useState({
    name,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodedName}&background=4f46e5&color=fff`,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/settings");
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
        <AppSidebar />

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                  >
                    <img
                      src={user.avatarUrl}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}