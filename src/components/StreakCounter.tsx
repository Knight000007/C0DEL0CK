/**
 * Streak Counter Component
 * Shows consecutive breaks taken
 */

import { Card } from '@/components/ui/card';
import { Flame, Sparkles } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  const isOnFire = streak >= 5;
  
  return (
    <Card className={`p-4 glass-card ${isOnFire ? 'glow-warning' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOnFire ? 'bg-warning/20' : 'bg-primary/20'}`}>
          {isOnFire ? (
            <Flame className="w-5 h-5 text-warning animate-pulse" />
          ) : (
            <Sparkles className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Break Streak</p>
          <p className={`text-2xl font-bold font-mono ${isOnFire ? 'text-warning' : 'text-primary'}`}>
            {streak}
          </p>
        </div>
        {isOnFire && (
          <span className="ml-auto text-2xl animate-bounce">🔥</span>
        )}
      </div>
    </Card>
  );
}
