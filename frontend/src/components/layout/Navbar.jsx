import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Menu, Pill, LogOut, User } from "lucide-react";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-white">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                MedInventory
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold text-foreground">
                  {user?.name}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {user?.role}
                </span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
