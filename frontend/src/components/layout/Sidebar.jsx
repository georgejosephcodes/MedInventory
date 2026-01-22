import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Pill,
  Package,
  FileText,
  Activity,
  Users,
  X,
  IndianRupee,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { role, loading } = useContext(AuthContext);

  // Prevent flicker during auth restore
  if (loading) return null;

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "PHARMACIST", "STAFF"],
    },
    {
      name: "Medicines",
      href: "/medicines",
      icon: Pill,
      roles: ["ADMIN", "PHARMACIST", "STAFF"],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Package,
      roles: ["ADMIN", "PHARMACIST"],
    },
    {
      name: "Billing",
      href: "/billing",
      icon: IndianRupee,
      roles: ["STAFF"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["ADMIN"],
    },
    {
      name: "Audit Logs",
      href: "/audit",
      icon: Activity,
      roles: ["ADMIN", "PHARMACIST"],
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      roles: ["ADMIN"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 pt-16",
          "bg-background border-r border-border",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Nav items */}
        <div className="h-full overflow-y-auto px-3 pb-6">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
                      "transition-all duration-200",
                      "hover:bg-muted hover:text-foreground",
                      isActive
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-muted-foreground"
                    )
                  }
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      "group-hover:text-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
