/**
 * DashboardPreview component displays a summary of recent announcements, content submissions, and a static schedule preview for the current user batch.
 * Fetches data from Firestore and adapts the schedule based on the user's batch from AuthContext.
 *
 * Props:
 * - onTabChange (function): Callback to switch dashboard tabs when a preview item is clicked.
 *
 * Usage:
 * Use this component in dashboard or home views to provide users with a quick overview of their schedule, announcements, and recent submissions.
 *
 * Avoid hardcoding schedule data outside the preview or bypassing AuthContext to prevent data mismatches and bugs.
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Button } from '@mui/material';
import { Calendar, Megaphone, Send, ChevronRight, Clock, MapPin } from 'lucide-react';
import { getActiveAnnouncementsOffline, getContentSubmissionRequestsOffline } from '../../utils/offlineDataService';
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

  const loadData = useCallback(async () => {
    const { data: announcementsData } = await getActiveAnnouncementsOffline();
    setAnnouncements(announcementsData.slice(0, 5));

    if (user) {
      const { data: submissionsData } = await getContentSubmissionRequestsOffline({ userId: user.uid });
      setSubmissions(submissionsData.slice(0, 5));
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

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
              aria-label="View all announcements"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTabChange(0);
                }
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
                  tabIndex={0}
                  role="button"
                  aria-label={`Go to announcement: ${announcement.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onTabChange(0);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-semibold text-sm dark:text-dark-text-primary light:text-light-text-primary line-clamp-1">
                      {announcement.title}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                        announcement.type === 'urgent'
                          ? 'dark:bg-rose-500/20 light:!bg-blue-700 dark:text-rose-400 light:text-light-text-primary'
                          : announcement.type === 'celebration'
                          ? 'dark:bg-emerald-500/20 light:!bg-blue-700 dark:text-emerald-400 light:text-light-text-primary'
                          : 'dark:bg-sky-500/20 light:!bg-blue-700 dark:text-sky-400 light:text-light-text-primary'
                      }`}>
                        {announcement.type.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap dark:bg-slate-500/20 light:!bg-blue-600 dark:text-slate-300 light:!text-white font-medium border dark:border-slate-500/30 light:!border-blue-400">
                        {announcement.createdAt
                          ? new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'No date'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Preview */}
      <Card className="dark:bg-transparent! light:bg-blue-600!">
        <CardContent className="p-6!">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                Upcoming Classes
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {schedule.map((classItem, idx) => (
              <div
                key={idx}
                className="dark:bg-slate-800/50 light:bg-blue-700! rounded-lg p-3 border dark:border-slate-700/50 light:border-blue-500! cursor-pointer hover:scale-[1.02] transition-transform"
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
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Submissions Preview */}
      <Card className="dark:bg-transparent! light:bg-blue-600!">
        <CardContent className="p-6!">
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
