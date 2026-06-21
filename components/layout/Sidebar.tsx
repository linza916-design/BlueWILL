"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, Bell, MessageCircle, ShoppingCart, Bot, Settings, LogOut,
  Newspaper, Heart, Music, FlaskConical, Plane, Laugh, UtensilsCrossed, Leaf, Tent, Users, Zap, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';

const categories = [
  { tag: 'entertainment', icon: Zap, label: 'Entertainment' },
  { tag: 'relationships', icon: Heart, label: 'Relationships' },
  { tag: 'music', icon: Music, label: 'Music' },
  { tag: 'science', icon: FlaskConical, label: 'Science' },
  { tag: 'travelling', icon: Plane, label: 'Travelling' },
  { tag: 'memes', icon: Laugh, label: 'Memes' },
  { tag: 'foods', icon: UtensilsCrossed, label: 'Foods' },
  { tag: 'nature', icon: Leaf, label: 'Nature' },
  { tag: 'outdoors', icon: Tent, label: 'Outdoors' },
];

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/clubs', icon: Users, label: 'Clubs' },
  { href: '/marketplace', icon: ShoppingCart, label: 'Marketplace' },
  { href: '/willy', icon: Bot, label: 'WILLY AI' },
];

export function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const { sidebarOpen, setSidebarOpen, activeCategory, setActiveCategory, theme, toggleTheme } = useBlueWill();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const isAdmin = profile?.role === 'root_admin' || profile?.role === 'project_admin';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
        <span className="font-display font-bold text-lg text-white">Menu</span>
        <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "nav-item",
                (pathname === item.href || (item.href === '/home' && pathname === '/')) && "active"
              )}
            >
              <item.icon className="w-5 h-5 nav-icon" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Categories */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.tag}
                onClick={() => {
                  setActiveCategory(activeCategory === cat.tag ? null : cat.tag);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "nav-item w-full",
                  activeCategory === cat.tag && "active"
                )}
              >
                <cat.icon className="w-5 h-5 nav-icon" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="nav-item w-full justify-center gap-2"
        >
          {theme === 'dark' ? (
            <>
              <span className="text-lg">☀️</span>
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <span className="text-lg">🌙</span>
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {user && (
          <>
            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className="nav-item w-full"
            >
              <Settings className="w-5 h-5 nav-icon" />
              <span>Settings</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className="nav-item w-full text-cyan-400"
              >
                <Zap className="w-5 h-5 nav-icon" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <button onClick={signOut} className="nav-item w-full text-red-400 hover:text-red-300">
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>

            <Link
              href={`/profile/${profile?.username}`}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-navy-600/10 border border-cyan-500/20"
            >
              <Avatar className="w-10 h-10 border-2 border-cyan-500">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name}</p>
                <p className="text-xs text-white/50">@{profile?.username}</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-navy-900/50 border-r border-white/10 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-navy-950 z-50 lg:hidden overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-2 p-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center">
                  <span className="text-xl">🦅</span>
                </div>
                <span className="font-display font-bold text-xl text-white">
                  Blue<span className="text-cyan-400">WILL</span>
                </span>
              </div>
              {sidebarContent}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
