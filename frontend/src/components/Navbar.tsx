"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/catalog?category=Return Gifts", label: "Return Gifts" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🍫</span>
            <span className="font-bold text-lg text-primary-dark group-hover:text-accent transition-colors">
              Madeline_chocolate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-primary-dark transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent-light/25 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-accent" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>

            {user && (
              <Link
                href="/dashboard/wishlist"
                className="p-2 rounded-full hover:bg-accent-light/30 transition-colors hidden sm:block"
              >
                <Heart className="w-5 h-5 text-primary" />
              </Link>
            )}

            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-accent-light/30 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary-dark text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href={user.isAdmin ? "/admin" : "/dashboard"}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-accent transition-colors"
                >
                  {user.isAdmin ? (
                    <LayoutDashboard className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {user.isAdmin ? "Admin" : "Dashboard"}
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm text-muted hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <User className="w-4 h-4" />
                Login
              </Link>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 surface-card",
          mobileOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="px-4 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-muted hover:text-primary-dark transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href={user.isAdmin ? "/admin" : "/dashboard"}
                className="block py-2 text-muted"
                onClick={() => setMobileOpen(false)}
              >
                {user.isAdmin ? "Admin Panel" : "My Dashboard"}
              </Link>
              <button onClick={logout} className="block py-2 text-muted">
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block py-2 text-primary font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
