"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Bot, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type DemoMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const DEMO_SUGGESTIONS = [
  'What can I do on BlueWILL?',
  'Help me write a post about my new art series',
  'Find me deals on electronics',
  'Which clubs should I join?',
];

const MAX_DEMO_MESSAGES = 6;

async function callDemoApi(
  message: string,
  history: DemoMessage[]
): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history,
      context: JSON.stringify({
        userProfile: { name: 'Guest', interests: [], location: '' },
        currentPath: '/',
      }),
    }),
  });

  const data = await response.json();

  if (data.success) {
    return data.response;
  }

  throw new Error(data.error || 'AI request failed');
}

export function WillyDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (overrideMessage?: string) => {
    const content = (overrideMessage ?? input).trim();
    if (!content || sending) return;

    if (messages.length >= MAX_DEMO_MESSAGES) {
      setError('Demo limit reached. Sign up to chat with WILLY unlimited!');
      return;
    }

    setInput('');
    setError(null);
    setSending(true);

    const userMessage: DemoMessage = { role: 'user', content };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);

    try {
      const aiResponse = await callDemoApi(content, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setError('WILLY is taking a break. Try again in a moment.');
      setMessages((prev) => prev.slice(0, -1));
    }

    setSending(false);
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const limitReached = messages.length >= MAX_DEMO_MESSAGES;

  return (
    <section id="willy-demo" className="py-20 px-4 bg-navy-950 relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-sunset-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Powered by Gemini AI</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Meet <span className="text-gradient">WILLY</span>, Your AI Co-Pilot
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Try a live demo of WILLY right now. No sign-up required. Ask about discovering content,
            writing posts, finding deals, or navigating BlueWILL.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bw-card overflow-hidden bg-navy-900/80 backdrop-blur-xl border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center animate-pulse-glow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">WILLY</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Live demo
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white/50 hover:text-white"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Messages */}
            <div className="h-[360px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl willy-bg flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h4 className="text-lg font-display font-bold text-white mb-2">
                    Ask WILLY anything
                  </h4>
                  <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
                    Pick a prompt below or type your own question. You get up to {MAX_DEMO_MESSAGES}
                    {' '}messages in this demo.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto">
                    {DEMO_SUGGESTIONS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        disabled={sending}
                        className="p-3 bg-navy-800/50 rounded-xl text-left text-sm text-white/80 hover:bg-navy-800 transition-colors disabled:opacity-50"
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
                    'flex gap-3',
                    msg.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <Avatar
                    className={cn(
                      'w-8 h-8 flex-shrink-0',
                      msg.role === 'assistant' && 'bg-gradient-to-br from-cyan-400 to-navy-600'
                    )}
                  >
                    <AvatarFallback
                      className={msg.role === 'user' ? 'bg-navy-700' : 'bg-transparent'}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-2xl',
                      msg.role === 'user'
                        ? 'bg-cyan-500 text-navy-950'
                        : 'bg-navy-800 text-white'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-cyan-400 to-navy-600">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-navy-800 p-3 rounded-2xl">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center py-3 px-4 bg-sunset-500/10 border border-sunset-500/30 rounded-xl">
                  <p className="text-sm text-sunset-400">{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              {limitReached ? (
                <div className="text-center py-2">
                  <p className="text-white/70 text-sm mb-3">
                    That&apos;s the end of the demo!
                  </p>
                  <Button
                    onClick={() => {
                      document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-3d-sunset w-full"
                  >
                    Sign up to chat with WILLY unlimited
                  </Button>
                </div>
              ) : (
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
                    className="bg-navy-800 border-white/10 text-white placeholder:text-white/40"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    className="btn-3d-cyan"
                    disabled={sending || !input.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
              <p className="text-white/40 text-xs text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Demo conversations aren&apos;t saved. Sign up to keep your chat history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
