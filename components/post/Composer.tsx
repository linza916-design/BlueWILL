"use client";

import { useState, useRef } from 'react';
import { Image, Film, Video, BarChart3, Send, X, Loader2, Sparkles } from 'lucide-react';
const GifIcon = Film;
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const categoryTags = [
  { tag: 'entertainment', label: 'Entertainment' },
  { tag: 'music', label: 'Music' },
  { tag: 'science', label: 'Science' },
  { tag: 'foods', label: 'Food' },
  { tag: 'nature', label: 'Nature' },
  { tag: 'memes', label: 'Memes' },
];

const sampleUnsplash = [
  'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
  'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg',
  'https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg',
  'https://images.pexels.com/photos/nature',
  'https://images.pexels.com/photos/sky',
];

interface ComposerProps {
  onPostCreated?: () => void;
}

export function Composer({ onPostCreated }: ComposerProps) {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isSensitive, setIsSensitive] = useState(false);
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'gif' | 'video' }[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!content && media.length === 0 && !showQuiz) {
      setIsExpanded(false);
    }
  };

  const handleAddMedia = (url: string, type: 'image' | 'gif' | 'video') => {
    if (media.length >= 4) {
      addAlert({ type: 'error', title: 'Maximum 4 media items', message: 'Remove one to add another.' });
      return;
    }
    setMedia([...media, { url, type }]);
    setShowMediaModal(false);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleUpdateQuizOption = (index: number, value: string) => {
    const newOptions = [...quizOptions];
    newOptions[index] = value;
    setQuizOptions(newOptions);
  };

  const canPost = () => {
    if (!content.trim() && media.length === 0) return false;
    if (showQuiz && (!quizQuestion.trim() || quizOptions.filter(o => o.trim()).length < 2)) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!canPost() || !user) return;

    setLoading(true);

    const postPayload = {
      author_id: user.id,
      text_content: content,
      category_tag: category,
      is_sensitive: isSensitive,
      media_vault: media,
      quiz_data: showQuiz ? {
        question: quizQuestion,
        options: quizOptions.filter(o => o.trim()),
        votes: Array(quizOptions.filter(o => o.trim()).length).fill(0)
      } : null,
    };

    const { error } = await supabase.from('posts').insert([postPayload]);

    setLoading(false);

    if (error) {
      addAlert({ type: 'error', title: 'Failed to post', message: error.message });
    } else {
      addAlert({ type: 'success', title: 'Post published!', message: 'Your thought is now live!' });
      setContent('');
      setMedia([]);
      setShowQuiz(false);
      setQuizQuestion('');
      setQuizOptions(['', '', '', '']);
      setCategory('general');
      setIsSensitive(false);
      setIsExpanded(false);
      onPostCreated?.();
    }
  };

  // Auto-detect hashtags
  const detectedHashtags = content.match(/#\w+/g) || [];

  return (
    <div className="bw-card p-4">
      <div className="flex gap-3">
        <Avatar className="w-12 h-12 border-2 border-cyan-500/30">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-navy-600 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            placeholder="What's on your mind today?"
            className={cn(
              "border-0 bg-transparent resize-none text-white placeholder:text-white/50 px-0",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              isExpanded ? "min-h-[80px]" : "min-h-[40px]"
            )}
          />

          {/* Hashtag detection */}
          {detectedHashtags.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {detectedHashtags.map((tag) => (
                <span key={tag} className="text-cyan-400 text-sm">{tag}</span>
              ))}
            </div>
          )}

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {media.map((item, idx) => (
                <div key={idx} className="relative group">
                  {item.type === 'image' || item.type === 'gif' ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-navy-800 rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-navy-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quiz Section */}
          {showQuiz && (
            <div className="bg-navy-800/50 rounded-lg p-4 mb-3 space-y-3">
              <Input
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="bg-navy-800 border-white/10"
              />
              <div className="space-y-2">
                {quizOptions.map((opt, idx) => (
                  <Input
                    key={idx}
                    value={opt}
                    onChange={(e) => handleUpdateQuizOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="bg-navy-800 border-white/10"
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuiz(false)}
                className="text-white/50"
              >
                Remove Quiz
              </Button>
            </div>
          )}

          {/* Category Selection */}
          {isExpanded && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs text-white/50">Category:</span>
              {categoryTags.map((cat) => (
                <button
                  key={cat.tag}
                  onClick={() => setCategory(cat.tag)}
                  className={cn(
                    "category-pill text-xs",
                    category === cat.tag && "active"
                  )}
                >
                  #{cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {isExpanded && (
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-cyan-400"
                  title="Add Image"
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-cyan-400"
                  title="Add GIF"
                >
                  <GifIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-cyan-400"
                  title="Add Video"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    showQuiz ? "bg-cyan-500/20 text-cyan-400" : "text-white/70 hover:text-cyan-400 hover:bg-white/10"
                  )}
                  title="Add Quiz"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>

                {/* Sensitive Toggle */}
                <label className="flex items-center gap-1 ml-4 text-xs text-white/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSensitive}
                    onChange={(e) => setIsSensitive(e.target.checked)}
                    className="rounded"
                  />
                  Sensitive
                </label>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-xs",
                  content.length > 280 ? "text-red-400" : "text-white/50"
                )}>
                  {content.length}/280
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!canPost() || loading}
                  className="btn-3d-sunset text-sm px-4 py-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Search Modal */}
      <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
        <DialogContent className="sm:max-w-2xl bg-navy-900 border-white/10 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Media</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="unsplash">
            <TabsList className="bg-navy-800">
              <TabsTrigger value="unsplash" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                Unsplash
              </TabsTrigger>
              <TabsTrigger value="giphy" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                GIPHY
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unsplash" className="mt-4">
              <Input
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search Unsplash images..."
                className="bg-navy-800 border-white/10 mb-4"
              />
              <div className="grid grid-cols-3 gap-3">
                {sampleUnsplash.slice(0, 6).map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddMedia(url, 'image')}
                    className="aspect-square bg-cover bg-center rounded-lg hover:ring-2 hover:ring-cyan-400 transition-all"
                    style={{ backgroundImage: `url(${url})` }}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="giphy" className="mt-4">
              <Input
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search GIFs..."
                className="bg-navy-800 border-white/10 mb-4"
              />
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square bg-navy-800 rounded-lg flex items-center justify-center">
                  <GifIcon className="w-8 h-8 text-white/30" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center">
                <p className="text-white/50 mb-4">Drag and drop files here, or click to browse</p>
                <Button variant="outline" className="text-cyan-400">
                  Browse Files
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
