import { useState, useEffect, useRef, useCallback } from "react";
import { SECONDS_PER_MINUTE } from "../constants";

export function useStepTimer(waitMinutes: number | undefined) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasTimer = !!waitMinutes && waitMinutes > 0;

  // Reset when waitMinutes changes (step change)
  useEffect(() => {
    setTimerRunning(false);
    setTimerInitialized(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerSeconds(waitMinutes ? waitMinutes * SECONDS_PER_MINUTE : 0);
  }, [waitMinutes]);

  // Countdown
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerSeconds]);

  const timerDone = timerInitialized && timerSeconds === 0 && hasTimer && !timerRunning;

  const toggleTimer = useCallback(() => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
      setTimerInitialized(true);
    }
  }, [timerRunning]);

  const skipTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(0);
  }, []);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  return {
    timerSeconds,
    timerRunning,
    timerInitialized,
    timerDone,
    hasTimer,
    toggleTimer,
    skipTimer,
    formatTime,
  };
}
