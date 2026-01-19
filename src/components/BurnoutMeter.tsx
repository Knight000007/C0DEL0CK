/**
 * Burnout Meter Component
 * Visual indicator of developer burnout risk
 */

import { Card } from '@/components/ui/card';
import { Flame, Thermometer } from 'lucide-react';
import { BurnoutLevel } from '@/lib/state';

interface BurnoutMeterProps {
  level: BurnoutLevel;
  healthScore: number;
}

const levelConfig = {
  low: {
    label: 'Low Risk',
    color: 'text-success',
    bgColor: 'bg-success/20',
    barColor: 'bg-success',
    emoji: '😊',
  },
  medium: {
    label: 'Medium Risk',
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    barColor: 'bg-warning',
    emoji: '😐',
  },
  high: {
    label: 'High Risk',
    color: 'text-destructive',
    bgColor: 'bg-destructive/20',
    barColor: 'bg-destructive',
    emoji: '😰',
  },
};

export function BurnoutMeter({ level, healthScore }: BurnoutMeterProps) {
  const config = levelConfig[level];

  return (
    <Card className="p-4 glass-card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Thermometer className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Burnout Risk</p>
          <p className={`font-semibold ${config.color}`}>
            {config.emoji} {config.label}
          </p>
        </div>
      </div>
      
      {/* Health Score Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Health Score</span>
          <span className="font-mono">{healthScore}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
