"use client";
/// <reference types="react" />

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, Shield, ShoppingBag, Megaphone, CheckCircle, AlertTriangle,
  TrendingUp, Clock, UserCheck, UserX, Trash2, Eye, MoreHorizontal, Loader2, Zap, Bot
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../../components/ui/select';

const mockStats = {
  totalUsers: 12543,
  activeUsers: 3421,
  pendingVerifications: 12,
  reportedPosts: 8,
  activeAds: 45,
  dailyRevenue: 28900,
};

const mockUsers = [
  { id: 'u1', full_name: 'John Admin', username: 'johnadmin', email: 'john@bluewill.com', role: 'root_admin', subscription_tier: 'business', created_at: '2024-01-01', status: 'active' },
  { id: 'u2', full_name: 'Sarah Chen', username: 'sarahcooks', email: 'sarah@example.com', role: 'regular_user', subscription_tier: 'creator_pro', created_at: '2024-02-15', status: 'active' },
  { id: 'u3', full_name: 'Spam User', username: 'spamuser', email: 'spam@spam.com', role: 'regular_user', subscription_tier: 'explorer', created_at: '2024-06-10', status: 'suspended' },
];

const mockVerifications = [
  { id: 'v1', user: { name: 'Mike Johnson', username: 'mikej' }, status: 'pending', submitted_at: '2024-06-14' },
  { id: 'v2', user: { name: 'Anna Smith', username: 'annasm' }, status: 'pending', submitted_at: '2024-06-13' },
];

const mockReports = [
  { id: 'r1', post_id: 'p1', author: 'Spam User', reporter: 'Sarah Chen', reason: 'Spam', status: 'pending' },
  { id: 'r2', post_id: 'p2', author: 'Bad User', reporter: 'John Dev', reason: 'Harassment', status: 'pending' },
];

