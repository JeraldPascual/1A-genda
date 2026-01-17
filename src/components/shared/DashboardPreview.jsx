import { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { Calendar, Megaphone, Send, ChevronRight, Clock, MapPin } from 'lucide-react';
import { getActiveAnnouncements, getContentSubmissionRequests } from '../../utils/firestore';
import { useAuth } from '../../context/AuthContext';

const DashboardPreview = ({ onTabChange }) => {
  const { user, userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const schedulePreview = {
    '1A1': [
      { day: 'MONDAY', time: '7:00 AM', subject: 'IT 105 - Computer Programming 2', room: 'B1-204' },
      { day: 'MONDAY', time: '10:00 AM', subject: 'IT 106 - Platform Technologies', room: 'Room 304' },
      { day: 'TUESDAY', time: '7:00 AM', subject: 'IT 107 - Human-Computer Interaction', room: 'B1-205' },
      { day: 'TUESDAY', time: '10:00 AM', subject: 'IT 104 - Discrete Mathematics', room: 'Room 202' },
      { day: 'TUESDAY', time: '1:00 PM', subject: 'UTS 101 - Understanding the Self', room: 'SH3' },
    ],
    '1A2': [
      { day: 'TUESDAY', time: '10:00 AM', subject: 'IT 104 - Discrete Mathematics', room: 'Room 202' },
      { day: 'TUESDAY', time: '1:00 PM', subject: 'UTS 101 - Understanding the Self', room: 'SH3' },
      { day: 'WEDNESDAY', time: '8:00 AM', subject: 'IT 105 - Programming 2', room: '' },
      { day: 'WEDNESDAY', time: '11:00 AM', subject: 'IT 107 - Human-Computer Interaction', room: '' },
      { day: 'WEDNESDAY', time: '1:00 PM', subject: 'PAL 101 - Panitikan at Lipunan', room: 'SH1' },
    ],
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const announcementsData = await getActiveAnnouncements();
    setAnnouncements(announcementsData.slice(0, 5));

    if (user) {
      const submissionsData = await getContentSubmissionRequests({ userId: user.uid });
      setSubmissions(submissionsData.slice(0, 5));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  const schedule = schedulePreview[userData?.batch] || schedulePreview['1A1'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Announcements Preview */}
        <Card className="dark:bg-transparent light:!bg-blue-600">
        <CardContent className="!p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                Recent Announcements
              </h3>
            </div>
            <Button
              size="small"
              endIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => onTabChange(0)}
              sx={{
                color: 'var(--color-primary)',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted text-center py-4">
                No announcements yet
              </p>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="dark:bg-slate-800/50 light:!bg-blue-700 rounded-lg p-3 border dark:border-slate-700/50 light:!border-blue-500 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => onTabChange(0)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm dark:text-dark-text-primary light:text-light-text-primary line-clamp-1">
                      {announcement.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      announcement.type === 'urgent'
                        ? 'dark:bg-rose-500/20 light:!bg-blue-700 dark:text-rose-400 light:text-light-text-primary'
                        : announcement.type === 'celebration'
                        ? 'dark:bg-emerald-500/20 light:!bg-blue-700 dark:text-emerald-400 light:text-light-text-primary'
                        : 'dark:bg-sky-500/20 light:!bg-blue-700 dark:text-sky-400 light:text-light-text-primary'
                    }`}>
                      {announcement.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview */}
      <Card className="dark:!bg-transparent light:!bg-blue-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                Upcoming Classes
              </h3>
            </div>
              <div
                key={idx}
                className="dark:bg-slate-800/50 light:!bg-blue-700 rounded-lg p-3 border dark:border-slate-700/50 light:!border-blue-500 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => onTabChange(1)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold dark:text-sky-400 light:text-light-text-primary">
                    {classItem.day}
                  </span>
                  <span className="text-xs dark:text-dark-text-muted light:text-light-text-muted">
                    {classItem.time}
                  </span>
                </div>
                <p className="text-sm font-medium dark:text-dark-text-primary light:text-light-text-primary line-clamp-1 mt-1">
                  {classItem.subject}
                </p>
              </div>
              <div
                key={idx}
                className="dark:bg-slate-800/50 light:!bg-blue-700 rounded-lg p-3 border dark:border-slate-700/50 light:!border-blue-500 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => onTabChange(1)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold dark:text-sky-400 light:!text-white">
                    {classItem.day}
                  </span>
                  <span className="text-xs dark:text-dark-text-muted light:!text-white/80">
                    {classItem.time}
                  </span>
                </div>
                <p className="text-sm font-medium dark:text-dark-text-primary light:!text-white line-clamp-1 mt-1">
                  {classItem.subject}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Submissions Preview */}
      <Card className="dark:!bg-transparent light:!bg-blue-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:!text-white">
                My Submissions
              </h3>
            </div>
            <Button
              size="small"
              endIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => onTabChange(3)}
              sx={{
                color: 'var(--color-primary)',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm dark:text-dark-text-muted light:!text-white/80 mb-3">
                  No submissions yet
                </p>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onTabChange(3)}
                  sx={{
                    backgroundColor: '#8b5cf6',
                    '&:hover': { backgroundColor: '#7c3aed' },
                    textTransform: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Submit Content
                </Button>
              </div>
            ) : (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="dark:bg-slate-800/50 light:!bg-blue-700 rounded-lg p-3 border dark:border-slate-700/50 light:!border-blue-500 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => onTabChange(3)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm dark:text-dark-text-primary light:!text-white line-clamp-1">
                      {submission.contentType === 'task' ? submission.title : submission.announcementTitle}
                    </h4>
                    <span className={`text-xs font-semibold capitalize ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPreview;
