import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Hexagon, Menu, X, LogOut, User, Wallet, LayoutGrid, Sun, Moon } from "lucide-react";
import NotificationBell from "./components/notifications/NotificationBell";
import WalletConnectButton from "./components/wallet/WalletConnectButton";
import Web3Provider from "./components/wallet/Web3Provider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") !== "light";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (authed) {
        const u = await base44.auth.me();
        setUser(u);
      }
    };
    checkAuth();
  }, []);

  const navItems = [
    { name: "Home", page: "Home", icon: Hexagon },
    { name: "Mint", page: "Mint", icon: Wallet },
    { name: "Gallery", page: "Gallery", icon: LayoutGrid },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Admin", page: "Admin", icon: User });
  }

  return (
    <Web3Provider>
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] relative overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-shadow">
                <Hexagon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">GenesisNFT</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPageName === item.page
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsDark((d) => !d)}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <WalletConnectButton />
                  <NotificationBell userEmail={user?.email} />
                  <div className="text-sm text-white/50">
                    {user?.full_name || user?.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => base44.auth.logout()}
                    className="text-white/40 hover:text-white hover:bg-white/[0.06]"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 text-sm"
                >
                  Connect
                </Button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/[0.06] overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentPageName === item.page
                        ? "bg-white/[0.08] text-white"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
                <div className="pt-3 border-t border-white/[0.06] space-y-1">
                  <button
                    onClick={() => setIsDark((d) => !d)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/50 hover:text-white w-full"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </button>
                  {isAuthenticated ? (
                    <button
                      onClick={() => base44.auth.logout()}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/50 hover:text-white w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  ) : (
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0"
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
    </Web3Provider>
  );
}