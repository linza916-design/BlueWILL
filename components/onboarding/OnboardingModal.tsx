"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { supabase as supabaseClient } from '../../lib/supabase';

const interests = [
  { tag: 'news', icon: '📰', label: 'News' },
  { tag: 'health', icon: '🏥', label: 'Health' },
  { tag: 'music', icon: '🎵', label: 'Music' },
  { tag: 'nature', icon: '🌿', label: 'Nature' },
  { tag: 'entertainment', icon: '🎬', label: 'Entertainment' },
  { tag: 'foods', icon: '🍔', label: 'Food' },
  { tag: 'science', icon: '🧪', label: 'Science' },
  { tag: 'finance', icon: '📈', label: 'Finance' },
  { tag: 'shopping', icon: '🛍️', label: 'Shopping' },
  { tag: 'gaming', icon: '🎮', label: 'Gaming' },
];

const defaultClubs = [
  { id: '1', title: 'Entertainment Hub', category: 'entertainment', icon: '🎬' },
  { id: '2', title: 'Music Lounge', category: 'music', icon: '🎵' },
  { id: '3', title: 'Science Girls', category: 'science', icon: '🧪' },
  { id: '4', title: 'Strange Things', category: 'memes', icon: '👻' },
  { id: '5', title: 'Food & Flavors', category: 'foods', icon: '🍔' },
  { id: '6', title: 'Tech Traders', category: 'science', icon: '💻' },
  { id: '7', title: 'Travel Diaries', category: 'travelling', icon: '✈️' },
  { id: '8', title: 'Nature Watch', category: 'nature', icon: '🌿' },
];

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setLocation(profile.location_text || '');
      setGender(profile.gender || 'prefer_not_to_say');
      setSelectedInterests(profile.interests || []);
      setNewsletterOptIn(profile.newsletter_opt_in || false);
      setStep(profile.onboarding_step || 1);
    }
  }, [profile]);

  const progressPercent = (step / 4) * 100;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSaveStep = async (stepNum: number) => {
    setLoading(true);
    const { error } = await updateProfile({
      onboarding_step: stepNum,
    });

    if (error) {
      addAlert({ type: 'error', title: 'Error saving progress', message: error.message });
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (selectedInterests.length < 3) {
      addAlert({ type: 'error', title: 'Select at least 3 interests', message: 'We need to know what you like!' });
      return;
    }

    if (followedClubs.length < 1) {
      addAlert({ type: 'error', title: 'Follow at least 1 club', message: 'Join a community to get started!' });
      return;
    }

    setLoading(true);

    // Update profile
    const { error: profileError } = await updateProfile({
      full_name: fullName,
      username,
      bio: bio || 'Hey there! I am using BlueWILL.',
      location_text: location,
      gender,
      interests: selectedInterests,
      newsletter_opt_in: newsletterOptIn,
      onboarding_completed: true,
      onboarding_step: 5,
    });

    if (profileError) {
      addAlert({ type: 'error', title: 'Error completing setup', message: profileError.message });
      setLoading(false);
      return;
    }

    // Follow clubs
    if (user && followedClubs.length > 0) {
      const memberships = followedClubs.map((clubId) => ({
        club_id: clubId,
        user_id: user.id,
      }));

      await supabaseClient.from('club_memberships').insert(memberships);
    }

    addAlert({ type: 'success', title: 'Welcome to BlueWILL!', message: 'Your profile is ready!' });
    onOpenChange(false);
    refreshProfile();
    router.push('/home');
    setLoading(false);
  };

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleClub = (clubId: string) => {
    setFollowedClubs((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-navy-900 border-white/10 text-white overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center">
            <span className="text-2xl">🦅</span>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-white">
              {step === 1 && 'Create Your Profile'}
              {step === 2 && 'Add Your Visuals'}
              {step === 3 && 'What Interests You?'}
              {step === 4 && 'Join Communities'}
            </h2>
            <p className="text-sm text-white/60">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progressPercent} className="h-1 mb-6" />

        {/* Step 1: Core Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
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
                    placeholder="johndoe"
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
                placeholder="Tell us about yourself..."
                rows={3}
                className="bg-navy-800 border-white/10 resize-none"
              />
              <p className="text-xs text-white/50">{bio.length}/160 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kampala, Uganda"
                  className="bg-navy-800 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="text-sm">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="text-sm">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                    <Label htmlFor="prefer_not_to_say" className="text-sm">...</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Visuals */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white/70">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-navy-800 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors overflow-hidden">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Upload Photo</span>
                    </Button>
                  </label>
                  <p className="text-xs text-white/50 mt-1">Max 5MB, JPG/PNG/GIF</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Banner Image</Label>
              <div className="w-full h-32 rounded-xl bg-navy-800 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors overflow-hidden">
                {bannerFile ? (
                  <img src={URL.createObjectURL(bannerFile)} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl">🖼️</span>
                    <p className="text-sm text-white/50 mt-1">Click to upload banner</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="banner-upload"
                />
                <label htmlFor="banner-upload" className="w-full h-full absolute cursor-pointer" />
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
              <p className="text-cyan-400 text-sm">
                💡 <strong>Tip:</strong> Skip these and Blue will give you a default avatar and banner automatically!
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">Select at least 3 interests to personalize your feed.</p>

            <div className="grid grid-cols-2 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest.tag}
                  onClick={() => toggleInterest(interest.tag)}
                  className={cn(
                    "interest-btn",
                    selectedInterests.includes(interest.tag) && "selected"
                  )}
                >
                  <span className="text-xl">{interest.icon}</span>
                  <span>{interest.label}</span>
                  {selectedInterests.includes(interest.tag) && (
                    <Check className="w-4 h-4 ml-auto text-cyan-400" />
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-white/50">
              {selectedInterests.length}/3 minimum interests selected
            </p>
          </div>
        )}

        {/* Step 4: Clubs */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">Follow at least 1 club to get started.</p>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="rounded"
                />
                Email updates
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {defaultClubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => toggleClub(club.id)}
                  className={cn(
                    "interest-btn",
                    followedClubs.includes(club.id) && "selected"
                  )}
                >
                  <span className="text-xl">{club.icon}</span>
                  <span className="flex-1 text-left">{club.title}</span>
                  {followedClubs.includes(club.id) ? (
                    <span className="text-xs text-cyan-400 font-semibold">Following</span>
                  ) : (
                    <span className="text-xs text-white/50">Follow</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="text-white/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => {
                handleSaveStep(step + 1);
                handleNext();
              }}
              disabled={loading}
              className="btn-3d-cyan"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading} className="btn-3d-sunset">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Setup'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
