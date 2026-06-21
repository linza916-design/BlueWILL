"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Shield, CreditCard, Bell, Moon, Sun, LogOut, Check, ChevronRight, Loader2, Camera
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { AppShell } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../../components/ui/select';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const subscriptionTiers = [
  {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'Discover the community',
    price: 0,
    period: 'Free',
    features: [
      'Unlimited profile browsing',
      'Join public communities',
      'View marketplace listings',
      'Limited messages per day',
    ],
    limitations: ['Limited DMs', 'Limited connection requests', 'No marketplace ads'],
  },
  {
    id: 'blue_plus',
    name: 'Blue+',
    tagline: 'Unlock secure connections',
    price: 4.99,
    period: '/month',
    features: [
      '100% Ad-free timeline',
      'Identity Verification access',
      'Expanded daily DM limits',
      'Unlimited connection requests',
      '100 AI assistant tokens/month',
    ],
    popular: true,
  },
  {
    id: 'creator_pro',
    name: 'Creator Pro',
    tagline: 'Build your community',
    price: 12.99,
    period: '/month',
    features: [
      'Everything in Blue+',
      'Marketplace: 5 featured listings/month',
      'Create and moderate Clubs',
      'Profile visibility boost',
      'Paid posts & monetization',
      'Premium badge',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Scale your business',
    price: 29.99,
    period: '/month',
    features: [
      'Everything in Creator Pro',
      'Unlimited marketplace listings',
      'Business tools & analytics',
      'Auto-replies',
      'Priority support',
      'API access',
    ],
  },
];

