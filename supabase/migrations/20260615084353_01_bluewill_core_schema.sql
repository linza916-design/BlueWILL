
/*
# BlueWILL Core Schema - Migration 1

## Summary
This migration sets up the foundational schema for BlueWILL — a hybrid social media + marketplace platform.

## New Tables

### profiles
- Core user profiles linked to Supabase auth
- Fields: full_name, username, bio, location, date_of_birth, gender, interests, avatar_url, banner_url, is_verified, presence_state, role, subscription_tier, privacy settings, etc.
- Auto-assigns root_admin to first 3 accounts via trigger

### profile_analytics
- Tracks visits, likes, followers, following counts per profile

### connections
- Facebook-style mutual connection requests (sender, receiver, accepted flag)

### clubs
- Interest-driven community spaces with category tags, privacy types

### club_memberships
- Users joining clubs (including subscription-based private clubs)

### club_moderators
- Maps moderators to clubs

### posts
- Hybrid posts: text + media (up to 4) + quiz_data + sensitive flag + category

### comments
- Nested comments on posts

### quiz_votes
- Tracks quiz/poll votes per user per post (unique constraint prevents double voting)

### alerts / notifications
- System alerts and user notifications

### verification_queue
- KYC verification submissions (ID + video)

### ad_campaigns
- Jiji-style classified ad pipeline with admin review workflow

### direct_messages
- Real-time DMs with edit support and media attachments

### sensitive_reports
- User reports for content moderation

## Security
- RLS enabled on all tables
- Profiles: public SELECT, owner UPDATE
- Posts: public SELECT, authenticated INSERT with owner check
- DMs: sender/receiver only
- Verification queue: admins only for SELECT, owner for INSERT

## Notes
1. The first 3 registered users are automatically granted root_admin role via trigger
2. Age validation: users must be 18+ (enforced via constraint)
3. Separate analytics table to keep profiles lean
*/

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('root_admin', 'project_admin', 'finance_admin', 'support_admin', 'regular_user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ad_status AS ENUM ('pending_review', 'payment_required', 'active_running', 'paused', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE profile_presence AS ENUM ('really_active', 'always_off');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('explorer', 'blue_plus', 'creator_pro', 'business');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE club_privacy AS ENUM ('public', 'private', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'denied');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'BlueWILL User',
  username TEXT UNIQUE NOT NULL DEFAULT 'user_' || substring(gen_random_uuid()::text from 1 for 8),
  bio TEXT DEFAULT 'Hey there! I am fully expressing myself on BlueWILL.',
  location_text TEXT DEFAULT '',
  date_of_birth DATE NOT NULL DEFAULT '2000-01-01',
  gender TEXT DEFAULT 'prefer_not_to_say',
  interests TEXT[] DEFAULT '{}',
  avatar_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  is_verified BOOLEAN DEFAULT FALSE,
  presence_state profile_presence DEFAULT 'really_active',
  role user_role DEFAULT 'regular_user',
  subscription_tier subscription_tier DEFAULT 'explorer',
  -- Privacy settings
  who_can_comment TEXT DEFAULT 'everyone', -- 'everyone' | 'verified_only'
  show_sensitive_content BOOLEAN DEFAULT FALSE,
  accept_connections_from TEXT DEFAULT 'everyone', -- 'everyone' | 'verified_only' | 'nobody'
  private_profile BOOLEAN DEFAULT FALSE,
  autoplay_media BOOLEAN DEFAULT TRUE,
  -- Onboarding
  onboarding_step INT DEFAULT 0, -- 0=not started, 1,2,3,4=step, 5=complete
  onboarding_completed BOOLEAN DEFAULT FALSE,
  -- Newsletter
  newsletter_opt_in BOOLEAN DEFAULT FALSE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILE ANALYTICS
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  visits_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0
);

-- CONNECTIONS
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_connection_pair UNIQUE (sender_id, receiver_id)
);

-- CLUBS
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_tag TEXT NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  privacy_type club_privacy DEFAULT 'public',
  subscription_required BOOLEAN DEFAULT FALSE,
  monthly_price INT DEFAULT 0,
  icon_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  member_count INT DEFAULT 0,
  age_restricted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLUB MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_club_membership UNIQUE (club_id, user_id)
);

-- CLUB MODERATORS
CREATE TABLE IF NOT EXISTS public.club_moderators (
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (club_id, user_id)
);

-- POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  text_content TEXT NOT NULL DEFAULT '',
  is_sensitive BOOLEAN DEFAULT FALSE,
  category_tag TEXT NOT NULL DEFAULT 'general',
  media_vault JSONB DEFAULT '[]'::jsonb,
  quiz_data JSONB DEFAULT NULL,
  thunder_boosts INT DEFAULT 0,
  hearts_likes INT DEFAULT 0,
  reposts_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  unlock_price INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPOSTS
