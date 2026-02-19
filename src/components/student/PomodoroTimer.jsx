/**
 * PomodoroTimer component provides a productivity timer for work and break intervals, with notifications and session tracking.
 * Handles timer state, mode switching, and integrates with browser notifications and audio cues.
 *
 * Usage:
 * Use this component in the student dashboard to help students manage their study sessions using the Pomodoro technique.
 *
 * Avoid mutating timer state directly or bypassing the provided timer logic to prevent timing bugs.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Clock, Coffee, Briefcase } from 'lucide-react';

const PomodoroTimer = () => {
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const notificationShownRef = useRef(false);

  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    // Show notification
    if (!notificationShownRef.current) {
      showNotification();
      notificationShownRef.current = true;
    }

    // Switch mode
    if (mode === 'work') {
      setSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('work');
      setTimeLeft(WORK_TIME);
    }

    // Play audio notification
    playNotificationSound();

    // Reset notification flag after a short delay
    setTimeout(() => {
      notificationShownRef.current = false;
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleTimerComplete]);

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work'
          ? '🎉 Work session complete! Time for a break.'
          : '✨ Break is over! Ready to focus?',
        icon: '/favicon.ico',
        tag: 'pomodoro'
      });
    }
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleStart = () => {
    requestNotificationPermission();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(WORK_TIME);
    notificationShownRef.current = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work'
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary flex items-center gap-2">
          <Clock className="w-7 h-7" aria-hidden="true" />
          Pomodoro Timer
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary border dark:border-dark-border light:border-light-border" aria-label={`Completed sessions: ${sessions}`}>
          <Briefcase className="w-4 h-4 dark:text-dark-text-muted light:text-light-text-muted" aria-hidden="true" />
          <span className="text-sm font-semibold dark:text-dark-text-primary light:text-light-text-primary">
            {sessions} sessions
          </span>
        </div>
      </div>

      {/* Timer Card */}
      <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-2xl p-8 border dark:border-dark-border light:border-light-border shadow-lg">
        {/* Mode Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6" aria-label={mode === 'work' ? 'Focus time' : 'Break time'}>
          {mode === 'work' ? (
            <>
              <Briefcase className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span className="text-lg font-semibold text-emerald-400">Focus Time</span>
            </>
          ) : (
            <>
              <Coffee className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <span className="text-lg font-semibold text-amber-400">Break Time</span>
            </>
          )}
        </div>

        {/* Timer Display */}
        <div className="relative">
          {/* Circular Progress */}
          <div className="relative w-64 h-64 mx-auto" aria-label="Pomodoro timer" role="img">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="dark:text-dark-border light:text-light-border"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className={mode === 'work' ? 'text-emerald-400' : 'text-amber-400'}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold dark:text-dark-text-primary light:text-light-text-primary font-mono" aria-live="polite" aria-atomic="true">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm dark:text-dark-text-muted light:text-light-text-muted mt-2">
                  {mode === 'work' ? 'until break' : 'until focus'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              aria-label="Start timer"
            >
              <Play className="w-5 h-5" aria-hidden="true" />
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              aria-label="Pause timer"
            >
              <Pause className="w-5 h-5" aria-hidden="true" />
              Pause
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 dark:bg-dark-bg-secondary light:bg-light-bg-secondary dark:hover:bg-dark-border light:hover:bg-light-border dark:text-dark-text-primary light:text-light-text-primary rounded-lg font-semibold transition-colors border dark:border-dark-border light:border-light-border"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-4 border dark:border-dark-border light:border-light-border">
          <div className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted uppercase tracking-wide mb-1">
            Work Duration
          </div>
          <div className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
            25:00
          </div>
        </div>

        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-4 border dark:border-dark-border light:border-light-border">
          <div className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted uppercase tracking-wide mb-1">
            Break Duration
          </div>
          <div className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
            5:00
          </div>
        </div>

        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-4 border dark:border-dark-border light:border-light-border">
          <div className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted uppercase tracking-wide mb-1">
            Completed Today
          </div>
          <div className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
            {sessions}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
        <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-3">
          Pomodoro Tips
        </h3>
        <ul className="space-y-2 dark:text-dark-text-secondary light:text-light-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Focus on one task during each 25-minute session</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Take your break seriously - step away from your desk</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>After 4 sessions, take a longer break (15-30 minutes)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-1">•</span>
            <span>Enable notifications to stay on track with your schedule</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PomodoroTimer;
