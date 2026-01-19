/**
 * CodeLock State Hook
 * React state management with persistence + time tracking
 */

import { useState, useCallback, useEffect } from 'react';
import {
  AppState,
  SessionPhase,
  LockMode,
  createDefaultState,
  calculateBreakFrequency,
  calculateTotalBreaks,
  calculateBurnoutLevel,
  canUseEmergencyOverride,
  getTodayKey,
} from '@/lib/state';

const STORAGE_KEY = 'codelock-state';

/* =======================
   STORAGE HELPERS
======================= */

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...createDefaultState(),
        stats: {
          ...createDefaultState().stats,
          ...parsed.stats,
        },
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return createDefaultState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ stats: state.stats })
    );
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

/* =======================
   MAIN HOOK
======================= */

export function useCodeLockState() {
  const [state, setState] = useState<AppState>(loadState);

  /* =======================
     PERSIST STATS
  ======================= */

  useEffect(() => {
    saveState(state);
  }, [state.stats]);

  /* =======================
     START SESSION
  ======================= */

  const startSession = useCallback(
    (durationMinutes: number, deadline: Date | null) => {
      const breakFrequency = calculateBreakFrequency(durationMinutes);
      const totalBreaks = calculateTotalBreaks(
        durationMinutes,
        breakFrequency
      );

      setState(prev => ({
        ...prev,
        config: {
          totalDuration: durationMinutes,
          deadline,
          breakFrequency,
          breakDuration: 180,
        },
        session: {
          phase: 'working',
          startTime: new Date(),
          elapsedTime: 0,
          currentBreakNumber: 0,
          totalBreaks,
          nextBreakIn: breakFrequency * 60,
          warningCountdown: 60,
          lockCountdown: 180,
          lockMode: 'idle',
        },
      }));
    },
    []
  );

  /* =======================
     TICK (CORE LOGIC)
  ======================= */

  const tick = useCallback(() => {
    setState(prev => {
      const { session, stats } = prev;

      if (session.phase === 'idle' || session.phase === 'break-complete') {
        return prev;
      }

      const isWorking = session.phase === 'working';
      const today = getTodayKey();
      const isNewDay = stats.lastWorkDate !== today;

      /* ---- TIME TRACKING ---- */
      const updatedStats = {
        ...stats,
        lastWorkDate: today,
        todayWorkSeconds: isWorking
          ? isNewDay
            ? 1
            : stats.todayWorkSeconds + 1
          : stats.todayWorkSeconds,
        totalWorkSeconds: isWorking
          ? stats.totalWorkSeconds + 1
          : stats.totalWorkSeconds,
      };

      /* ---- SESSION TIMERS ---- */
      const newElapsed = session.elapsedTime + 1;
      let newNextBreakIn = session.nextBreakIn - 1;
      let newPhase: SessionPhase = session.phase;
      let newWarningCountdown = session.warningCountdown;
      let newLockCountdown = session.lockCountdown;

      if (newNextBreakIn === 60 && session.phase === 'working') {
        newPhase = 'warning';
        newWarningCountdown = 60;
      }

      if (session.phase === 'warning') {
        newWarningCountdown -= 1;
        if (newWarningCountdown <= 0) {
          newPhase = 'locked';
          newLockCountdown = prev.config.breakDuration;
        }
      }

      if (session.phase === 'locked') {
        newLockCountdown -= 1;
        if (newLockCountdown <= 0) {
          newPhase = 'break-complete';
        }
      }

      return {
        ...prev,
        session: {
          ...session,
          elapsedTime: newElapsed,
          nextBreakIn: Math.max(0, newNextBreakIn),
          phase: newPhase,
          warningCountdown: newWarningCountdown,
          lockCountdown: newLockCountdown,
        },
        stats: updatedStats,
      };
    });
  }, []);

  /* =======================
     LOCK / WARNING ACTIONS
  ======================= */

  const triggerWarning = useCallback(() => {
    setState(prev => ({
      ...prev,
      session: {
        ...prev.session,
        phase: 'warning',
        warningCountdown: 60,
      },
    }));
  }, []);

  const triggerLockdown = useCallback(() => {
    setState(prev => ({
      ...prev,
      session: {
        ...prev.session,
        phase: 'locked',
        lockCountdown: prev.config.breakDuration,
        lockMode: 'idle',
      },
    }));
  }, []);

  const setLockMode = useCallback((mode: LockMode) => {
    setState(prev => ({
      ...prev,
      session: {
        ...prev.session,
        lockMode: mode,
      },
    }));
  }, []);

  /* =======================
     COMPLETE BREAK
  ======================= */

  const completeBreak = useCallback(() => {
    setState(prev => {
      const newStats = {
        ...prev.stats,
        breakStreak: prev.stats.breakStreak + 1,
        totalBreaksTaken: prev.stats.totalBreaksTaken + 1,
        healthScore: Math.min(100, prev.stats.healthScore + 5),
      };

      return {
        ...prev,
        session: {
          ...prev.session,
          phase: 'working',
          currentBreakNumber: prev.session.currentBreakNumber + 1,
          nextBreakIn: prev.config.breakFrequency * 60,
          warningCountdown: 60,
          lockCountdown: prev.config.breakDuration,
          lockMode: 'idle',
        },
        stats: {
          ...newStats,
          burnoutLevel: calculateBurnoutLevel(newStats),
        },
      };
    });
  }, []);

  /* =======================
     EMERGENCY OVERRIDE
  ======================= */

  const useEmergencyOverride = useCallback(() => {
    setState(prev => {
      if (!canUseEmergencyOverride(prev.stats.lastOverrideDate)) {
        return prev;
      }

      const newStats = {
        ...prev.stats,
        emergencyOverridesUsed: prev.stats.emergencyOverridesUsed + 1,
        lastOverrideDate: new Date().toDateString(),
        healthScore: Math.max(0, prev.stats.healthScore - 20),
        breakStreak: 0,
      };

      return {
        ...prev,
        session: {
          ...prev.session,
          phase: 'working',
          nextBreakIn: prev.config.breakFrequency * 60,
          warningCountdown: 60,
          lockCountdown: prev.config.breakDuration,
          lockMode: 'idle',
        },
        stats: {
          ...newStats,
          burnoutLevel: calculateBurnoutLevel(newStats),
        },
      };
    });
  }, []);

  /* =======================
     END SESSION
  ======================= */

  const endSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      session: createDefaultState().session,
    }));
  }, []);

  const gameWin = useCallback(() => {
    completeBreak();
  }, [completeBreak]);

  /* =======================
     RETURN API
  ======================= */

  return {
    state,
    actions: {
      startSession,
      tick,
      triggerWarning,
      triggerLockdown,
      setLockMode,
      completeBreak,
      useEmergencyOverride,
      endSession,
      gameWin,
    },
    canOverride: canUseEmergencyOverride(state.stats.lastOverrideDate),
  };
}
