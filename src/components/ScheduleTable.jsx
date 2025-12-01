import { useState } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@mui/material';

const ScheduleTable = ({ userBatch }) => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const scheduleData = {
    '1A1': {
      MONDAY: [
        { time: '7:00 AM–10:00 AM', subject: 'IT 105', fullName: 'Computer Programming 2', room: 'Building B Room 204', instructor: 'Prof. Sansano' },
        { time: '10:00 AM–1:00 PM', subject: 'IT 106', fullName: 'Platform Technologies', room: 'Building B Room 304', instructor: 'Prof. Flores' },
      ],
      TUESDAY: [
        { time: '7:00 AM–10:00 AM', subject: 'IT 107', fullName: 'Human-Computer Interaction', room: 'Building B Room 205', instructor: 'Prof. Hernandez' },
        { time: '10:00 AM–1:00 PM', subject: 'IT 104', fullName: 'Discrete Mathematics', room: 'Building E Room 202', instructor: 'Prof. Cagampan' },
        { time: '1:00 PM–2:30 PM', subject: 'UTS 101', fullName: 'Understanding the Self', room: 'Building C SH3', instructor: 'Prof. Verde' },
      ],
      WEDNESDAY: [
        { time: '8:00 AM–10:00 AM', subject: 'IT 105', fullName: 'Computer Programming 2', room: 'Online(Changeable)', instructor: 'Prof. Sansano'},
        { time: '11:00 AM–1:00 PM', subject: 'IT 107', fullName: 'HCI', room: '', instructor: 'Prof. Hernandez' },
        { time: '1:00 PM–2:30 PM', subject: 'PAL 101', fullName: 'Panitikan at Lipunan', room: 'Building C SH1', instructor: 'Prof. Benito' },
        { time: '2:30 PM–4:00 PM', subject: 'UTS 101', fullName: 'Understanding the Self', room: 'Building C SH3', instructor: 'Prof. Verde' },
      ],
      THURSDAY: [],
      FRIDAY: [
        { time: '11:00 AM–1:00 PM', subject: 'IT 106', fullName: 'Platform Technologies', room: 'Online', instructor: 'Prof. Flores'},
        { time: '2:00 PM–4:00 PM', subject: 'PAL 101', fullName: 'Panitikan at Lipunan', room: 'PhilChi Bldg.', instructor: 'Prof. Benito' },
      ],
      SATURDAY: [
        { time: '7:00 AM–10:00 AM', subject: 'NSTP II', fullName: 'NSTP II', room: 'Building C Room 308', instructor: 'Prof. Bombaes' },
        { time: '10:00 AM–12:00 PM', subject: 'PE II', fullName: 'PATHFit 2', room: 'Activity Center 1', instructor: 'Prof. Mabato' },
      ],
    },
    '1A2': {
      MONDAY: [],
      TUESDAY: [
        { time: '10:00 AM–1:00 PM', subject: 'IT 104', fullName: 'Discrete Mathematics', room: 'Building E Room 202', instructor: 'Prof. Cagampan' },
        { time: '1:00 PM–2:30 PM', subject: 'UTS 101', fullName: 'Understanding the Self', room: 'Building C SH3', instructor: 'Prof. Verde' },
      ],
      WEDNESDAY: [
        { time: '8:00 AM–10:00 AM', subject: 'IT 105', fullName: 'Programming 2', room: '', instructor: 'Prof. Sansano' },
        { time: '11:00 AM–1:00 PM', subject: 'IT 107', fullName: 'Human-Computer Interaction', room: '', instructor: 'Prof. Hernandez' },
        { time: '1:00 PM–2:30 PM', subject: 'PAL 101', fullName: 'Panitikan at Lipunan', room: 'Building C SH1', instructor: 'Prof. Benito' },
        { time: '2:30 PM–4:00 PM', subject: 'UTS 101', fullName: 'Understanding the Self', room: 'Building C SH3', instructor: 'Prof. Verde' },
      ],
      THURSDAY: [
        { time: '8:30 AM–10:00 AM', subject: 'IT 105', fullName: 'Programming 2', room: 'Building B Room 204', instructor: 'Prof. Sansano' },
        { time: '11:00 AM–1:00 PM', subject: 'IT 106', fullName: 'Platform Technologies', room: 'Building B Room 304', instructor: 'Prof. Flores' },
      ],
      FRIDAY: [

        { time: '7:00 AM–10:00 PM', subject: 'IT 107', fullName: 'Human-Computer Interaction', room: 'Building B Room 205', instructor: 'Prof. Hernandez' },
        { time: '11:00 AM–1:00 PM', subject: 'IT 106', fullName: 'Platform Technologies, Online', room: 'Online(Changeable)', instructor: 'Prof. Flores', online: true },
        { time: '2:00 PM–4:00 PM', subject: 'PAL 101', fullName: 'Panitikan at Lipunan', room: 'PhilChi Bldg.', instructor: 'Prof. Benito' },
      ],
      SATURDAY: [
        { time: '7:00 AM–10:00 AM', subject: 'NSTP II', fullName: 'NSTP II', room: 'Building C Room 308', instructor: 'Prof. Bombaes' },
        { time: '10:00 AM–12:00 PM', subject: 'PE II', fullName: 'PATHFit 2', room: 'Activity Center 1', instructor: 'Prof. Mabato' },
      ],
    },
  };

  const schedule = scheduleData[userBatch] || scheduleData['1A1'];
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Flatten all classes into a single array with day information
  const allClasses = days.flatMap(day =>
    schedule[day].map(classItem => ({ ...classItem, day }))
  );

  // Display only 5 classes if not showing full schedule
  const displayedClasses = showFullSchedule ? allClasses : allClasses.slice(0, 5);

  // Group displayed classes back by day
  const displayedSchedule = {};
  displayedClasses.forEach(classItem => {
    if (!displayedSchedule[classItem.day]) {
      displayedSchedule[classItem.day] = [];
    }
    displayedSchedule[classItem.day].push(classItem);
  });

  const displayedDays = showFullSchedule ? days : days.filter(day => displayedSchedule[day]);

  const getSubjectColor = (subject) => {
    if (subject.startsWith('IT')) return 'from-blue-600/20 via-blue-600/15 to-blue-600/20 border-blue-500/40';
    if (subject.includes('PAL')) return 'from-purple-600/20 via-purple-600/15 to-purple-600/20 border-purple-500/40';
    if (subject.includes('UTS')) return 'from-emerald-600/20 via-emerald-600/15 to-emerald-600/20 border-emerald-500/40';
    if (subject.includes('NSTP')) return 'from-amber-600/20 via-amber-600/15 to-amber-600/20 border-amber-500/40';
    if (subject.includes('PE')) return 'from-rose-600/20 via-rose-600/15 to-rose-600/20 border-rose-500/40';
    return 'from-slate-600/20 via-slate-600/15 to-slate-600/20 border-slate-500/40';
  };

  const getSubjectTextColor = (subject) => {
    if (subject.startsWith('IT')) return 'text-blue-400';
    if (subject.includes('PAL')) return 'text-purple-400';
    if (subject.includes('UTS')) return 'text-emerald-400';
    if (subject.includes('NSTP')) return 'text-amber-400';
    if (subject.includes('PE')) return 'text-rose-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-sky-400" />
          <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
            Class Schedule — {userBatch}
          </h3>
        </div>
        {allClasses.length > 5 && (
          <Button
            size="small"
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            sx={{
              color: 'var(--color-primary)',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {showFullSchedule ? 'Show Less' : `View Full Schedule (${allClasses.length})`}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayedDays.map((day) => {
          const classes = showFullSchedule ? schedule[day] : (displayedSchedule[day] || []);

          return (
            <div
              key={day}
              className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-xl p-4 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`px-3 py-1 rounded-lg font-bold ${
                  classes.length === 0
                    ? 'dark:bg-slate-700/50 light:!bg-blue-700 dark:text-slate-400 light:!text-white'
                    : 'dark:bg-sky-500/20 light:!bg-blue-700 dark:text-sky-400 light:!text-white'
                }`}>
                  {day}
                </div>
                {classes.length === 0 && (
                  <span className="text-sm dark:text-dark-text-muted light:!text-white/80 italic">
                    No classes
                  </span>
                )}
              </div>

              {classes.length > 0 && (
                <div className="space-y-3">
                  {classes.map((classItem, idx) => (
                    <div
                      key={idx}
                      className={`bg-gradient-to-br ${getSubjectColor(classItem.subject)} border-2 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-sm ${getSubjectTextColor(classItem.subject)} light:!text-white`}>
                              {classItem.subject}
                            </span>
                            {classItem.online && (
                              <span className="text-xs px-2 py-0.5 rounded-full dark:bg-sky-500/20 light:!bg-blue-700 dark:text-sky-400 light:!text-white border dark:border-sky-500/30 light:!border-blue-500">
                                Online
                              </span>
                            )}
                          </div>
                          <p className="text-xs dark:text-dark-text-muted light:!text-white/90 mb-2">
                            {classItem.fullName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs dark:text-dark-text-muted light:!text-white/90">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{classItem.time}</span>
                        </div>
                        {classItem.room && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{classItem.room}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleTable;
