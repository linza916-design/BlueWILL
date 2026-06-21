"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface AlertData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface BlueWillContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isDayTime: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  alerts: AlertData[];
  addAlert: (alert: Omit<AlertData, 'id'>) => void;
  removeAlert: (id: string) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const BlueWillContext = createContext<BlueWillContextType | undefined>(undefined);

export function BlueWillProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDayTime, setIsDayTime] = useState(true);
  const alertIdRef = useRef(0);

  // Day/Night time check (6 AM - 6 PM = day)
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsDayTime(hour >= 6 && hour < 18);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Theme handling
  useEffect(() => {
    const stored = localStorage.getItem('bw-theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bw-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const addAlert = useCallback((alert: Omit<AlertData, 'id'>) => {
    const id = `alert-${++alertIdRef.current}`;
    const newAlert: AlertData = { ...alert, id };
    setAlerts((prev) => [...prev, newAlert]);

    const duration = alert.duration ?? (alert.type === 'error' ? 0 : 5000);
    if (duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, duration);
    }
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BlueWillContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDayTime,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        alerts,
        addAlert,
        removeAlert,
        activeCategory,
        setActiveCategory,
      }}
    >
      {children}
    </BlueWillContext.Provider>
  );
}

export function useBlueWill() {
  const context = useContext(BlueWillContext);
  if (context === undefined) {
    throw new Error('useBlueWill must be used within a BlueWillProvider');
  }
  return context;
}
