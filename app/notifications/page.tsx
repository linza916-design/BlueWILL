"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, UserPlus, Heart, Zap, MessageCircle, Users, ShoppingBag, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { AppShell } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';

const mockNotifications = [
  { id: '1', type: 'connection', title: 'Connection Request', message: 'Sarah Chen wants to connect', user: { name: 'Sarah Chen', username: 'sarahcooks', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }, time: '2 min ago', unread: true },
  { id: '2', type: 'like', title: 'New Like', message: 'Your post received 100 likes!', user: { name: 'John Dev', username: 'johndev', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }, time: '15 min ago', unread: true },
  { id: '3', type: 'thunder', title: 'Post Boosted', message: 'Your post is trending!', time: '1 hour ago', unread: false },
  { id: '4', type: 'club', title: 'Club Activity', message: '3 new posts in Tech Traders', time: '3 hours ago', unread: false },
  { id: '5', type: 'system', title: 'Welcome to BlueWILL!', message: 'Complete your profile to get started', time: '1 day ago', unread: false },
  { id: '6', type: 'marketplace', title: 'Item Sold!', message: 'Your iPhone listing was purchased', time: '2 days ago', unread: false },
];

const iconMap: Record<string, any> = {
  connection: UserPlus,
  like: Heart,
  thunder: Zap,
  message: MessageCircle,
  club: Users,
  system: Bell,
  marketplace: ShoppingBag,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleAcceptConnection = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'connections') return n.type === 'connection';
    if (activeTab === 'activity') return ['like', 'thunder', 'message'].includes(n.type);
    if (activeTab === 'system') return ['club', 'system', 'marketplace'].includes(n.type);
    return true;
  });

  if (!user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bw-card p-4">
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            Notifications
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 bg-navy-800/50 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">All</TabsTrigger>
            <TabsTrigger value="connections" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">Connections</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">Activity</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">System</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = iconMap[notification.type] || Bell;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "bw-card p-4 flex items-start gap-3",
                    notification.unread && "border-l-4 border-l-cyan-500"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    notification.type === 'connection' && "bg-emerald-500/20 text-emerald-400",
                    notification.type === 'like' && "bg-red-500/20 text-red-400",
                    notification.type === 'thunder' && "bg-cyan-500/20 text-cyan-400",
                    notification.type === 'system' && "bg-navy-600 text-white/70"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.user && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={notification.user.avatar} />
                          <AvatarFallback>{notification.user.name?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="font-semibold text-white">{notification.title}</span>
                    </div>
                    <p className="text-sm text-white/70">{notification.message}</p>
                    <p className="text-xs text-white/40 mt-1">{notification.time}</p>
                  </div>

                  {notification.type === 'connection' ? (
                    <div className="flex gap-2">
                      <Button size="icon" className="btn-3d-emerald w-8 h-8" onClick={() => handleAcceptConnection(notification.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-8 h-8 text-white/50 hover:text-red-400" onClick={() => handleDismiss(notification.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="p-2 text-white/30 hover:text-white/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-white/30 mb-4" />
                <p className="text-white/50">No notifications yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
