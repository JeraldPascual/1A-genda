import { useState, useEffect } from 'react';
import { Clock, BookOpen, AlertCircle } from 'lucide-react';

const MidtermCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('upcoming'); // upcoming, ongoing, past

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const examStart = new Date('2026-02-09T00:00:00'); // Midterm start
      const examEnd = new Date('2026-02-14T23:59:59');   // Midterm end

      if (now > examEnd) {
        setStatus('past');
        return;
      }

      if (now >= examStart && now <= examEnd) {
        setStatus('ongoing');
        return;
      }

      // Upcoming
      setStatus('upcoming');
      const difference = examStart - now;
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (status === 'past') return null;

  return (
    <div className={`rounded-xl p-6 shadow-lg border-2 h-full transition-all duration-300 ${
      status === 'ongoing' 
        ? 'glass-card dark:border-amber-500/50 light:!border-orange-500 light:!bg-orange-100' 
        : 'glass-card dark:border-sky-500/30 light:!border-blue-500 light:!bg-blue-600'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${
            status === 'ongoing' 
              ? 'bg-amber-500/20 text-amber-500' 
              : 'bg-sky-500/20 text-sky-400 light:!text-white light:!bg-blue-700'
          }`}>
            {status === 'ongoing' ? <BookOpen className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              status === 'ongoing' 
                ? 'text-amber-500 dark:text-amber-400' 
                : 'dark:text-sky-400 light:!text-white'
            }`}>
              {status === 'ongoing' ? 'Midterm Week in Progress!' : 'Midterm Exam Countdown'}
            </h3>
            <p className="text-sm dark:text-dark-text-muted light:!text-white/80">
              {status === 'ongoing' 
                ? 'Stay focused and do your best. You got this!' 
                : 'Time remaining until midterm exams begin.'}
            </p>
          </div>
        </div>
        
        {status === 'upcoming' && (
          <div className="text-right">
            <div className="text-3xl font-mono font-bold dark:text-white light:!text-white">
              {timeLeft}
            </div>
            <div className="text-xs dark:text-dark-text-muted light:!text-white/60 uppercase tracking-wider">
              Until Starts
            </div>
          </div>
        )}
        
        {status === 'ongoing' && (
          <div className="hidden sm:block">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm font-medium animate-pulse">
              <AlertCircle className="w-4 h-4" />
              Exam Mode Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MidtermCountdown;
