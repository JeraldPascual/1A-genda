import { useEffect, useState } from 'react';
import { getClassSettings } from '../../utils/firestore';
import { Calendar, TrendingUp } from 'lucide-react';

const SemesterProgress = () => {
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const classSettings = await getClassSettings();
    if (!classSettings) return;

    setSettings(classSettings);

    const startDate = classSettings.semesterStartDate?.toDate() || new Date();
    const endDate = classSettings.semesterEndDate?.toDate() || new Date();
    const today = new Date();

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    const progressPercent = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);

    setProgress(progressPercent);
    setDaysLeft(Math.max(daysRemaining, 0));
  };

  if (!settings) {
    return null;
  }

  const getProgressColor = () => {
    if (progress < 33) return 'bg-success-500';
    if (progress < 66) return 'bg-amber-500';
    return 'bg-danger-500';
  };

  const getProgressMessage = () => {
    if (progress < 33) return 'Early semester - stay ahead!';
    if (progress < 66) return 'Mid semester - keep pushing!';
    if (progress < 90) return 'Finals approaching - almost there!';
    return 'Final stretch - you got this!';
  };

  return (
    <div className="glass-card dark:bg-transparent! light:!bg-blue-600 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 dark:text-primary-500 light:text-light-text-primary" />
          <div>
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">Semester Progress</h3>
            <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted">{getProgressMessage()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold dark:text-primary-500 light:text-light-text-primary">{Math.round(progress)}%</p>
          <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted flex items-center justify-end gap-1">
            <Calendar className="w-3 h-3" />
            {daysLeft} days left
          </p>
        </div>
      </div>

      <div className="relative w-full h-4 dark:bg-dark-bg-primary light:!bg-blue-700 rounded-full overflow-hidden border dark:border-dark-border light:!border-blue-500">
        <div
          className={`absolute top-0 left-0 h-full ${getProgressColor()} transition-all duration-1000 ease-out rounded-full shadow-lg`}
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      {settings.className && (
        <div className="mt-4 text-center">
          <p className="text-sm dark:text-dark-text-secondary light:text-light-text-muted">
            <span className="font-semibold">{settings.className}</span>
          </p>
        </div>
      )}

      {/* Reference link for academic year important dates/events */}
      <div className="mt-6 text-center">
        <a
          href="https://www.facebook.com/share/p/1CBwBr2ZBP/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs underline dark:text-dark-text-muted light:text-light-text-muted hover:opacity-80"
        >
          See important academic year dates/events (Facebook post)
        </a>
      </div>
    </div>
  );
};

export default SemesterProgress;
