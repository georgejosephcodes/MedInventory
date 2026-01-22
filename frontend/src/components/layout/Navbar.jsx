import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Button } from "../ui/button";
import {
  Menu,
  Pill,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);
  const [dark, setDark] = useState(false);

  // Sync dark mode with html class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background transition-colors duration-300">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-300 dark:bg-blue-400 transition-colors">
                <Pill className="h-5 w-5 text-blue-700 dark:text-blue-900" />
              </div>

              <span className="text-lg font-semibold tracking-tight">
                MedInventory
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-colors"
            >
              {dark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-sm font-semibold">
                  {user?.name}
                </span>
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {user?.role}
                </span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-foreground" />
              </div>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>

          </div>
        </div>
      </div>
    </nav>
  );
}
