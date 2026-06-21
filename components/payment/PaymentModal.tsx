"use client";

import { useState } from 'react';
import { Loader2, CreditCard, Shield, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { initializePayment, SUBSCRIPTION_PRICES, generateTxRef } from '../../lib/payment/flutterwave';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: string;
  billingCycle: 'monthly' | 'annual';
  onSuccess?: () => void;
}

export function PaymentModal({ open, onOpenChange, tier, billingCycle, onSuccess }: PaymentModalProps) {
  const { user, profile } = useAuth();
  const { addAlert } = useBlueWill();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState('');

  const pricing = SUBSCRIPTION_PRICES[tier];
  if (!pricing) return null;

  const amount = billingCycle === 'annual' ? pricing.annual : pricing.monthly;
  const tierName = tier.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const handlePayment = async () => {
    if (!user || !email || !name) {
      addAlert({ type: 'error', title: 'Missing information', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);

    const result = await initializePayment({
      amount,
      email,
      name,
      phone: phone || undefined,
      tx_ref: generateTxRef('sub'),
      redirect_url: typeof window !== 'undefined'
        ? `${window.location.origin}/settings?payment=callback`
        : undefined,
      meta: {
        subscription_tier: tier,
        billing_cycle: billingCycle,
        user_id: user.id,
      },
    });

    setLoading(false);

    if (result.success && result.link) {
      // Redirect to Flutterwave payment page
      window.location.href = result.link;
    } else {
      addAlert({ type: 'error', title: 'Payment failed', message: result.error || 'Could not initialize payment' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-navy-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-center">Subscribe to {tierName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pricing Summary */}
          <div className="bg-navy-800/50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">
              ${amount.toFixed(2)}
            </div>
            <div className="text-white/50 text-sm">
              {billingCycle === 'annual' ? 'per year' : 'per month'}
            </div>
            {billingCycle === 'annual' && (
              <div className="text-emerald-400 text-sm mt-2">
                You save ${(SUBSCRIPTION_PRICES[tier].monthly * 12 - SUBSCRIPTION_PRICES[tier].annual).toFixed(2)}/year
              </div>
            )}
          </div>

          {/* Features included */}
          <div className="bg-cyan-500/10 rounded-xl p-4 space-y-2">
            <p className="text-cyan-400 font-semibold text-sm">Included with this plan:</p>
            <ul className="space-y-1">
              {tier === 'blue_plus' && (
                <>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    100% Ad-free timeline
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Identity Verification access
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Expanded DM limits
                  </li>
                </>
              )}
              {tier === 'creator_pro' && (
                <>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Everything in Blue+
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    5 featured marketplace listings/month
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Create and moderate Clubs
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Paid posts & monetization
                  </li>
                </>
              )}
              {tier === 'business' && (
                <>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Everything in Creator Pro
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Unlimited marketplace listings
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Business tools & analytics
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Payment Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-white/70">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-navy-800 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="bg-navy-800 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Phone (optional)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000 000"
                className="bg-navy-800 border-white/10"
              />
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Shield className="w-4 h-4" />
            <span>Secured by Flutterwave. Your payment info is encrypted.</span>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={loading || !email || !name}
            className="btn-3d-sunset w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>

          <p className="text-xs text-white/40 text-center">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Cancel anytime from Settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
