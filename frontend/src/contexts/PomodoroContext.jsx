import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useToolbar } from './ToolbarContext';
import { TOOL_TABS } from '../components/tools/ToolUtils';

const PomodoroContext = createContext();

export const usePomodoro = () => useContext(PomodoroContext);

export const PomodoroProvider = ({ children }) => {
  const { openToolbarToTab } = useToolbar();
  const workDuration = 25 * 60;
  const breakDuration = 5 * 60;

  const [time, setTime] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsBreak(false);
    setTime(workDuration);
  }, [workDuration]);

  useEffect(() => {
    let interval = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      if (isBreak) {
        toast.info('Break is over! Time to get back to work.', {
          onClick: () => openToolbarToTab(TOOL_TABS.POMODORO),
        });
        setIsBreak(false);
        setTime(workDuration);
      } else {
        toast.success('Great job! Time for a break.', {
          onClick: () => openToolbarToTab(TOOL_TABS.POMODORO),
        });
        setIsBreak(true);
        setTime(breakDuration);
      }
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak, workDuration, breakDuration, openToolbarToTab]);

  const value = {
    time,
    isActive,
    isBreak,
    toggleTimer,
    resetTimer,
    workDuration,
    breakDuration,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
};
