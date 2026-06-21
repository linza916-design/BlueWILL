import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string;
          bio: string;
          location_text: string;
          date_of_birth: string;
          gender: string;
          interests: string[];
          avatar_url: string;
          banner_url: string;
          is_verified: boolean;
          presence_state: 'really_active' | 'always_off';
          role: 'root_admin' | 'project_admin' | 'finance_admin' | 'support_admin' | 'regular_user';
          subscription_tier: 'explorer' | 'blue_plus' | 'creator_pro' | 'business';
          who_can_comment: string;
          show_sensitive_content: boolean;
          accept_connections_from: string;
          private_profile: boolean;
          autoplay_media: boolean;
          onboarding_step: number;
          onboarding_completed: boolean;
          newsletter_opt_in: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name?: string;
          username?: string;
          bio?: string;
          location_text?: string;
          date_of_birth?: string;
          gender?: string;
          interests?: string[];
          avatar_url?: string;
          banner_url?: string;
          is_verified?: boolean;
          presence_state?: 'really_active' | 'always_off';
          role?: 'root_admin' | 'project_admin' | 'finance_admin' | 'support_admin' | 'regular_user';
          subscription_tier?: 'explorer' | 'blue_plus' | 'creator_pro' | 'business';
          who_can_comment?: string;
          show_sensitive_content?: boolean;
          accept_connections_from?: string;
          private_profile?: boolean;
          autoplay_media?: boolean;
          onboarding_step?: number;
          onboarding_completed?: boolean;
          newsletter_opt_in?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          full_name: string;
          username: string;
          bio: string;
          location_text: string;
          date_of_birth: string;
          gender: string;
          interests: string[];
          avatar_url: string;
          banner_url: string;
          is_verified: boolean;
          presence_state: 'really_active' | 'always_off';
          role: 'root_admin' | 'project_admin' | 'finance_admin' | 'support_admin' | 'regular_user';
          subscription_tier: 'explorer' | 'blue_plus' | 'creator_pro' | 'business';
          who_can_comment: string;
          show_sensitive_content: boolean;
          accept_connections_from: string;
          private_profile: boolean;
          autoplay_media: boolean;
          onboarding_step: number;
          onboarding_completed: boolean;
          newsletter_opt_in: boolean;
          created_at: string;
          updated_at: string;
        }>;
      };
      profile_analytics: {
        Row: {
          profile_id: string;
          visits_count: number;
          likes_count: number;
          followers_count: number;
          following_count: number;
        };
        Insert: {
          profile_id: string;
          visits_count?: number;
          likes_count?: number;
          followers_count?: number;
          following_count?: number;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          club_id: string | null;
          text_content: string;
          is_sensitive: boolean;
          category_tag: string;
          media_vault: { url: string; type: string }[];
          quiz_data: { question: string; options: string[]; votes: number[] } | null;
          thunder_boosts: number;
          hearts_likes: number;
          reposts_count: number;
          comments_count: number;
          is_paid: boolean;
          unlock_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string;
          club_id?: string;
          text_content?: string;
          is_sensitive?: boolean;
          category_tag?: string;
          media_vault?: { url: string; type: string }[];
          quiz_data?: { question: string; options: string[]; votes: number[] } | null;
          thunder_boosts?: number;
          hearts_likes?: number;
          reposts_count?: number;
          comments_count?: number;
          is_paid?: boolean;
          unlock_price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          comment_text: string;
          thunder_boosts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id?: string;
          comment_text: string;
          thunder_boosts?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          is_accepted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id?: string;
          receiver_id: string;
          is_accepted?: boolean;
          created_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          title: string;
          description: string;
          category_tag: string;
          creator_id: string | null;
          privacy_type: 'public' | 'private' | 'premium';
          subscription_required: boolean;
          monthly_price: number;
          icon_url: string;
          banner_url: string;
          member_count: number;
          age_restricted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category_tag: string;
          creator_id?: string;
          privacy_type?: 'public' | 'private' | 'premium';
          subscription_required?: boolean;
          monthly_price?: number;
          icon_url?: string;
          banner_url?: string;
          member_count?: number;
          age_restricted?: boolean;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          alert_type: string;
          action_url: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          alert_type?: string;
          action_url?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      direct_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          message_text: string;
          attached_media_url: string | null;
          is_request_token: boolean;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id?: string;
          receiver_id: string;
          message_text: string;
          attached_media_url?: string | null;
          is_request_token?: boolean;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_items: {
        Row: {
          id: string;
          seller_id: string;
          title: string;
          description: string;
          price: number;
          currency: string;
          category: string;
          item_type: 'physical' | 'digital';
          location_text: string;
          media_urls: { url: string }[];
          is_active: boolean;
          boost_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id?: string;
          title: string;
          description?: string;
          price?: number;
          currency?: string;
          category: string;
          item_type?: 'physical' | 'digital';
          location_text?: string;
          media_urls?: { url: string }[];
          is_active?: boolean;
          boost_score?: number;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
      };
      gifts: {
        Row: {
          id: string;
          name: string;
          icon: string;
          price: number;
        };
      };
      willy_conversations: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          role: string;
          content: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      delegate_project_admin: {
        Args: { target_id: string; admin_requester_id: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: 'root_admin' | 'project_admin' | 'finance_admin' | 'support_admin' | 'regular_user';
      ad_status: 'pending_review' | 'payment_required' | 'active_running' | 'paused' | 'declined';
      profile_presence: 'really_active' | 'always_off';
      subscription_tier: 'explorer' | 'blue_plus' | 'creator_pro' | 'business';
      club_privacy: 'public' | 'private' | 'premium';
      verification_status: 'pending' | 'approved' | 'denied';
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Connection = Database['public']['Tables']['connections']['Row'];
export type Club = Database['public']['Tables']['clubs']['Row'];
export type Alert = Database['public']['Tables']['alerts']['Row'];
export type DirectMessage = Database['public']['Tables']['direct_messages']['Row'];
export type MarketplaceItem = Database['public']['Tables']['marketplace_items']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type Gift = Database['public']['Tables']['gifts']['Row'];
export type WillyConversation = Database['public']['Tables']['willy_conversations']['Row'];
