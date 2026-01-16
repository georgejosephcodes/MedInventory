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

  // Prevent flicker / wrong menu during auth restore
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 pt-20",
          "bg-white border-r border-border",
          "transition-transform duration-200",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="h-full overflow-y-auto px-4 pb-6">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                      "hover:bg-muted hover:text-foreground",
                      isActive
                        ? "bg-primary/15 text-primary shadow-sm"
                        : "text-foreground/80"
                    )
                  }
                >
                  <item.icon
                    className="h-5 w-5 transition-colors group-hover:text-foreground"
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