const navItems = [
  { id: 'dashboard', label: 'Traffic Hub', icon: TrendingUp },
  { id: 'reports', label: 'Reported Feed', icon: AlertTriangle },
  { id: 'verification', label: 'Verification', icon: UserCheck },
  { id: 'ads', label: 'Ads Control', icon: Megaphone },
];

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    // Check admin role
    if (profile && profile.role !== 'root_admin' && profile.role !== 'project_admin') {
      addAlert({ type: 'error', title: 'Access Denied', message: 'Admin privileges required' });
      router.push('/home');
      return;
    }

    setLoading(false);
  }, [user, profile, router]);

  const handleApproveVerification = (id: string) => {
    addAlert({ type: 'success', title: 'Verification Approved', message: '' });
  };

  const handleDenyVerification = (id: string) => {
    addAlert({ type: 'info', title: 'Verification Denied', message: 'Documents deleted for privacy' });
  };

  const handleSuspendUser = (userId: string) => {
    addAlert({ type: 'info', title: 'User Suspended', message: '' });
  };

  const handleDeletePost = (postId: string) => {
    addAlert({ type: 'info', title: 'Post Deleted', message: '' });
  };

  const handleDismissReport = (reportId: string) => {
    addAlert({ type: 'success', title: 'Report Dismissed', message: 'Post remains live' });
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const isAdmin = profile.role === 'root_admin' || profile.role === 'project_admin';
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Top Bar */}
      <div className="topbar-glass fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center">
            <span className="text-xl">🦅</span>
          </div>
          <span className="font-display font-bold text-xl text-white">
            Blue<span className="text-cyan-400">WILL</span>
          </span>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full ml-2">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Active
          </div>
          <Link href="/home" className="text-cyan-400 hover:text-cyan-300 text-sm">
            Back to App
          </Link>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-navy-900/50 border-r border-white/10 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                  activeSection === item.id
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-navy-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white">
                    {profile.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
                  <p className="text-xs text-white/50 capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-white">Traffic Hub</h1>

              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: mockStats.totalUsers.toLocaleString(), icon: Users, color: 'cyan' },
                  { label: 'Active Now', value: mockStats.activeUsers.toLocaleString(), icon: TrendingUp, color: 'emerald' },
                  { label: 'Pending Verifications', value: mockStats.pendingVerifications, icon: UserCheck, color: 'canary' },
                  { label: 'Daily Revenue', value: `$${mockStats.dailyRevenue.toLocaleString()}`, icon: Zap, color: 'sunset' },
                ].map((stat) => (
                  <Card key={stat.label} className="bg-navy-800/50 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/50 text-sm">{stat.label}</p>
                          <p className={cn(
                            "text-2xl font-bold",
                            stat.color === 'cyan' && "text-cyan-400",
                            stat.color === 'emerald' && "text-emerald-400",
                            stat.color === 'canary' && "text-canary-400",
                            stat.color === 'sunset' && "text-sunset-400",
                          )}>{stat.value}</p>
                        </div>
                        <stat.icon className={cn(
                          "w-8 h-8",
                          stat.color === 'cyan' && "text-cyan-400/30",
                          stat.color === 'emerald' && "text-emerald-400/30",
                          stat.color === 'canary' && "text-canary-400/30",
                          stat.color === 'sunset' && "text-sunset-400/30",
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Users Table */}
              <Card className="bg-navy-800/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="p-3 text-white/70 font-medium">User</th>
                          <th className="p-3 text-white/70 font-medium">Role</th>
                          <th className="p-3 text-white/70 font-medium">Subscription</th>
                          <th className="p-3 text-white/70 font-medium">Status</th>
                          <th className="p-3 text-white/70 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockUsers.map((u) => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{u.full_name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-white font-medium">{u.full_name}</p>
                                  <p className="text-white/50 text-sm">@{u.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                u.role === 'root_admin' && "bg-emerald-500/20 text-emerald-400",
                                u.role === 'project_admin' && "bg-cyan-500/20 text-cyan-400",
                                u.role === 'regular_user' && "bg-white/10 text-white/70"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-white/70 capitalize">{u.subscription_tier}</td>
                            <td className="p-3">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                u.status === 'active' && "bg-emerald-500/20 text-emerald-400",
                                u.status === 'suspended' && "bg-red-500/20 text-red-400"
                              )}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-white/50 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {u.role !== 'root_admin' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => handleSuspendUser(u.id)}
                                  >
                                    <UserX className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-white">Reported Content</h1>

              {mockReports.map((report) => (
                <Card key={report.id} className="bg-navy-800/50 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">{report.reason}</Badge>
                          <span className="text-xs text-white/50">Reported by {report.reporter}</span>
                        </div>
                        <p className="text-white">@{report.author} - Post content would be shown here...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-emerald-400" onClick={() => handleDismissReport(report.id)}>
                          Dismiss
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePost(report.post_id)}>
                          Delete Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Verification */}
          {activeSection === 'verification' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-white">Verification Queue</h1>

              {mockVerifications.map((v) => (
                <Card key={v.id} className="bg-navy-800/50 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-navy-700 rounded-xl flex items-center justify-center text-white/30">
                          ID
                        </div>
                        <div>
                          <p className="text-white font-medium">{v.user.name}</p>
                          <p className="text-white/50 text-sm">@{v.user.username}</p>
                          <p className="text-xs text-white/30 mt-1">Submitted: {v.submitted_at}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="btn-3d-emerald" onClick={() => handleApproveVerification(v.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="destructive" onClick={() => handleDenyVerification(v.id)}>
                          <UserX className="w-4 h-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Ads */}
          {activeSection === 'ads' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-display font-bold text-white">Ads Control</h1>

              <Card className="bg-navy-800/50 border-white/10">
                <CardContent className="p-4 text-center py-12">
                  <Megaphone className="w-12 h-12 mx-auto text-white/30 mb-4" />
                  <p className="text-white/50">No ads pending review</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
