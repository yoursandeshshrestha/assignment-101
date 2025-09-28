import { useEffect, useRef, useState } from "react";

interface UseTimerOptions {
  initialTime?: number;
  interval?: number;
  onTick?: (time: number) => void;
}

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

/**
 * Custom hook for timer management with consistent cleanup
 */
export const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
  const { initialTime = 0, interval = 1000, onTick } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          onTick?.(newTime);
          return newTime;
        });
      }, interval);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, interval, onTick]);

  const start = () => {
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const setTimeValue = (newTime: number) => {
    setTime(newTime);
  };

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    setTime: setTimeValue,
  };
};
