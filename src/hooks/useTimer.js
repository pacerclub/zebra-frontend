import { useState, useEffect } from 'react';
import useStore from '@/lib/store';

export function useTimer() {
  const { isRunning, startTime, lastElapsedTime } = useStore();
  const [elapsedTime, setElapsedTime] = useState(
    isRunning && startTime ? Date.now() - startTime + lastElapsedTime : lastElapsedTime
  );

  useEffect(() => {
    let intervalId;

    if (isRunning && startTime) {
      // Update elapsed time every second
      intervalId = setInterval(() => {
        const currentElapsed = lastElapsedTime + (Date.now() - startTime);
        setElapsedTime(currentElapsed);
      }, 1000);
    } else {
      setElapsedTime(lastElapsedTime);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime, lastElapsedTime]);

  // Format time as HH:MM:SS
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
  };
}
