"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, TrendingUp, Users, ShoppingBag, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { AppShell } from '../../components/layout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

const discoverItems = [
  { type: 'post', id: '1', image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg', title: 'Amazing sunset view' },
  { type: 'user', id: 'u1', image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', name: 'Sarah Chen', username: 'sarahcooks', verified: true },
  { type: 'club', id: 'c1', image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg', title: 'Tech Traders', members: 12340 },
  { type: 'product', id: 'p1', image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg', title: 'Vintage Camera', price: 299 },
  { type: 'post', id: '2', image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg', title: 'Nature escape' },
  { type: 'user', id: 'u2', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', name: 'John Dev', username: 'johndev', verified: false },
  { type: 'post', id: '3', image: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg', title: 'Travel diaries' },
  { type: 'club', id: 'c2', image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', title: 'Food Lovers', members: 8453 },
];

const trendingTopics = [
  { tag: 'tech', count: '12.5K' },
  { tag: 'foods', count: '8.2K' },
  { tag: 'science', count: '6.8K' },
  { tag: 'music', count: '5.4K' },
];

const filterPills = ['All', 'Posts', 'Profiles', 'Clubs', 'Shop'];

export default function DiscoverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

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
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Search Header */}
        <div className="bw-card p-6">
          <h1 className="text-2xl font-display font-bold text-white mb-4">Discover</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, profiles, clubs, marketplace..."
              className="pl-10 bg-navy-800 border-white/10"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={cn(
                  "category-pill",
                  activeFilter === pill && "active"
                )}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="bw-card p-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Trending Now
          </h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {trendingTopics.map((topic) => (
              <Link
                key={topic.tag}
                href={`/discover?tag=${topic.tag}`}
                className="flex-shrink-0 px-4 py-2 bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors"
              >
                <span className="text-cyan-400 font-medium">#{topic.tag}</span>
                <span className="text-white/50 text-sm ml-2">{topic.count} posts</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {discoverItems.filter((item) => {
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Posts') return item.type === 'post';
            if (activeFilter === 'Profiles') return item.type === 'user';
            if (activeFilter === 'Clubs') return item.type === 'club';
            if (activeFilter === 'Shop') return item.type === 'product';
            return true;
          }).map((item) => (
            <div key={`${item.type}-${item.id}`} className="masonry-item">
              <div className="bw-card overflow-hidden group cursor-pointer">
                <div className="relative">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {item.type === 'user' && (
                      <Button className="btn-3d-cyan text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                    {item.type === 'product' && (
                      <Button className="btn-3d-sunset text-sm">
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        ${item.price}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  {item.type === 'user' && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={item.image} />
                        <AvatarFallback>{item.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-white flex items-center gap-1">
                          {item.name}
                          {item.verified && <span className="trust-badge text-xs">✓</span>}
                        </p>
                        <p className="text-xs text-white/50">@{item.username}</p>
                      </div>
                    </div>
                  )}
                  {item.type === 'club' && (
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/50">{item.members?.toLocaleString()} members</p>
                    </div>
                  )}
                  {item.type === 'post' && (
                    <p className="text-sm text-white/80 line-clamp-2">{item.title}</p>
                  )}
                  {item.type === 'product' && (
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-cyan-400 font-bold">${item.price}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
