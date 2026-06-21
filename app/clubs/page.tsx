"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Plus, Search, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

const categoryIcons: Record<string, string> = {
  entertainment: '🎬',
  relationships: '💞',
  music: '🎵',
  science: '🧪',
  travelling: '✈️',
  memes: '🤪',
  foods: '🍔',
  nature: '🌿',
  outdoors: '🏕️',
  strange: '👻',
};

const defaultClubs = [
  { id: '1', title: 'Entertainment Hub', category_tag: 'entertainment', description: 'Movies, streaming, pop culture', member_count: 15430, privacy_type: 'public' },
  { id: '2', title: 'Music Lounge', category_tag: 'music', description: 'Song rankings, albums, concerts', member_count: 12340, privacy_type: 'public' },
  { id: '3', title: 'Science Girls', category_tag: 'science', description: 'Tech breakthroughs, physics, experiments', member_count: 8543, privacy_type: 'public' },
  { id: '4', title: 'Strange Things', category_tag: 'strange', description: 'Unexplained phenomena, mysteries', member_count: 6721, privacy_type: 'public' },
  { id: '5', title: 'Food & Flavors', category_tag: 'foods', description: 'Restaurant reviews, recipes', member_count: 9542, privacy_type: 'public' },
  { id: '6', title: 'Tech Traders', category_tag: 'science', description: 'Technology discussions, gadgets', member_count: 11234, privacy_type: 'public' },
  { id: '7', title: 'Travel Diaries', category_tag: 'travelling', description: 'Travel logs, destinations', member_count: 7890, privacy_type: 'public' },
  { id: '8', title: 'Nature Watch', category_tag: 'nature', description: 'Wildlife, ecology, weather', member_count: 5432, privacy_type: 'public' },
];

export default function ClubsPage() {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadClubs();
  }, [user, router]);

  const loadClubs = async () => {
    setLoading(true);
    // Load from Supabase or use defaults
    const { data } = await supabase.from('clubs').select('*').limit(20);
    if (data && data.length > 0) {
      setClubs(data);
    } else {
      setClubs(defaultClubs);
    }
    setLoading(false);
  };

  const handleFollow = async (clubId: string) => {
    if (!user) return;

    if (followedClubs.includes(clubId)) {
      setFollowedClubs((prev) => prev.filter((id) => id !== clubId));
      await supabase.from('club_memberships').delete().match({ club_id: clubId, user_id: user.id });
    } else {
      setFollowedClubs((prev) => [...prev, clubId]);
      await supabase.from('club_memberships').insert([{ club_id: clubId, user_id: user.id }]);
      addAlert({ type: 'success', title: 'Joined club!', message: '' });
    }
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.title.toLowerCase().includes(search.toLowerCase()) ||
      club.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || club.category_tag === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(clubs.map((c) => c.category_tag)));

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
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bw-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              Clubs
            </h1>
            {profile?.subscription_tier !== 'explorer' && (
              <Button className="btn-3d-cyan">
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clubs..."
              className="pl-10 bg-navy-800 border-white/10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "category-pill",
              !activeCategory && "active"
            )}
          >
            All
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                "category-pill",
                activeCategory === cat && "active"
              )}
            >
              {categoryIcons[cat] || '📌'} {cat}
            </button>
          ))}
        </div>

        {/* Clubs List */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bw-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl skeleton" />
                  <div className="space-y-2 flex-1">
                    <div className="w-24 h-4 skeleton" />
                    <div className="w-16 h-3 skeleton" />
                  </div>
                </div>
                <div className="w-full h-3 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredClubs.map((club) => (
              <div key={club.id} className="bw-card p-4 hover:border-cyan-500/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center text-2xl">
                    {categoryIcons[club.category_tag] || '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{club.title}</h3>
                    <p className="text-sm text-white/50">{club.member_count?.toLocaleString() || 0} members</p>
                  </div>
                </div>
                {club.description && (
                  <p className="text-sm text-white/70 mt-2 line-clamp-2">{club.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded-full">
                    #{club.category_tag}
                  </span>
                  <Button
                    size="sm"
                    variant={followedClubs.includes(club.id) ? "default" : "outline"}
                    onClick={() => handleFollow(club.id)}
                    className={cn(
                      followedClubs.includes(club.id) ? "btn-3d-emerald" : "text-cyan-400 border-cyan-400/30"
                    )}
                  >
                    {followedClubs.includes(club.id) ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-white/30 mb-4" />
            <p className="text-white/50">No clubs found</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