CREATE TABLE IF NOT EXISTS public.reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_repost UNIQUE (post_id, user_id)
);

-- LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

-- THUNDERS (BOOSTS)
CREATE TABLE IF NOT EXISTS public.post_thunders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_post_thunder UNIQUE (post_id, user_id)
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  thunder_boosts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUIZ VOTES
CREATE TABLE IF NOT EXISTS public.quiz_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  selected_option_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_voter_per_quiz UNIQUE (post_id, voter_id)
);

-- UNLOCKED CONTENT (paid posts)
CREATE TABLE IF NOT EXISTS public.unlocked_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_unlock UNIQUE (post_id, user_id)
);

-- DIRECT MESSAGES
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attached_media_url TEXT DEFAULT NULL,
  is_request_token BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALERTS / NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT DEFAULT 'system', -- 'system', 'connection', 'club', 'marketplace', 'verification'
  action_url TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VERIFICATION QUEUE
CREATE TABLE IF NOT EXISTS public.verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_card_front_url TEXT NOT NULL DEFAULT '',
  id_card_back_url TEXT NOT NULL DEFAULT '',
  liveness_video_url TEXT NOT NULL DEFAULT '',
  status verification_status DEFAULT 'pending',
  rejection_reason TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- AD CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_category TEXT NOT NULL,
  ad_text TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  campaign_status ad_status DEFAULT 'pending_review',
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SENSITIVE REPORTS
CREATE TABLE IF NOT EXISTS public.sensitive_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MARKETPLACE ITEMS
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  item_type TEXT DEFAULT 'physical', -- 'physical' | 'digital'
  location_text TEXT DEFAULT '',
  media_urls JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  boost_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BLUESTARS WALLETS
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE wallet_tx_type AS ENUM ('buy', 'spend', 'reward', 'withdraw', 'refund', 'earn', 'gift_send', 'gift_receive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  transaction_type wallet_tx_type NOT NULL,
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIFTS
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  price INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATOR BALANCES
CREATE TABLE IF NOT EXISTS public.creator_balances (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  pending_stars INT DEFAULT 0,
  withdrawable_stars INT DEFAULT 0,
  total_earned INT DEFAULT 0
);

-- PLATFORM REVENUE
CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WILLY AI CHAT HISTORY
CREATE TABLE IF NOT EXISTS public.willy_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category_tag);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_connections_lookup ON public.connections(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_conversation ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_dm_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_items(seller_id);

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function: sync auth user to profiles
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_profiles()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  new_role user_role;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.profiles;
  
  IF current_count < 3 THEN
    new_role := 'root_admin';
  ELSE
    new_role := 'regular_user';
  END IF;

  INSERT INTO public.profiles (id, full_name, username, date_of_birth, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'BlueWILL User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text from 1 for 8)),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, '2000-01-01'::date),
    new_role
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create analytics row
  INSERT INTO public.profile_analytics (profile_id) VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance) VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create creator balance
  INSERT INTO public.creator_balances (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_to_profiles();

-- Function: delegate project admin
CREATE OR REPLACE FUNCTION public.delegate_project_admin(target_id UUID, admin_requester_id UUID)
RETURNS VOID AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_requester_id AND role = 'root_admin') THEN
    UPDATE public.profiles SET role = 'project_admin' WHERE id = target_id;
    INSERT INTO public.alerts (user_id, title, message, alert_type)
    VALUES (target_id, 'You have been promoted! 👑', 'You are now a BlueWILL Project Admin.', 'system');
  ELSE
    RAISE EXCEPTION 'Access Denied: Only root admins can delegate.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- SEED DEFAULT CLUBS
-- ==========================================
INSERT INTO public.clubs (title, description, category_tag, privacy_type) VALUES
  ('Entertainment Hub', 'Movies, streaming, pop culture, and celebrity news', 'entertainment', 'public'),
  ('Relationship Corner', 'Connection advice and community networking', 'relationships', 'public'),
  ('Music Lounge', 'Song rankings, audio tracks, and concert updates', 'music', 'public'),
  ('Science Girls', 'Tech breakthroughs, physics experiments, and science discussions', 'science', 'public'),
  ('Travel Diaries', 'International logs, global photos, and destination notes', 'travelling', 'public'),
  ('Meme Factory', 'High-density joke panels and viral animated content', 'memes', 'public'),
  ('Food & Flavors', 'Restaurant reviews, recipe cards, and culinary discussions', 'foods', 'public'),
  ('Nature Watch', 'Wildlife photography, weather topics, and ecology', 'nature', 'public'),
  ('Outdoors & Adventures', 'Camping guides, hiking groups, and outdoor gear', 'outdoors', 'public'),
  ('Strange Things', 'Unexplained phenomena, mysteries, and weird discoveries', 'strange', 'public'),
  ('Tech Traders', 'Technology discussions and gadget marketplace', 'science', 'public'),
  ('News Forum', 'Breaking news, current events, and global debates', 'entertainment', 'public')
ON CONFLICT DO NOTHING;

-- Seed default gifts
INSERT INTO public.gifts (name, icon, price) VALUES
  ('Fire Bird', '🔥', 50),
  ('Diamond Blue', '💎', 500),
  ('Crown', '👑', 1000),
  ('Rocket', '🚀', 200),
  ('Blue Bird', '🦅', 100)
ON CONFLICT DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_thunders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlocked_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensitive_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.willy_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'root_admin')
);

