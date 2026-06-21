"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Send, Loader2, User, MoreVertical, Clock, CheckCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { AppShell } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

const mockConversations = [
  { id: 'conv1', user: { id: 'u1', full_name: 'Sarah Chen', username: 'sarahcooks', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', presence_state: 'really_active' }, last_message: 'Hey! Is the desk still available?', last_message_time: new Date(Date.now() - 3600000).toISOString(), unread: 2 },
  { id: 'conv2', user: { id: 'u2', full_name: 'John Dev', username: 'johndev', avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', presence_state: 'always_off' }, last_message: 'Thanks for the connection!', last_message_time: new Date(Date.now() - 86400000).toISOString(), unread: 0 },
  { id: 'conv3', user: { id: 'u3', full_name: 'Marketing Pro', username: 'marketingpro', avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', presence_state: 'really_active', is_verified: true }, last_message: 'Check out my new course!', last_message_time: new Date(Date.now() - 172800000).toISOString(), unread: 1 },
];

const mockMessages = [
  { id: 'm1', sender_id: 'u1', text: 'Hey! Is the desk still available?', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', sender_id: 'me', text: 'Yes it is! Are you interested?', time: new Date(Date.now() - 3500000).toISOString() },
  { id: 'm3', sender_id: 'u1', text: 'Definitely! What\'s the best price you can offer?', time: new Date(Date.now() - 3000000).toISOString() },
];

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversation(convId);
    // Load messages for conversation
    setMessages(mockMessages);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    const msg = {
      id: `m${Date.now()}`,
      sender_id: user.id,
      text: newMessage,
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');

    // Simulate response
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessages((prev) => [...prev, {
      id: `mr${Date.now()}`,
      sender_id: 'u1',
      text: "Sounds good! When can we meet?",
      time: new Date().toISOString(),
    }]);
    setSending(false);
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

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <AppShell>
      <div className="h-[calc(100vh-64px)] flex max-w-4xl mx-auto">
        {/* Conversations List */}
        <div className={cn(
          "w-full md:w-80 border-r border-white/10 flex flex-col",
          selectedConversation && "hidden md:flex"
        )}>
          <div className="p-4 border-b border-white/10">
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              Messages
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors",
                  selectedConversation === conv.id && "bg-white/10"
                )}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 border border-white/10">
                    <AvatarImage src={conv.user.avatar_url} />
                    <AvatarFallback>{conv.user.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-navy-900",
                    conv.user.presence_state === 'really_active' ? "bg-emerald-500" : "bg-slate-500"
                  )} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white truncate">{conv.user.full_name}</p>
                    {conv.user.is_verified && <span className="trust-badge text-xs">✓</span>}
                  </div>
                  <p className="text-sm text-white/50 truncate">{conv.last_message}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">{getTimeAgo(conv.last_message_time)}</p>
                  {conv.unread > 0 && (
                    <span className="inline-block mt-1 w-5 h-5 rounded-full bg-cyan-500 text-navy-950 text-xs font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat View */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedConversation && "hidden md:flex"
        )}>
          {selectedConversation && selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                >
                  ←
                </button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConv.user.avatar_url} />
                  <AvatarFallback>{selectedConv.user.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link href={`/profile/${selectedConv.user.username}`} className="font-semibold text-white hover:text-cyan-400">
                    {selectedConv.user.full_name}
                  </Link>
                  <p className="text-xs text-white/50">
                    {selectedConv.user.presence_state === 'really_active' ? '🟢 Active' : '⚫ Offline'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-white/50">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.id || msg.sender_id === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", isMe ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "max-w-[70%] p-3 rounded-2xl",
                        isMe
                          ? "bg-cyan-500 text-navy-950 rounded-br-none"
                          : "bg-navy-800 text-white rounded-bl-none"
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          isMe ? "text-navy-950/60" : "text-white/40"
                        )}>
                          {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-navy-800 border-white/10"
                  />
                  <Button type="submit" className="btn-3d-cyan" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <MessageCircle className="w-16 h-16 text-white/20 mb-4" />
              <h2 className="text-xl font-display font-bold text-white mb-2">Your Messages</h2>
              <p className="text-white/50">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
