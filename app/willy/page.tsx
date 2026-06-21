"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { chatWithWilly, SUGGESTED_PROMPTS, type ChatMessage } from '../../lib/ai/gemini';
import { AppShell } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

export default function WillyPage() {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadMessages();
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('willy_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      const loadedMessages: ChatMessage[] = data.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
      setMessages(loadedMessages);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !user || sending) return;

    const userMessage = input;
    setInput('');
    setSending(true);

    // Add user message optimistically
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Save user message
    await supabase
      .from('willy_conversations')
      .insert([{
        user_id: user.id,
        role: 'user',
        content: userMessage,
      }]);

    try {
      // Get AI response using Gemini
      const aiResponse = await chatWithWilly(
        userMessage,
        messages,
        {
          userProfile: profile ? {
            name: profile.full_name,
            interests: profile.interests || [],
            location: profile.location_text || '',
          } : undefined,
        }
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);

      // Save AI response
      await supabase
        .from('willy_conversations')
        .insert([{
          user_id: user.id,
          role: 'assistant',
          content: aiResponse,
        }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again!"
      }]);
    }

    setSending(false);
  };

  const handleClear = async () => {
    if (!user) return;
    await supabase.from('willy_conversations').delete().eq('user_id', user.id);
    setMessages([]);
    addAlert({ type: 'success', title: 'Conversation cleared', message: '' });
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

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
      <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center animate-pulse-glow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">WILLY</h1>
                <p className="text-xs text-white/50">Powered by Gemini AI</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-white/50">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl willy-bg flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">Hey there! I&apos;m WILLY.</h2>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                I can help you discover content, find marketplace deals, write posts, and navigate BlueWILL.
              </p>

              <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto">
                {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="p-3 bg-navy-800/50 rounded-xl text-left text-sm text-white/80 hover:bg-navy-800 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3",
                msg.role === 'user' && "flex-row-reverse"
              )}
            >
              <Avatar className={cn(
                "w-8 h-8",
                msg.role === 'assistant' && "bg-gradient-to-br from-cyan-400 to-navy-600"
              )}>
                <AvatarFallback className={msg.role === 'user' ? "bg-navy-700" : "bg-transparent"}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl",
                msg.role === 'user'
                  ? "bg-cyan-500 text-navy-950"
                  : "bg-navy-800 text-white"
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-navy-600">
                <AvatarFallback className="bg-transparent">
                  <Bot className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-navy-800 p-3 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask WILLY anything..."
              className="bg-navy-800 border-white/10"
              disabled={sending}
            />
            <Button type="submit" className="btn-3d-cyan" disabled={sending || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
