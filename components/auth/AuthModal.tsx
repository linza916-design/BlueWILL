"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth();
  const { addAlert } = useBlueWill();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        addAlert({ type: 'error', title: 'Registration Failed', message: error.message });
      } else {
        addAlert({ type: 'success', title: 'Account Created!', message: 'Welcome to BlueWILL! Complete your profile to get started.' });
        onOpenChange(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        addAlert({ type: 'error', title: 'Login Failed', message: error.message });
      } else {
        addAlert({ type: 'success', title: 'Welcome back!', message: 'Redirecting...' });
        onOpenChange(false);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-navy-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">
            {mode === 'signup' ? 'Join BlueWILL' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 p-1 bg-navy-800 rounded-lg mb-6">
          <button
            onClick={() => setMode('signup')}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
              mode === 'signup' ? "bg-cyan-500 text-navy-950" : "text-white/70 hover:text-white"
            )}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('login')}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-colors",
              mode === 'login' ? "bg-cyan-500 text-navy-950" : "text-white/70 hover:text-white"
            )}
          >
            Log In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-white/70">Full Name</Label>
              <Input
                id="fullname"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-navy-800 border-white/10 text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-navy-800 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="bg-navy-800 border-white/10 text-white"
            />
          </div>

          <Button
            type="submit"
            className={cn("w-full", mode === 'signup' ? "btn-3d-sunset" : "btn-3d-cyan")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signup' ? (
              'Create Account'
            ) : (
              'Log In'
            )}
          </Button>
        </form>

        <p className="text-xs text-white/50 text-center">
          By continuing, you agree to our{' '}
          <span className="text-cyan-400 cursor-pointer hover:underline">Terms</span> and{' '}
          <span className="text-cyan-400 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
