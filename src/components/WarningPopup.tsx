/**
 * Warning Popup Component
 * 60-second countdown before lockdown
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Coffee, X } from 'lucide-react';
import { getRandomMessage, WARNING_MESSAGES } from '@/lib/state';

interface WarningPopupProps {
  countdown: number;
  onOverride: () => void;
  canOverride: boolean;
}

export function WarningPopup({ countdown, onOverride, canOverride }: WarningPopupProps) {
  const [message] = useState(() => getRandomMessage(WARNING_MESSAGES));
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  // Pulse effect on low countdown
  const isUrgent = countdown <= 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`relative w-full max-w-md p-8 rounded-3xl border-4 transition-all duration-300 ${
          isUrgent 
            ? 'border-destructive bg-destructive/10 pulse-danger' 
            : 'border-warning bg-warning/10 pulse-warning'
        }`}
      >
        {/* Icon */}
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
          isUrgent ? 'bg-destructive/20' : 'bg-warning/20'
        }`}>
          <AlertTriangle className={`w-10 h-10 ${isUrgent ? 'text-destructive' : 'text-warning'} ${isUrgent ? 'animate-bounce' : ''}`} />
        </div>

        {/* Message */}
        <p className="text-center text-xl font-semibold mb-2">
          {message}
        </p>

        {/* Countdown */}
        <div className="text-center space-y-4 mb-8">
          <p className="text-muted-foreground">Break starts in</p>
          <div className={`text-7xl font-mono font-bold ${isUrgent ? 'text-destructive' : 'text-warning'}`}>
            {countdown}
          </div>
          <p className="text-sm text-muted-foreground">seconds</p>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-6">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="352"
              strokeDashoffset={352 - (352 * (60 - countdown)) / 60}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${isUrgent ? 'text-destructive' : 'text-warning'}`}
            />
          </svg>
        </div>

        {/* Coffee Icon Animation */}
        <div className="flex justify-center mb-6">
          <Coffee className="w-8 h-8 text-accent float" />
        </div>

        {/* Emergency Override */}
        {canOverride && !showOverrideConfirm && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowOverrideConfirm(true)}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
            Emergency Skip (1x daily)
          </Button>
        )}

        {showOverrideConfirm && (
          <div className="space-y-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-scale-in">
            <p className="text-sm text-destructive text-center font-medium">
              ⚠️ This will reset your streak and reduce your health score!
            </p>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowOverrideConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onOverride}
                className="flex-1"
              >
                Skip Anyway
              </Button>
            </div>
          </div>
        )}

        {!canOverride && (
          <p className="text-center text-sm text-muted-foreground">
            Emergency override already used today
          </p>
        )}
      </div>
    </div>
  );
}
