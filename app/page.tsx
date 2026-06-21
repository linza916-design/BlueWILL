"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowDown, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBlueWill } from '../hooks/useBlueWill';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AuthModal } from '../components/auth/AuthModal';
import { WillyDemo } from '../components/landing/WillyDemo';

const heroImages = [
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
];

const features = [
  {
    title: 'Social Hub',
    description: 'Connect with communities, share updates, and discover trends in real-time.',
    image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
  },
  {
    title: 'Marketplace',
    description: 'List items instantly, run targeted ads, and safely trade locally or globally.',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg',
  },
  {
    title: 'Verified Identity',
    description: 'Interact with real, secure, identity-verified accounts for trusted trading.',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  },
];

const mockTestimonials = [
  { name: 'Sarah K.', location: 'Kampala', text: 'BlueWILL helped me grow my business 3x in just 6 months!', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
  { name: 'John M.', location: 'Nairobi', text: 'The community here is amazing. Found my tribe!', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
  { name: 'Amina T.', location: 'Lagos', text: 'Finally a platform where I can speak freely and connect authentically.', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
];

function LandingPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth === 'login') {
      setAuthMode('login');
      setAuthModalOpen(true);
    } else if (auth === 'signup') {
      setAuthMode('signup');
      setAuthModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((img, idx) => (
            <div
              key={img}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000",
                idx === currentSlide ? "opacity-30" : "opacity-0"
              )}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/60 to-navy-950" />
        </div>

        {/* Navigation */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-navy-600 flex items-center justify-center">
              <span className="text-xl">🦅</span>
            </div>
            <span className="font-display font-bold text-2xl text-white">
              Blue<span className="text-cyan-400">WILL</span>
            </span>
          </div>
          <Button onClick={scrollToRegister} className="btn-3d-sunset">
            Create Account
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4">
          {/* Compact SoundCloud Player */}
          <div className="fixed bottom-6 left-6 z-50">
            <div className="bg-navy-900/95 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              <iframe
                title="SoundCloud Player"
                width="320"
                height="80"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent('https://soundcloud.com/blisscorporation/eiffel-65-blue-da-ba-dee-1')}&color=%2300c4e8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
              />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight">
            <span className="text-gradient">Connect Freely.</span>
            <br />
            <span>Trade Globally.</span>
            <br />
            <span className="text-gradient-warm">Speak Boldly.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8">
            Welcome to BlueWILL, the hybrid social ecosystem where your voice builds communities
            and your passions fuel real income.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={scrollToRegister} className="btn-3d-sunset text-lg px-8 py-6">
              Get Started Free
            </Button>
            <Link href="#willy-demo">
              <Button variant="ghost" className="btn-3d-ghost text-lg px-8 py-6">
                Try WILLY Demo
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="ghost" className="btn-3d-ghost text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Scroll indicator */}
          <button
            onClick={() => scrollToRegister()}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors animate-bounce"
          >
            <ArrowDown className="w-6 h-6 text-white" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-navy-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">
            The <span className="text-gradient">Hybrid Platform</span> You&apos;ve Been Waiting For
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-12">
            BlueWILL seamlessly merges the best of global social networking with local commerce.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bw-card overflow-hidden group cursor-pointer"
              >
                <div
                  className="h-48 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WILLY AI Live Demo */}
      <WillyDemo />

      {/* Testimonials Marquee */}
      <section className="py-16 overflow-hidden bg-navy-950">
        <h2 className="font-display text-3xl font-bold text-white text-center mb-8">
          Trusted by Thousands
        </h2>
        <div className="marquee-container relative">
          <div className="marquee-inner">
            {[...mockTestimonials, ...mockTestimonials].map((t, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-80 mx-4 p-6 bg-navy-800/50 rounded-2xl border border-white/10"
              >
                <p className="text-white/80 mb-4">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${t.avatar})` }}
                  />
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-white/50 text-sm">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Portal */}
      <section id="register" className="py-20 px-4 bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Join BlueWILL Today
            </h2>
            <p className="text-white/60">
              Start your journey. Connect with the world.
            </p>
          </div>

          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-navy-800 rounded-xl p-1 mb-6">
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-navy-950">
                Log In
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup">
              <RegisterForm />
            </TabsContent>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-navy-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <span className="font-display font-bold text-xl text-white">
              Blue<span className="text-cyan-400">WILL</span>
            </span>
          </div>
          <p className="text-white/50 text-sm">
            © 2026 BlueWILL. Where Ideas Take Flight.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/50 hover:text-white text-sm">Privacy</Link>
            <Link href="/terms" className="text-white/50 hover:text-white text-sm">Terms</Link>
            <Link href="/help" className="text-white/50 hover:text-white text-sm">Help</Link>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authMode}
      />
    </div>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { addAlert } = useBlueWill();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      addAlert({ type: 'error', title: 'Registration Failed', message: error.message });
    } else {
      addAlert({ type: 'success', title: 'Account Created!', message: 'Welcome to BlueWILL!' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        className="bg-navy-800 border-white/10 text-white"
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-navy-800 border-white/10 text-white"
      />
      <Input
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        className="bg-navy-800 border-white/10 text-white"
      />
      <Button type="submit" className="btn-3d-sunset w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
      </Button>
      <p className="text-white/50 text-xs text-center">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { addAlert } = useBlueWill();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      addAlert({ type: 'error', title: 'Login Failed', message: error.message });
    } else {
      addAlert({ type: 'success', title: 'Welcome back!', message: 'Redirecting...' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-navy-800 border-white/10 text-white"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="bg-navy-800 border-white/10 text-white"
      />
      <Button type="submit" className="btn-3d-cyan w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
      </Button>
      <Link href="/forgot-password" className="block text-center text-cyan-400 text-sm hover:underline">
        Forgot password?
      </Link>
    </form>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <LandingPageContent />
    </Suspense>
  );
}
