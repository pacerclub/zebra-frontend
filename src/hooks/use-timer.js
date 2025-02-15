'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

export function useTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = () => {
    setIsRunning(true);
    setStartTime(new Date().toISOString());
  };

  const stop = async () => {
    setIsRunning(false);
    
    // Save the session
    try {
      await storage.saveSession({
        project_id: selectedProject?.id,
        start_time: startTime,
        duration: time,
        notes: notes || null,
      });

      // Reset the timer
      setTime(0);
      setStartTime(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to save session:', error);
      // You might want to show an error message to the user here
    }
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    setStartTime(null);
    setNotes('');
  };

  return {
    isRunning,
    time,
    start,
    stop,
    reset,
    selectedProject,
    setSelectedProject,
    notes,
    setNotes,
  };
}
