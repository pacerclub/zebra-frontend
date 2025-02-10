import { useEffect, useState } from 'react';
import useStore from '@/lib/store';
import { Button } from './ui/button';

export default function Timer() {
  const { isRunning, startTime, startTimer, stopTimer } = useStore();
  const [display, setDisplay] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const seconds = Math.floor((elapsed / 1000) % 60);
        const minutes = Math.floor((elapsed / 1000 / 60) % 60);
        const hours = Math.floor(elapsed / 1000 / 60 / 60);

        setDisplay(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-4xl font-mono">{display}</div>
      <Button 
        size="lg"
        variant={isRunning ? "destructive" : "default"}
        onClick={() => {
          if (isRunning) {
            stopTimer();
          } else {
            startTimer();
          }
        }}
      >
        {isRunning ? 'Stop' : 'Start'}
      </Button>
    </div>
  );
}
