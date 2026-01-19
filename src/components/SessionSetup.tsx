/**
 * Session Setup Component
 * Configure work duration and deadline before starting
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Clock, Target, Zap, Shield, Timer } from 'lucide-react';
import { calculateBreakFrequency, calculateTotalBreaks, UserStats } from '@/lib/state';
import { BurnoutMeter } from './BurnoutMeter';
import { StreakCounter } from './StreakCounter';

interface SessionSetupProps {
  onStart: (duration: number, deadline: Date | null) => void;
  stats: UserStats;
}

export function SessionSetup({ onStart, stats }: SessionSetupProps) {
  const [duration, setDuration] = useState(60);
  const [useDeadline, setUseDeadline] = useState(false);
  const [deadlineHours, setDeadlineHours] = useState(2);

  const breakFrequency = calculateBreakFrequency(duration);
  const totalBreaks = calculateTotalBreaks(duration, breakFrequency);

  const handleStart = () => {
    const deadline = useDeadline 
      ? new Date(Date.now() + deadlineHours * 60 * 60 * 1000)
      : null;
    onStart(duration, deadline);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium">CodeLock Active</span>
          </div>
          <h1 className="text-5xl font-bold gradient-text">
            Ready to Code?
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Configure your work session. We'll handle the rest breaks.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <StreakCounter streak={stats.breakStreak} />
          <BurnoutMeter level={stats.burnoutLevel} healthScore={stats.healthScore} />
        </div>

        {/* Main Setup Card */}
        <Card className="p-8 glass-card glow-primary space-y-8">
          {/* Duration Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold">Work Duration</span>
              </div>
              <span className="text-3xl font-mono font-bold text-primary">
                {duration} min
              </span>
            </div>
            <Slider
              value={[duration]}
              onValueChange={(v) => setDuration(v[0])}
              min={15}
              max={240}
              step={15}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>15 min</span>
              <span>4 hours</span>
            </div>
          </div>

          {/* Break Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Break Every</span>
              </div>
              <span className="text-2xl font-mono font-bold">{breakFrequency} min</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Total Breaks</span>
              </div>
              <span className="text-2xl font-mono font-bold">{totalBreaks}</span>
            </div>
          </div>

          {/* Deadline Toggle */}
          <div className="space-y-4">
            <button
              onClick={() => setUseDeadline(!useDeadline)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                useDeadline 
                  ? 'border-warning bg-warning/10' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className={`w-5 h-5 ${useDeadline ? 'text-warning' : 'text-muted-foreground'}`} />
                <span className={useDeadline ? 'text-warning font-semibold' : 'text-muted-foreground'}>
                  Set Deadline
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${
                useDeadline ? 'bg-warning' : 'bg-muted'
              } relative`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${
                  useDeadline ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </div>
            </button>

            {useDeadline && (
              <div className="space-y-3 p-4 rounded-xl bg-warning/5 border border-warning/30 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-warning">Deadline in</span>
                  <span className="text-xl font-mono font-bold text-warning">{deadlineHours}h</span>
                </div>
                <Slider
                  value={[deadlineHours]}
                  onValueChange={(v) => setDeadlineHours(v[0])}
                  min={1}
                  max={8}
                  step={0.5}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Start Button */}
        <Button 
          variant="hero" 
          size="xxl" 
          className="w-full"
          onClick={handleStart}
        >
          <Zap className="w-6 h-6" />
          Start Coding Session
        </Button>

        {/* Footer Message */}
        <p className="text-center text-sm text-muted-foreground">
          Your health is non-negotiable. Breaks will be enforced.
        </p>
      </div>
    </div>
  );
}
