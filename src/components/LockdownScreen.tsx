/**
 * Lockdown Screen Component
 * Fullscreen break enforcement with mode selection
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Moon, Gamepad2, CloudRain, Timer } from 'lucide-react';
import { LockMode, getRandomMessage, LOCKDOWN_MESSAGES, BREAK_MESSAGES } from '@/lib/state';
import { IdleMode } from './lockdown/IdleMode';
import { GameMode } from './lockdown/GameMode';
import { RelaxMode } from './lockdown/RelaxMode';

interface LockdownScreenProps {
  countdown: number;
  mode: LockMode;
  onSetMode: (mode: LockMode) => void;
  onComplete: () => void;
  onGameWin: () => void;
}

export function LockdownScreen({ 
  countdown, 
  mode, 
  onSetMode, 
  onComplete,
  onGameWin 
}: LockdownScreenProps) {
  const [lockMessage] = useState(() => getRandomMessage(LOCKDOWN_MESSAGES));
  const [breakMessage] = useState(() => getRandomMessage(BREAK_MESSAGES));

  // Auto-complete when countdown reaches 0
  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
    }
  }, [countdown, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] lockdown-overlay flex flex-col animate-fade-in overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 border-b border-destructive/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/20 pulse-danger">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-bold text-destructive">{lockMessage}</p>
            <p className="text-sm text-muted-foreground">{breakMessage}</p>
          </div>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-destructive/20 border border-destructive/30">
          <Timer className="w-5 h-5 text-destructive" />
          <span className="text-4xl font-mono font-bold text-destructive">
            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Mode Selection or Active Mode */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Show mode selection only at the start when idle and countdown > 10 */}
        {mode === 'idle' && countdown > 10 ? (
          <div className="space-y-8 text-center animate-scale-in">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Choose Your Break Mode</h2>
              <p className="text-muted-foreground">Pick how you want to spend your mandatory rest</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              {/* Idle Mode */}
              <Button
                variant="lockMode"
                className="h-auto p-8 flex flex-col gap-4 hover:border-primary"
                onClick={() => onSetMode('idle')}
              >
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Moon className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">💤 Idle Mode</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Just wait. Watch the timer. Breathe.
                  </p>
                </div>
              </Button>

              {/* Game Mode */}
              <Button
                variant="lockMode"
                className="h-auto p-8 flex flex-col gap-4 hover:border-success"
                onClick={() => onSetMode('game')}
              >
                <div className="p-4 rounded-2xl bg-success/10">
                  <Gamepad2 className="w-10 h-10 text-success" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">🎮 Mini-Game</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Win to unlock early. Lose = restart.
                  </p>
                </div>
              </Button>

              {/* Relax Mode */}
              <Button
                variant="lockMode"
                className="h-auto p-8 flex flex-col gap-4 hover:border-accent"
                onClick={() => onSetMode('relax')}
              >
                <div className="p-4 rounded-2xl bg-accent/10">
                  <CloudRain className="w-10 h-10 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">🌧️ Relax Mode</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ambient sounds. Breathing exercise.
                  </p>
                </div>
              </Button>
            </div>

            {/* Staying Idle */}
            <p className="text-sm text-muted-foreground animate-pulse">
              Not choosing? You'll stay in idle mode.
            </p>
          </div>
        ) : mode === 'game' ? (
          <GameMode onWin={onGameWin} />
        ) : mode === 'relax' ? (
          <RelaxMode countdown={countdown} />
        ) : (
          <IdleMode countdown={countdown} />
        )}
      </div>

      {/* Bottom Message */}
      <div className="p-6 border-t border-destructive/30 text-center">
        <p className="text-muted-foreground text-sm">
          🔒 Screen locked until timer ends or game is won
        </p>
      </div>
    </div>
  );
}
