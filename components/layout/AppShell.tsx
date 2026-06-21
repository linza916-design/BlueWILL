"use client";

import { ReactNode } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { AlertBanner } from './AlertBanner';
import { ScrollToTop } from './ScrollToTop';

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppShell({ children, showSidebar = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AlertBanner />
      <Topbar />
      {showSidebar && <Sidebar />}
      <main className={`pt-16 ${showSidebar ? 'lg:pl-64' : ''}`}>
        {children}
      </main>
      <ScrollToTop />
    </div>
  );
}
