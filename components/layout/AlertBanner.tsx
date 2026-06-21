"use client";

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useBlueWill } from '../../hooks/useBlueWill';
import { cn } from '../../lib/utils';

export function AlertBanner() {
  const { alerts, removeAlert } = useBlueWill();

  if (alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          aria-live="assertive"
          className={cn(
            "alert-banner",
            alert.type === 'success' && 'success',
            alert.type === 'error' && 'error',
            alert.type === 'info' && 'info'
          )}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {alert.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {alert.type === 'info' && <Info className="w-4 h-4" />}
            <span className="font-medium">{alert.title}</span>
            {alert.message && <span className="opacity-80">- {alert.message}</span>}
          </div>
          <button
            onClick={() => removeAlert(alert.id)}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </>
  );
}
