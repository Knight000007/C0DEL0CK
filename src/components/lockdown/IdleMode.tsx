/**
 * Idle Mode Component
 * Simple countdown with breathing animation
 */

import { Moon } from 'lucide-react';

interface IdleModeProps {
  countdown: number;
}

export function IdleMode({ countdown }: IdleModeProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 animate-fade-in">
      {/* Large Timer */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl breathing" />
        
        {/* Timer circle */}
        <div className="relative w-64 h-64 rounded-full border-4 border-primary/30 flex items-center justify-center bg-background/50 backdrop-blur-xl">
          <div className="text-center">
            <p className="text-7xl font-mono font-bold text-primary">
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
            <p className="text-muted-foreground mt-2">remaining</p>
          </div>
        </div>
      </div>

      {/* Breathing Guide */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 breathing flex items-center justify-center">
          <Moon className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xl text-muted-foreground">
          Breathe slowly. In... and out...
        </p>
      </div>

      {/* Motivational Text */}
      <div className="max-w-md text-center space-y-2">
        <p className="text-2xl font-semibold">Rest is productive.</p>
        <p className="text-muted-foreground">
          Your brain is processing what you just learned. 
          Give it the space it needs.
        </p>
      </div>
    </div>
  );
}
