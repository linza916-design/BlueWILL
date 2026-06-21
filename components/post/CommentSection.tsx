"use client";

import { useState, useEffect } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase, Comment, Profile } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setComments(data as Comment[]);
      // Load profiles
      const authorIds = Array.from(new Set(data.map((c) => c.author_id)));
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds);

      if (profileData) {
        const profileMap: Record<string, Profile> = {};
        profileData.forEach((p) => {
          profileMap[p.id] = p as Profile;
        });
        setProfiles(profileMap);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    const { error } = await supabase.from('comments').insert([{
      post_id: postId,
      author_id: user.id,
      comment_text: newComment,
    }]);

    if (error) {
      addAlert({ type: 'error', title: 'Failed to comment', message: error.message });
    } else {
      setNewComment('');
      loadComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Avatar className="w-8 h-8 border border-cyan-500/30">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white text-xs">
              {profile?.full_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Reply..."
            className="bg-navy-800/50 border-white/10 text-sm"
          />
          <Button type="submit" size="icon" disabled={submitting || !newComment.trim()} className="btn-3d-cyan p-2">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 rounded-full skeleton" />
              <div className="flex-1 space-y-1">
                <div className="w-24 h-3 skeleton" />
                <div className="w-full h-4 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-white/50 text-sm text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const author = profiles[comment.author_id];
            return (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="w-8 h-8 border border-white/10">
                  <AvatarImage src={author?.avatar_url} />
                  <AvatarFallback className="bg-navy-700 text-white text-xs">
                    {author?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">
                      {author?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-white/50">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">{comment.comment_text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="text-xs text-white/50 hover:text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{comment.thunder_boosts || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
