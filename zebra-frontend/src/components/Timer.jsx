import { useEffect, useState } from 'react';
import useStore from '@/lib/store';
import { Button } from './ui/button';
import ReactConfetti from 'react-confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Timer() {
  const { isRunning, startTime, startTimer, stopTimer, getCurrentProject } = useStore();
  const [display, setDisplay] = useState('00:00:00');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const currentProject = getCurrentProject();

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

  const handleStart = () => {
    if (!currentProject) {
      alert('Please select or create a project first');
      return;
    }
    startTimer();
  };

  const handleStop = () => {
    setShowConfirmDialog(true);
  };

  const confirmStop = () => {
    stopTimer();
    setShowConfirmDialog(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
  };

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl font-mono">{display}</div>
        <Button 
          size="lg"
          variant={isRunning ? "destructive" : "default"}
          onClick={() => {
            if (isRunning) {
              handleStop();
            } else {
              handleStart();
            }
          }}
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Finish Session?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to finish this session? This will stop the timer and save your progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStop}>
                Finish Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
