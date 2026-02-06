import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const MidtermSchedule = () => {
  const exams = [
    {
      id: 1,
      day: 'Friday',
      date: 'Feb 13',
      time: '2:30 PM - 4:00 PM',
      subject: 'Panitikan at Lipunan',
      room: 'Physics Lab',
      confirmed: true
    }
  ];

  return (
    <div className="glass-card dark:border-sky-500/30 light:!border-blue-500 light:!bg-blue-600 rounded-xl p-6 shadow-lg border-2 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 light:!text-white light:!bg-blue-700">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-sky-400 light:!text-white">
            Midterm Schedule
          </h3>
          <p className="text-xs dark:text-dark-text-muted light:!text-white/80">
            Confirmed examination dates
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam.id}
              className={`p-3 rounded-lg border transition-all ${
                exam.confirmed
                  ? 'bg-sky-500/5 border-sky-500/20 dark:hover:bg-sky-500/10 light:bg-blue-700/50 light:border-blue-400'
                  : 'bg-slate-500/5 border-slate-500/20 border-dashed'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold ${exam.confirmed ? 'dark:text-sky-300 light:!text-white' : 'text-slate-400'}`}>
                  {exam.subject}
                </span>
                {!exam.confirmed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400 uppercase tracking-wide">
                    TBA
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs dark:text-slate-400 light:!text-white/90">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span>{exam.day}, {exam.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <span>{exam.time}</span>
                </div>
                {exam.room && (
                  <div className="col-span-2 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 opacity-70" />
                    <span>{exam.room}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">No confirmed schedules yet.</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t dark:border-slate-700/50 light:border-white/20">
          <div className="flex items-start gap-2 text-xs dark:text-slate-500 light:!text-white/70">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>
              Check specific subject announcements for changes. Schedule is subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidtermSchedule;