-- PROFILE ANALYTICS policies
DROP POLICY IF EXISTS "analytics_select_all" ON public.profile_analytics;
CREATE POLICY "analytics_select_all" ON public.profile_analytics FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "analytics_update_own" ON public.profile_analytics;
CREATE POLICY "analytics_update_own" ON public.profile_analytics FOR UPDATE TO authenticated USING (true);

-- CONNECTIONS policies
DROP POLICY IF EXISTS "connections_select" ON public.connections;
CREATE POLICY "connections_select" ON public.connections FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "connections_insert" ON public.connections;
CREATE POLICY "connections_insert" ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "connections_update" ON public.connections;
CREATE POLICY "connections_update" ON public.connections FOR UPDATE TO authenticated USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

DROP POLICY IF EXISTS "connections_delete" ON public.connections;
CREATE POLICY "connections_delete" ON public.connections FOR DELETE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- CLUBS policies
DROP POLICY IF EXISTS "clubs_select_all" ON public.clubs;
CREATE POLICY "clubs_select_all" ON public.clubs FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "clubs_insert_auth" ON public.clubs;
CREATE POLICY "clubs_insert_auth" ON public.clubs FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "clubs_update_creator" ON public.clubs;
CREATE POLICY "clubs_update_creator" ON public.clubs FOR UPDATE TO authenticated USING (
  auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

DROP POLICY IF EXISTS "clubs_delete_admin" ON public.clubs;
CREATE POLICY "clubs_delete_admin" ON public.clubs FOR DELETE TO authenticated USING (
  auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

-- CLUB MEMBERSHIPS policies
DROP POLICY IF EXISTS "memberships_select" ON public.club_memberships;
CREATE POLICY "memberships_select" ON public.club_memberships FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "memberships_insert" ON public.club_memberships;
CREATE POLICY "memberships_insert" ON public.club_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "memberships_delete" ON public.club_memberships;
CREATE POLICY "memberships_delete" ON public.club_memberships FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POSTS policies
DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "posts_insert_auth" ON public.posts;
CREATE POLICY "posts_insert_auth" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE TO authenticated USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

-- REPOSTS policies
DROP POLICY IF EXISTS "reposts_select" ON public.reposts;
CREATE POLICY "reposts_select" ON public.reposts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "reposts_insert" ON public.reposts;
CREATE POLICY "reposts_insert" ON public.reposts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reposts_delete" ON public.reposts;
CREATE POLICY "reposts_delete" ON public.reposts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POST LIKES policies
DROP POLICY IF EXISTS "likes_select" ON public.post_likes;
CREATE POLICY "likes_select" ON public.post_likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert" ON public.post_likes;
CREATE POLICY "likes_insert" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete" ON public.post_likes;
CREATE POLICY "likes_delete" ON public.post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POST THUNDERS policies
DROP POLICY IF EXISTS "thunders_select" ON public.post_thunders;
CREATE POLICY "thunders_select" ON public.post_thunders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "thunders_insert" ON public.post_thunders;
CREATE POLICY "thunders_insert" ON public.post_thunders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "thunders_delete" ON public.post_thunders;
CREATE POLICY "thunders_delete" ON public.post_thunders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COMMENTS policies
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_update" ON public.comments;
CREATE POLICY "comments_update" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "comments_delete" ON public.comments;
CREATE POLICY "comments_delete" ON public.comments FOR DELETE TO authenticated USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

-- QUIZ VOTES policies
DROP POLICY IF EXISTS "quiz_votes_select" ON public.quiz_votes;
CREATE POLICY "quiz_votes_select" ON public.quiz_votes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "quiz_votes_insert" ON public.quiz_votes;
CREATE POLICY "quiz_votes_insert" ON public.quiz_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

-- DIRECT MESSAGES policies
DROP POLICY IF EXISTS "dm_select_own" ON public.direct_messages;
CREATE POLICY "dm_select_own" ON public.direct_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "dm_insert_own" ON public.direct_messages;
CREATE POLICY "dm_insert_own" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "dm_update_own" ON public.direct_messages;
CREATE POLICY "dm_update_own" ON public.direct_messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "dm_delete_own" ON public.direct_messages;
CREATE POLICY "dm_delete_own" ON public.direct_messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- ALERTS policies
DROP POLICY IF EXISTS "alerts_select_own" ON public.alerts;
CREATE POLICY "alerts_select_own" ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_update_own" ON public.alerts;
CREATE POLICY "alerts_update_own" ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "alerts_delete_own" ON public.alerts;
CREATE POLICY "alerts_delete_own" ON public.alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- VERIFICATION QUEUE policies
DROP POLICY IF EXISTS "verification_select_admin" ON public.verification_queue;
CREATE POLICY "verification_select_admin" ON public.verification_queue FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

DROP POLICY IF EXISTS "verification_insert_own" ON public.verification_queue;
CREATE POLICY "verification_insert_own" ON public.verification_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "verification_update_admin" ON public.verification_queue;
CREATE POLICY "verification_update_admin" ON public.verification_queue FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

-- AD CAMPAIGNS policies
DROP POLICY IF EXISTS "ads_select_all" ON public.ad_campaigns;
CREATE POLICY "ads_select_all" ON public.ad_campaigns FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ads_insert_own" ON public.ad_campaigns;
CREATE POLICY "ads_insert_own" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (auth.uid() = advertiser_id);

DROP POLICY IF EXISTS "ads_update_admin" ON public.ad_campaigns;
CREATE POLICY "ads_update_admin" ON public.ad_campaigns FOR UPDATE TO authenticated USING (
  auth.uid() = advertiser_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

-- SENSITIVE REPORTS policies
DROP POLICY IF EXISTS "reports_insert" ON public.sensitive_reports;
CREATE POLICY "reports_insert" ON public.sensitive_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_select_admin" ON public.sensitive_reports;
CREATE POLICY "reports_select_admin" ON public.sensitive_reports FOR SELECT TO authenticated USING (
  auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'project_admin'))
);

-- MARKETPLACE policies
DROP POLICY IF EXISTS "marketplace_select_all" ON public.marketplace_items;
CREATE POLICY "marketplace_select_all" ON public.marketplace_items FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "marketplace_insert_own" ON public.marketplace_items;
CREATE POLICY "marketplace_insert_own" ON public.marketplace_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "marketplace_update_own" ON public.marketplace_items;
CREATE POLICY "marketplace_update_own" ON public.marketplace_items FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "marketplace_delete_own" ON public.marketplace_items;
CREATE POLICY "marketplace_delete_own" ON public.marketplace_items FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- WALLETS policies
DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_update_own" ON public.wallets;
CREATE POLICY "wallets_update_own" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- WALLET TRANSACTIONS policies
DROP POLICY IF EXISTS "wallet_tx_select_own" ON public.wallet_transactions;
CREATE POLICY "wallet_tx_select_own" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallet_tx_insert_own" ON public.wallet_transactions;
CREATE POLICY "wallet_tx_insert_own" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- GIFTS policies
DROP POLICY IF EXISTS "gifts_select_all" ON public.gifts;
CREATE POLICY "gifts_select_all" ON public.gifts FOR SELECT TO authenticated, anon USING (true);

-- USER GIFTS policies
DROP POLICY IF EXISTS "user_gifts_select" ON public.user_gifts;
CREATE POLICY "user_gifts_select" ON public.user_gifts FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "user_gifts_insert" ON public.user_gifts;
CREATE POLICY "user_gifts_insert" ON public.user_gifts FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- CREATOR BALANCES policies
DROP POLICY IF EXISTS "creator_balances_select_own" ON public.creator_balances;
CREATE POLICY "creator_balances_select_own" ON public.creator_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "creator_balances_update" ON public.creator_balances;
CREATE POLICY "creator_balances_update" ON public.creator_balances FOR UPDATE TO authenticated USING (true);

-- WILLY CONVERSATIONS policies
DROP POLICY IF EXISTS "willy_select_own" ON public.willy_conversations;
CREATE POLICY "willy_select_own" ON public.willy_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "willy_insert_own" ON public.willy_conversations;
CREATE POLICY "willy_insert_own" ON public.willy_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "willy_delete_own" ON public.willy_conversations;
CREATE POLICY "willy_delete_own" ON public.willy_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PLATFORM REVENUE policies (admin only)
DROP POLICY IF EXISTS "revenue_select_admin" ON public.platform_revenue;
CREATE POLICY "revenue_select_admin" ON public.platform_revenue FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('root_admin', 'finance_admin'))
);

DROP POLICY IF EXISTS "revenue_insert" ON public.platform_revenue;
CREATE POLICY "revenue_insert" ON public.platform_revenue FOR INSERT TO authenticated WITH CHECK (true);
