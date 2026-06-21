"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../lib/utils';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      const statusParam = searchParams.get('status');
      const txRef = searchParams.get('tx_ref');
      const transactionId = searchParams.get('transaction_id');

      if (statusParam === 'successful' && transactionId) {
        // In production, verify the transaction server-side
        // For now, assume success

        setStatus('success');

        // Update user subscription based on meta (would be done server-side in production)
        if (user) {
          await refreshProfile();
        }

        // Redirect to settings after 3 seconds
        setTimeout(() => {
          router.push('/settings');
        }, 3000);
      } else {
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams, user, refreshProfile, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-white">Verifying Payment...</h1>
            <p className="text-white/60 mt-2">Please wait while we confirm your transaction</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Payment Successful!</h1>
            <p className="text-white/60 mt-2">Your subscription has been activated</p>
            <p className="text-cyan-400 text-sm mt-4">Redirecting to settings...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Payment Failed</h1>
            <p className="text-white/60 mt-2">Something went wrong with your payment</p>
            <button
              onClick={() => router.push('/settings')}
              className="mt-6 px-6 py-3 btn-3d-cyan rounded-xl font-semibold"
            >
              Back to Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}
