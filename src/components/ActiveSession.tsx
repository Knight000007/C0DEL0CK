/**
 * Active Session Component
 * Main timer display during work phase
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Coffee, Pause, Square, Zap } from 'lucide-react';
import { SessionConfig, SessionState, UserStats } from '@/lib/state';
import { BurnoutMeter } from './BurnoutMeter';
import { StreakCounter } from './StreakCounter';

interface ActiveSessionProps {
  config: SessionConfig;
  session: SessionState;
  stats: UserStats;
  onEnd: () => void;
  onTriggerWarning: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function ActiveSession({ 
  config, 
  session, 
  stats, 
  onEnd,
  onTriggerWarning 
}: ActiveSessionProps) {

  const totalSeconds = config.totalDuration * 60;
  const progress = (session.elapsedTime / totalSeconds) * 100;
  const nextBreakProgress = ((config.breakFrequency * 60 - session.nextBreakIn) / (config.breakFrequency * 60)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-3xl space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <StreakCounter streak={stats.breakStreak} />
          <BurnoutMeter level={stats.burnoutLevel} healthScore={stats.healthScore} />
        </div>

        {/* Main Timer Card */}
        <Card className="p-10 glass-card glow-primary text-center space-y-8">
          {/* Status */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-success font-medium">Coding in Progress</span>
          </div>

          {/* Elapsed Time */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Session Time</p>
            <p className="timer-display text-primary">
              {formatTime(session.elapsedTime)}
            </p>
          </div>

          {/* Session Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Session Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {formatTimeHMS(totalSeconds - session.elapsedTime)} remaining
            </p>
          </div>

          {/* Break Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <Coffee className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Next Break In</span>
              </div>
              <p className="text-3xl font-mono font-bold text-accent">
                {formatTime(session.nextBreakIn)}
              </p>
              <Progress 
                value={nextBreakProgress} 
                className="h-1 mt-3"
              />
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2 justify-center">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Breaks Today</span>
              </div>
              <p className="text-3xl font-mono font-bold">
                {session.currentBreakNumber} / {session.totalBreaks}
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onEnd}
          >
            <Square className="w-4 h-4" />
            End Session
          </Button>
          
          {/* Dev button for testing - trigger warning */}
          <Button 
            variant="warning" 
            size="lg"
            onClick={onTriggerWarning}
          >
            <Pause className="w-4 h-4" />
            Test Break Warning
          </Button>
        </div>

        {/* Motivational Footer */}
        <p className="text-center text-sm text-muted-foreground italic">
          Stay focused. Your breaks are coming. 🧘
        </p>
      </div>
    </div>
  );
}
