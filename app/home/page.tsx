"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { AppShell } from '../../components/layout';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [user, router]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bw-card p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center">
            <span className="text-4xl">🦅</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            Welcome to BlueWILL, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-white/60">
            Your feed is being built. Check back soon for amazing content!
          </p>
        </div>
      </div>
    </AppShell>
  );
}
