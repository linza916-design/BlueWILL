"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Search, Filter, MapPin, Star, Plus, Loader2, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { AppShell } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';

const mockProducts = [
  { id: 'p1', title: 'iPhone 14 Pro Max', price: 2300000, currency: 'UGX', category: 'phones', location: 'Kampala, Uganda', image: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg', seller: { name: 'John Tech', verified: true }, type: 'physical' },
  { id: 'p2', title: 'Vintage Camera', price: 299, currency: 'USD', category: 'electronics', location: 'Nairobi, Kenya', image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg', seller: { name: 'Camera Store', verified: true }, type: 'physical' },
  { id: 'p3', title: 'Digital Marketing Course', price: 150, currency: 'Stars', category: 'digital', location: 'Online', image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg', seller: { name: 'Marketing Pro', verified: true }, type: 'digital' },
  { id: 'p4', title: 'Leather Jacket', price: 450000, currency: 'UGX', category: 'fashion', location: 'Kampala, Uganda', image: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg', seller: { name: 'Fashion Hub', verified: false }, type: 'physical' },
  { id: 'p5', title: 'Python Programming eBook', price: 80, currency: 'Stars', category: 'digital', location: 'Online', image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg', seller: { name: 'Code Academy', verified: true }, type: 'digital' },
];

const categories = ['All', 'Phones', 'Electronics', 'Fashion', 'Digital', 'Home', 'Vehicles'];

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('physical');
  const [products] = useState(mockProducts);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesType = product.type === activeTab;
    return matchesSearch && matchesCategory && matchesType;
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
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bw-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-cyan-400" />
              Marketplace
            </h1>
            {profile?.subscription_tier !== 'explorer' && (
              <Button className="btn-3d-sunset">
                <Plus className="w-4 h-4 mr-2" />
                List Item
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search marketplace..."
              className="pl-10 bg-navy-800 border-white/10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center gap-4 mb-4">
            <TabsList className="bg-navy-800/50">
              <TabsTrigger value="physical" className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                <Package className="w-4 h-4" />
                Physical Goods
              </TabsTrigger>
              <TabsTrigger value="digital" className="flex items-center gap-2 data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                <Sparkles className="w-4 h-4" />
                Digital Products
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "category-pill",
                  activeCategory === cat && "active"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <TabsContent value={activeTab} className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bw-card overflow-hidden group cursor-pointer">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.type === 'digital' && (
                      <div className="absolute top-2 right-2 bg-cyan-500 text-navy-950 text-xs font-semibold px-2 py-1 rounded-full">
                        Digital
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{product.title}</h3>

                    <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.location}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-bold text-cyan-400">
                        {product.currency === 'Stars' ? (
                          <>🪽 {product.price}</>
                        ) : (
                          `${product.currency === 'USD' ? '$' : ''}${product.price.toLocaleString()}${product.currency === 'UGX' ? ' UGX' : ''}`
                        )}
                      </p>
                      {product.seller.verified && (
                        <span className="trust-badge text-xs">✓</span>
                      )}
                    </div>

                    <p className="text-xs text-white/50 mt-2">by {product.seller.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 mx-auto text-white/30 mb-4" />
                <p className="text-white/50">No products found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Wallet Info */}
        <div className="bw-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🪽 BlueStars Wallet</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-cyan-400">250</p>
              <p className="text-sm text-white/50">Available Balance</p>
            </div>
            <Button className="btn-3d-cyan">
              Buy BlueStars
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
