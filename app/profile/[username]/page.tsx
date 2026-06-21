"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings, MapPin, Calendar, Link as LinkIcon, Eye, Heart, Users, User, MessageCircle, ShoppingBag, Camera, UsersRound, MoreHorizontal, Loader2
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useBlueWill } from '../../../hooks/useBlueWill';
import { supabase, Profile as ProfileType, Post } from '../../../lib/supabase';
import { AppShell } from '../../../components/layout';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { cn } from '../../../lib/utils';

const mockPosts: any[] = [
  {
    id: 'p1',
    text_content: 'Just discovered an amazing coffee shop!',
    media_vault: [{ url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg' }],
    hearts_likes: 234,
    thunder_boosts: 45,
    comments_count: 12,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_paid: false,
  },
  {
    id: 'p2',
    text_content: 'What do you think about this poll?',
    quiz_data: { question: 'Best framework?', options: ['React', 'Vue', 'Svelte', 'Angular'], votes: [50, 30, 15, 5] },
    hearts_likes: 89,
    thunder_boosts: 23,
    comments_count: 34,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_paid: false,
  },
];

const mockClubs = [
  { id: 'c1', title: 'Tech Traders', icon: '💻', members: 12340 },
  { id: 'c2', title: 'Food & Flavors', icon: '🍔', members: 8543 },
  { id: 'c3', title: 'Science Girls', icon: '🧪', members: 5621 },
];

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const { user, profile: currentUser } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('thoughts');
  const [connectionState, setConnectionState] = useState<'none' | 'pending' | 'connected'>('none');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    loadProfile();
  }, [resolvedParams.username]);

  const loadProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', resolvedParams.username)
      .maybeSingle();

    if (data) {
      setProfile(data as ProfileType);
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!user || !profile) {
      addAlert({ type: 'error', title: 'Please log in', message: '' });
      return;
    }

    if (connectionState === 'none') {
      await supabase.from('connections').insert([{
        sender_id: user.id,
        receiver_id: profile.id,
      }]);
      setConnectionState('pending');
      addAlert({ type: 'success', title: 'Connection request sent!', message: '' });
    } else if (connectionState === 'pending') {
      // Cancel request
      await supabase.from('connections')
        .delete()
        .match({ sender_id: user.id, receiver_id: profile.id });
      setConnectionState('none');
    }
  };

  const handleMessage = () => {
    router.push(`/messages/${profile?.id}`);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <h1 className="text-2xl font-display font-bold text-white mb-4">User Not Found</h1>
          <p className="text-white/60">The profile you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </AppShell>
    );
  }

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-navy-700 via-slate_blue-600 to-cyan-600">
          {profile.banner_url && (
            <img
              src={profile.banner_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="relative px-4 sm:px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <Avatar className="w-32 h-32 border-4 border-navy-950 shadow-xl">
              <AvatarImage src={profile.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white text-4xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Activity indicator */}
            <div className={cn(
              "absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-navy-950",
              profile.presence_state === 'really_active' ? "bg-emerald-500" : "bg-slate-500"
            )} />
          </div>

          {/* Actions */}
          <div className="flex justify-end items-start pt-4 gap-2">
            {isOwnProfile ? (
              <>
                <Link href="/settings">
                  <Button variant="outline" className="text-cyan-400 border-cyan-400/30">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/marketplace/my-shop">
                  <Button variant="outline" className="text-cyan-400 border-cyan-400/30">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Shop
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button onClick={handleConnect} className={cn(
                  "btn-3d",
                  connectionState === 'connected' ? "btn-3d-emerald" :
                  connectionState === 'pending' ? "bg-sunset-500 text-white hover:bg-sunset-400" :
                  "btn-3d-cyan"
                )}>
                  {connectionState === 'connected' ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Connected
                    </>
                  ) : connectionState === 'pending' ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Pending
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleMessage} className="text-cyan-400 border-cyan-400/30">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-12 sm:mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-display font-bold text-white">
                {profile.full_name}
              </h1>
              {profile.is_verified && (
                <span className="trust-badge">
                  <span className="text-xs">✓</span>
                  Verified
                </span>
              )}
              <span className={cn(
                profile.presence_state === 'really_active' ? "presence-active" : "presence-off"
              )}>
                {profile.presence_state === 'really_active' ? '🟢 Really Active' : '⚫ Offline'}
              </span>
            </div>

            <p className="text-white/70 mb-3">@{profile.username}</p>

            {profile.bio && (
              <p className="text-white mb-3 max-w-2xl">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 flex-wrap text-sm text-white/60">
              {profile.location_text && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location_text}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Analytics Bar */}
            <div className="mt-6 p-4 bg-navy-800/30 rounded-xl border border-white/10">
              <div className="flex items-center justify-around flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">4.2k</div>
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Visits
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">18.5k</div>
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Likes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">840</div>
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">620</div>
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Following
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-white/70">
                <strong className="text-white">1,240</strong> Mutual Connections
              </span>
              <span className="text-white/70">
                <strong className="text-white">45</strong> Clubs Joined
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-white/10 px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0 border-b border-white/10">
              <TabsTrigger value="thoughts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400">
                <MessageCircle className="w-4 h-4 mr-2" />
                Thoughts
              </TabsTrigger>
              <TabsTrigger value="qa" className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400">
                Q&A
              </TabsTrigger>
              <TabsTrigger value="shop" className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop
              </TabsTrigger>
              <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400">
                <Camera className="w-4 h-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="groups" className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400">
                <UsersRound className="w-4 h-4 mr-2" />
                Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thoughts" className="mt-6">
              <div className="grid gap-4">
                {mockPosts.map((post) => (
                  <div key={post.id} className="bw-card p-4">
                    <p className="text-white mb-3">{post.text_content}</p>
                    {post.media_vault?.[0] && (
                      <img src={post.media_vault[0].url} alt="" className="rounded-lg max-h-64 object-cover mb-3" />
                    )}
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span><Heart className="w-4 h-4 inline mr-1" />{post.hearts_likes}</span>
                      <span>{post.comments_count} comments</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shop" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bw-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <img
                      src={`https://images.pexels.com/photos/${25000 + i * 100}/pexels-photo-${25000 + i * 100}.jpeg`}
                      alt=""
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-white">Premium Item {i}</h3>
                      <p className="text-cyan-400 font-bold mt-1">${(i * 29.99).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {mockClubs.map((club) => (
                  <div key={club.id} className="bw-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center text-2xl">
                      {club.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{club.title}</h3>
                      <p className="text-sm text-white/50">{club.members.toLocaleString()} members</p>
                    </div>
                    <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-full">
                      Member
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={`https://images.pexels.com/photos/${20000 + i * 500}/pexels-photo-${20000 + i * 500}.jpeg`}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <div className="text-center py-12">
                <p className="text-white/50">No Q&A activity yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
