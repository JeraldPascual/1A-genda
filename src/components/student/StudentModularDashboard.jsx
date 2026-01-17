import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Tooltip } from '@mui/material';
import { Calendar, Megaphone, BookOpen, Send, TrendingUp, Clock } from 'lucide-react';
import AnnouncementPanel from '../shared/AnnouncementPanel';
import ScheduleTable from './ScheduleTable';
import ResourceLinks from './ResourceLinks';
import ContentSubmissionPanel from '../admin/ContentSubmissionPanel';
import StudentAnalytics from './StudentAnalytics';
import PomodoroTimer from './PomodoroTimer';
import { useAuth } from '../../context/AuthContext';
import { getClassSettings } from '../../utils/firestore';

// Minimal, single-definition component. Only the Resources badge is active.
const StudentModularDashboard = ({ userBatch, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (onTabChange) onTabChange(setActiveTab);
  }, [onTabChange]);

  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>
  );

  const [hasResourceUpdates, setHasResourceUpdates] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkResources = async () => {
      if (!user) return;
      try {
        const classSettings = await getClassSettings();
        if (!mounted || !classSettings) return;
        const resourcesUpdated = classSettings.resourcesUpdatedAt?.toMillis?.() || 0;
        const lastLoginMillis = userData?.lastLogin?.toMillis?.() || 0;
        setHasResourceUpdates(resourcesUpdated > lastLoginMillis);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('StudentModularDashboard: failed to check resources', err);
      }
    };
    checkResources();
    return () => {
      mounted = false;
    };
  }, [user, userData]);

  return (
    <div className="space-y-6">
      <div className="glass-card dark:!bg-transparent light:bg-white border-2 dark:border-slate-700 light:border-gray-200 rounded-xl overflow-hidden">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              minHeight: '56px',
              '&.Mui-selected': { color: 'var(--color-primary)' },
            },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)', height: '3px' },
          }}
        >
          <Tab icon={<Megaphone className="w-5 h-5" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Announcements</span></span>} />
          <Tab icon={<Calendar className="w-5 h-5" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Schedule</span></span>} />
          <Tab
            icon={<BookOpen className="w-5 h-5" />}
            iconPosition="start"
            label={
              <Tooltip
                title={
                  "Note: Large files (PPTs, PDFs, slide decks, and other course materials) are hosted externally in the course Notion workspace. Click the resource card or 'Open in New Tab' to view/download files on Notion."
                }
                arrow
                enterTouchDelay={0}
                placement="top"
              >
                <span className="flex items-center gap-2">
                  <span>Resources</span>
                  <span className="w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                </span>
              </Tooltip>
            }
          />
          <Tab icon={<Send className="w-5 h-5" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Submit Content</span></span>} />
          <Tab icon={<TrendingUp className="w-5 h-5" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Analytics</span></span>} />
          <Tab icon={<Clock className="w-5 h-5" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Pomodoro</span></span>} />
        </Tabs>
      </div>

      <div>
        <TabPanel value={activeTab} index={0}>
          <AnnouncementPanel />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ScheduleTable userBatch={userBatch} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <ResourceLinks />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <ContentSubmissionPanel />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <StudentAnalytics />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <PomodoroTimer />
        </TabPanel>
      </div>
    </div>
  );
};

export default StudentModularDashboard;