export default function SettingsPage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme, addAlert } = useBlueWill();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  // Privacy settings
  const [whoCanComment, setWhoCanComment] = useState('everyone');
  const [showSensitiveContent, setShowSensitiveContent] = useState(false);
  const [acceptConnectionsFrom, setAcceptConnectionsFrom] = useState('everyone');
  const [privateProfile, setPrivateProfile] = useState(false);
  const [autoplayMedia, setAutoplayMedia] = useState(true);

  // Billing
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState('explorer');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location_text || '');
      setWhoCanComment(profile.who_can_comment || 'everyone');
      setShowSensitiveContent(profile.show_sensitive_content || false);
      setAcceptConnectionsFrom(profile.accept_connections_from || 'everyone');
      setPrivateProfile(profile.private_profile || false);
      setAutoplayMedia(profile.autoplay_media ?? true);
      setSelectedTier(profile.subscription_tier || 'explorer');
    }
  }, [user, profile, router]);

  const handleSaveProfile = async () => {
    setLoading(true);
    const { error } = await updateProfile({
      full_name: fullName,
      username,
      bio,
      location_text: location,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      addAlert({ type: 'error', title: 'Failed to save', message: error.message });
    } else {
      addAlert({ type: 'success', title: 'Profile updated!', message: '' });
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    const { error } = await updateProfile({
      who_can_comment: whoCanComment,
      show_sensitive_content: showSensitiveContent,
      accept_connections_from: acceptConnectionsFrom,
      private_profile: privateProfile,
      autoplay_media: autoplayMedia,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      addAlert({ type: 'error', title: 'Failed to save', message: error.message });
    } else {
      addAlert({ type: 'success', title: 'Privacy settings updated!', message: '' });
    }
  };

  const handleSubscribe = async (tier: string) => {
    addAlert({ type: 'info', title: 'Payment integration required', message: 'Stripe setup needed' });
    setSelectedTier(tier);
  };

  if (!user || !profile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </AppShell>
    );
  }

  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
          <p className="text-white/60">Manage your BlueWILL account</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Nav */}
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                  activeSection === section.id
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </button>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <div className="border-t border-white/10 my-4" />

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </nav>

          {/* Content */}
          <div className="space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="bw-card p-6 space-y-6">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  Profile Identity
                </h2>

                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-cyan-500/30">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="text-cyan-400 border-cyan-400/30">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-white/50 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-navy-800 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Username</Label>
                    <div className="flex items-center bg-navy-800 rounded-md border border-white/10 overflow-hidden">
                      <span className="text-white/50 px-3">@</span>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="border-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="bg-navy-800 border-white/10 resize-none"
                  />
                  <p className="text-xs text-white/50">{bio.length}/160</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="bg-navy-800 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Website</Label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://"
                      className="bg-navy-800 border-white/10"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="btn-3d-cyan" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="bw-card p-6 space-y-6">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Privacy & Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-navy-800/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Who can comment on your posts?</p>
                      <p className="text-white/50 text-sm">Control your audience</p>
                    </div>
                    <Select value={whoCanComment} onValueChange={setWhoCanComment}>
                      <SelectTrigger className="w-40 bg-navy-800 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="verified_only">Verified Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-navy-800/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Show Sensitive / Adult Content</p>
                      <p className="text-white/50 text-sm">Toggle mature content visibility</p>
                    </div>
                    <Switch
                      checked={showSensitiveContent}
                      onCheckedChange={setShowSensitiveContent}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-navy-800/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Accept Connection Requests From</p>
                    </div>
                    <Select value={acceptConnectionsFrom} onValueChange={setAcceptConnectionsFrom}>
                      <SelectTrigger className="w-40 bg-navy-800 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="verified_only">Verified Only</SelectItem>
                        <SelectItem value="nobody">Nobody</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-navy-800/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Private Profile</p>
                      <p className="text-white/50 text-sm">Hide from search and SEO</p>
                    </div>
                    <Switch
                      checked={privateProfile}
                      onCheckedChange={setPrivateProfile}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-navy-800/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">Auto-play Media</p>
                      <p className="text-white/50 text-sm">Save data by disabling autoplay</p>
                    </div>
                    <Switch
                      checked={autoplayMedia}
                      onCheckedChange={setAutoplayMedia}
                    />
                  </div>
                </div>

                <Button onClick={handleSavePrivacy} className="btn-3d-cyan" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Privacy Settings'}
                </Button>
              </div>
            )}

            {/* Subscription Section */}
            {activeSection === 'subscription' && (
              <div className="space-y-6">
                {/* Billing Toggle */}
                <div className="bw-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "text-sm",
                      billingCycle === 'monthly' ? "text-white font-semibold" : "text-white/50"
                    )}>
                      Monthly
                    </span>
                    <Switch
                      checked={billingCycle === 'annual'}
                      onCheckedChange={(checked) => setBillingCycle(checked ? 'annual' : 'monthly')}
                    />
                    <span className={cn(
                      "text-sm",
                      billingCycle === 'annual' ? "text-white font-semibold" : "text-white/50"
                    )}>
                      Annual
                      <span className="ml-2 text-emerald-400 text-xs">Save 20%</span>
                    </span>
                  </div>
                </div>

                {/* Tier Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {subscriptionTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={cn(
                        "tier-card bg-navy-800/50 border-white/10",
                        selectedTier === tier.id && "border-cyan-500 bg-cyan-500/5",
                        tier.popular && "relative overflow-visible"
                      )}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sunset-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                          <p className="text-white/50 text-sm">{tier.tagline}</p>
                        </div>
                        {selectedTier === tier.id && (
                          <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-navy-950" />
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">
                          ${billingCycle === 'annual' ? (tier.price * 0.8).toFixed(2) : tier.price}
                        </span>
                        <span className="text-white/50">{tier.period}</span>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-white/80">
                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Button
                        onClick={() => handleSubscribe(tier.id)}
                        className={cn(
                          "w-full",
                          tier.price === 0 ? "btn-3d-ghost" : "btn-3d-sunset"
                        )}
                      >
                        {selectedTier === tier.id ? 'Current Plan' : tier.price === 0 ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Verification */}
                {(selectedTier !== 'explorer') && (
                  <div className="bw-card p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Identity Verification</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Verify your identity to get the trusted badge and unlock full marketplace features.
                    </p>
                    <Button className="btn-3d-cyan">
                      Start Verification
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
