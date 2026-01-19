/**
 * CodeLock Main Application
 * Gamified forced-break system for developers
 */

import { useEffect } from "react";
import { useCodeLockState } from "@/hooks/useCodeLockState";
import { SessionSetup } from "@/components/SessionSetup";
import { ActiveSession } from "@/components/ActiveSession";
import { WarningPopup } from "@/components/WarningPopup";
import { LockdownScreen } from "@/components/LockdownScreen";
import { formatSeconds } from "@/lib/state";

const Index = () => {
  const { state, actions, canOverride } = useCodeLockState();
  const { session, config, stats } = state;

  // Global tick interval - runs every second while session is active
  useEffect(() => {
    if (session.phase !== "idle") {
      const interval = setInterval(actions.tick, 1000);
      return () => clearInterval(interval);
    }
  }, [session.phase, actions.tick]);

  // Prevent Escape / Alt+F4 during warning or lockdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (session.phase === "locked" || session.phase === "warning") {
        if (e.key === "Escape" || (e.altKey && e.key === "F4")) {
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [session.phase]);

  // Request fullscreen during lockdown
  useEffect(() => {
    if (session.phase === "locked") {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [session.phase]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* 🔴 DEBUG: Show Today/Total work time */}
      <div className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-md z-50">
        <div>Today: {formatSeconds(stats.todayWorkSeconds)}</div>
        <div>Total: {formatSeconds(stats.totalWorkSeconds)}</div>
      </div>

      {/* Idle Phase: Setup Session */}
      {session.phase === "idle" && (
        <SessionSetup onStart={actions.startSession} stats={stats} />
      )}

      {/* Working Phase: Active Session */}
      {(session.phase === "working" || session.phase === "break-complete") && (
        <ActiveSession
          config={config}
          session={session}
          stats={stats}
          onEnd={actions.endSession}
          onTriggerWarning={actions.triggerWarning}
        />
      )}

      {/* Warning Phase */}
      {session.phase === "warning" && (
        <>
          <ActiveSession
            config={config}
            session={session}
            stats={stats}
            onEnd={actions.endSession}
            onTriggerWarning={actions.triggerWarning}
          />
          <WarningPopup
            countdown={session.warningCountdown}
            onOverride={actions.useEmergencyOverride}
            canOverride={canOverride}
          />
        </>
      )}

      {/* Locked Phase */}
      {session.phase === "locked" && (
        <LockdownScreen
          countdown={session.lockCountdown}
          mode={session.lockMode}
          onSetMode={actions.setLockMode}
          onComplete={actions.completeBreak}
          onGameWin={actions.gameWin}
        />
      )}
    </div>
  );
};

export default Index;
