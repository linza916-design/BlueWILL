"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, Bell, Search, User, Menu, X, Moon, Sun, MessageCircle, ShoppingCart, Bot
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu';

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/marketplace', icon: ShoppingCart, label: 'Marketplace' },
  { href: '/willy', icon: Bot, label: 'WILLY AI' },
];

export function Topbar() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme, toggleSidebar, sidebarOpen } = useBlueWill();
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="topbar-glass fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Logo & Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center">
            <span className="text-xl">🦅</span>
          </div>
          <span className="hidden sm:block font-display font-bold text-xl text-white">
            Blue<span className="text-cyan-400">WILL</span>
          </span>
        </Link>
      </div>

      {/* Center: Desktop Nav */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              pathname === item.href
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right: Search, Theme, Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm placeholder:text-white/50 w-40"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-canary-400" />
          ) : (
            <Moon className="w-5 h-5 text-navy-600" />
          )}
        </button>

        {/* Profile / Auth */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                <Avatar className="w-9 h-9 border-2 border-cyan-500">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${profile?.username}`} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              {profile?.role === 'root_admin' || profile?.role === 'project_admin' ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-500">
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/?auth=login">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Log In
              </Button>
            </Link>
            <Link href="/?auth=signup">
              <Button className="btn-3d-sunset text-sm px-4 py-2">
                Create Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
