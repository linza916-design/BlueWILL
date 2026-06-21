"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, Heart, MessageCircle, RefreshCcw, Share2, Lock, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase, Post, Profile } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { CommentSection } from './CommentSection';
import { QuizDisplay } from './QuizDisplay';

interface PostCardProps {
  post: Post;
  author: Profile | null;
}

export function PostCard({ post, author }: PostCardProps) {
  const { user, profile } = useAuth();
  const { addAlert, isDayTime } = useBlueWill();
  const [liked, setLiked] = useState(false);
  const [thundered, setThundered] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [animatingThunder, setAnimatingThunder] = useState(false);

  const initials = author?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const timeAgo = getTimeAgo(post.created_at);

  // Apply blur for sensitive content during daytime
  useEffect(() => {
    if (post.is_sensitive && isDayTime) {
      setBlurred(true);
    }
  }, [post.is_sensitive, isDayTime]);

  const handleBlurToggle = () => {
    setBlurred(!blurred);
  };

  const handleLike = async () => {
    if (!user) return;

    setLiked(!liked);

    if (!liked) {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id });
    }
  };

  const handleThunder = async () => {
    if (!user) return;

    setThundered(!thundered);
    setAnimatingThunder(true);

    setTimeout(() => setAnimatingThunder(false), 500);

    if (!thundered) {
      await supabase.from('post_thunders').insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from('post_thunders').delete().match({ post_id: post.id, user_id: user.id });
    }
  };

  const handleRepost = async () => {
    if (!user) return;

    setReposted(!reposted);

    if (!reposted) {
      await supabase.from('reposts').insert({ post_id: post.id, user_id: user.id });
      addAlert({ type: 'success', title: 'Reposted!', message: '' });
    } else {
      await supabase.from('reposts').delete().match({ post_id: post.id, user_id: user.id });
    }
  };

  const handleUnlockPaid = async () => {
    addAlert({ type: 'info', title: 'BlueStars Required', message: 'Wallet integration needed' });
  };

  return (
    <Card className="bw-card overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Link href={`/profile/${author?.username}`} className="flex items-center gap-3 group">
            <Avatar className="w-12 h-12 border-2 border-cyan-500/30 group-hover:border-cyan-500 transition-colors">
              <AvatarImage src={author?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {author?.full_name}
                </span>
                {author?.is_verified && (
                  <span className="trust-badge text-xs">
                    <span className="text-xs">✓</span>
                    Verified
                  </span>
                )}
                <span className={cn(
                  "text-xs",
                  author?.presence_state === 'really_active' ? "presence-active" : "presence-off"
                )}>
                  {author?.presence_state === 'really_active' ? '🟢 Active' : '⚫ Offline'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>@{author?.username}</span>
                <span>・</span>
                <span>{timeAgo}</span>
                {!!post.category_tag && (
                  <>
                    <span>・</span>
                    <span className="text-cyan-400">#{post.category_tag}</span>
                  </>
                )}
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-white/10">
                <MoreHorizontal className="w-5 h-5 text-white/50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Bookmark</DropdownMenuItem>
              <DropdownMenuItem>Hide</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-white whitespace-pre-wrap">{post.text_content}</p>
        </div>

        {/* Media */}
        {post.media_vault && post.media_vault.length > 0 && (
          <div className={cn(
            "relative mb-4 rounded-xl overflow-hidden",
            blurred && "sensitive-blur"
          )}>
            {post.media_vault.length === 1 ? (
              <img
                src={post.media_vault[0].url}
                alt=""
                className="w-full max-h-[400px] object-cover"
              />
            ) : (
              <div className={cn(
                "grid gap-2",
                post.media_vault.length === 2 && "grid-cols-2",
                post.media_vault.length === 3 && "grid-cols-2 grid-rows-2",
                post.media_vault.length === 4 && "grid-cols-2"
              )}>
                {post.media_vault.map((media, idx) => (
                  <img
                    key={idx}
                    src={media.url}
                    alt=""
                    className={cn(
                      "w-full h-40 object-cover rounded-lg",
                      idx === 0 && post.media_vault.length === 3 && "col-span-2 h-48"
                    )}
                  />
                ))}
              </div>
            )}

            {blurred && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                onDoubleClick={handleBlurToggle}
              >
                <div className="text-center">
                  <Lock className="w-8 h-8 mx-auto text-white/70 mb-2" />
                  <p className="text-white/70 text-sm">Double-click to reveal</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz */}
        {post.quiz_data && (
          <QuizDisplay quiz={post.quiz_data} postId={post.id} />
        )}

        {/* Paid Content Lock */}
        {post.is_paid && (
          <div className="bg-navy-800/50 rounded-xl p-6 text-center mb-4 border border-cyan-500/20">
            <Lock className="w-10 h-10 mx-auto text-cyan-400 mb-3" />
            <h4 className="text-lg font-semibold text-white mb-1">Premium Content</h4>
            <p className="text-white/60 text-sm mb-4">
              Unlock for <span className="text-canary-400 font-semibold">{post.unlock_price}</span> 🪽 BlueStars
            </p>
            <Button onClick={handleUnlockPaid} className="btn-3d-cyan">
              Unlock Content
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleThunder}
            className={cn(
              "post-action-btn",
              thundered && "text-cyan-400",
              animatingThunder && "animate-thunder-streak"
            )}
          >
            <Zap className={cn("w-5 h-5", thundered && "fill-cyan-400")} />
            <span className="text-xs">{(post.thunder_boosts || 0) + (thundered ? 1 : 0)}</span>
          </button>

          <button
            onClick={handleLike}
            className={cn(
              "post-action-btn",
              liked && "text-red-400"
            )}
          >
            <Heart className={cn("w-5 h-5", liked && "fill-red-400")} />
            <span className="text-xs">{(post.hearts_likes || 0) + (liked ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="post-action-btn"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">{post.comments_count || 0}</span>
          </button>

          <button
            onClick={handleRepost}
            className={cn(
              "post-action-btn",
              reposted && "text-emerald-400"
            )}
          >
            <RefreshCcw className={cn("w-5 h-5", reposted && "text-emerald-400")} />
            <span className="text-xs">{(post.reposts_count || 0) + (reposted ? 1 : 0)}</span>
          </button>

          <button className="post-action-btn ml-auto">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <CommentSection postId={post.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(dateString).toLocaleDateString();
}
