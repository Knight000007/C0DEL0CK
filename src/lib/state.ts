/**
 * Central State Management for CodeLock
 * Single source of truth for all application state
 */

export type SessionPhase =
  | 'idle'
  | 'working'
  | 'warning'
  | 'locked'
  | 'break-complete';

export type LockMode = 'idle' | 'game' | 'relax';
export type BurnoutLevel = 'low' | 'medium' | 'high';

/* =======================
   SESSION CONFIG
======================= */

export interface SessionConfig {
  totalDuration: number; // minutes
  deadline: Date | null;
  breakFrequency: number; // minutes
  breakDuration: number; // seconds (min 180s)
}

/* =======================
   SESSION STATE
======================= */

export interface SessionState {
  phase: SessionPhase;
  startTime: Date | null;
  elapsedTime: number; // seconds (current session)
  currentBreakNumber: number;
  totalBreaks: number;
  nextBreakIn: number; // seconds
  warningCountdown: number; // seconds
  lockCountdown: number; // seconds
  lockMode: LockMode;
}

/* =======================
   USER STATS (PERSISTENT)
======================= */

export interface UserStats {
  breakStreak: number;
  totalBreaksTaken: number;
  emergencyOverridesUsed: number;
  lastOverrideDate: string | null;

  /** Health */
  healthScore: number; // 0–100
  burnoutLevel: BurnoutLevel;

  /** ⏱️ TIME TRACKING */
  totalWorkSeconds: number; // lifetime
  todayWorkSeconds: number; // resets daily
  lastWorkDate: string | null; // YYYY-MM-DD
}

/* =======================
   APP STATE
======================= */

export interface AppState {
  config: SessionConfig;
  session: SessionState;
  stats: UserStats;
}

/* =======================
   MESSAGES
======================= */

export const BREAK_MESSAGES = [
  "Your code can wait. Your wrists cannot.",
  "Even React needs to re-render. So do you.",
  "Debugging your health is not optional.",
  "Your future self is thanking you right now.",
  "Coffee break? More like code break.",
  "Rest is not lazy. It's strategic.",
  "Your keyboard will still be there. Promise.",
  "Burnout is a bug. This is the hotfix.",
  "Step away. The semicolons will survive.",
  "Your brain needs garbage collection too.",
];

export const WARNING_MESSAGES = [
  "⚠️ Break incoming in 60 seconds...",
  "🔔 Heads up! Break time approaching...",
  "⏰ 60 seconds until mandatory rest...",
  "🧠 Your brain requested a break...",
];

export const LOCKDOWN_MESSAGES = [
  "🔒 LOCKDOWN ACTIVE - Time to rest",
  "🛑 Screen locked. Health unlocked.",
  "⛔ No escape. Only rest.",
];

/* =======================
   DEFAULT STATE FACTORY
======================= */

export function createDefaultState(): AppState {
  return {
    config: {
      totalDuration: 60,
      deadline: null,
      breakFrequency: 25,
      breakDuration: 180,
    },

    session: {
      phase: 'idle',
      startTime: null,
      elapsedTime: 0,
      currentBreakNumber: 0,
      totalBreaks: 0,
      nextBreakIn: 0,
      warningCountdown: 60,
      lockCountdown: 180,
      lockMode: 'idle',
    },

    stats: {
      breakStreak: 0,
      totalBreaksTaken: 0,
      emergencyOverridesUsed: 0,
      lastOverrideDate: null,

      healthScore: 100,
      burnoutLevel: 'low',

      // ⏱️ Time tracking
      totalWorkSeconds: 0,
      todayWorkSeconds: 0,
      lastWorkDate: null,
    },
  };
}

/* =======================
   BREAK CALCULATIONS
======================= */

export function calculateBreakFrequency(durationMinutes: number): number {
  if (durationMinutes <= 30) return 15;
  if (durationMinutes <= 60) return 20;
  if (durationMinutes <= 120) return 25;
  return 30;
}

export function calculateTotalBreaks(
  durationMinutes: number,
  breakFrequency: number
): number {
  return Math.floor(durationMinutes / breakFrequency);
}

/* =======================
   BURNOUT LOGIC
======================= */

export function calculateBurnoutLevel(stats: UserStats): BurnoutLevel {
  const hoursWorked = stats.todayWorkSeconds / 3600;

  if (stats.healthScore >= 80 && hoursWorked <= 4) return 'low';
  if (stats.healthScore >= 50 || hoursWorked <= 6) return 'medium';
  return 'high';
}

/* =======================
   TIME HELPERS
======================= */

export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/* =======================
   MESSAGE RANDOMIZER
======================= */

let usedMessageIndices: number[] = [];

export function getRandomMessage(messages: string[]): string {
  if (usedMessageIndices.length >= messages.length) {
    usedMessageIndices = [];
  }

  let index: number;
  do {
    index = Math.floor(Math.random() * messages.length);
  } while (usedMessageIndices.includes(index));

  usedMessageIndices.push(index);
  return messages[index];
}

/* =======================
   EMERGENCY OVERRIDE
======================= */

export function canUseEmergencyOverride(
  lastOverrideDate: string | null
): boolean {
  if (!lastOverrideDate) return true;
  return lastOverrideDate !== new Date().toDateString();
}
