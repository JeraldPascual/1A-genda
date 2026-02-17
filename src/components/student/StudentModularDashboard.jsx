/**
 * StudentModularDashboard component provides a tabbed dashboard for students, including announcements, schedule, resources, analytics, and Pomodoro timer.
 * Integrates with AuthContext and Firestore for user and class data, and manages tab state and resource update badges.
 *
 * Props:
 * - userBatch (string): The student's batch.
 * - onTabChange (function): Callback to handle tab changes.
 *
 * Usage:
 * Use this component as the main dashboard for students to access all class features in a modular layout.
 *
 * Avoid mutating tab state directly or bypassing the provided tab change logic to prevent navigation bugs.
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { Tabs, Tab, Box, Tooltip } from '@mui/material';
import { Calendar, Megaphone, BookOpen, Send, TrendingUp, Clock } from 'lucide-react';
import AnnouncementPanel from '../shared/AnnouncementPanel';
import ScheduleTable from './ScheduleTable';
import ResourceLinks from './ResourceLinks';
import ContentSubmissionPanel from '../admin/ContentSubmissionPanel';
const StudentAnalytics = lazy(() => import('./StudentAnalytics'));
import PomodoroTimer from './PomodoroTimer';
import { useAuth } from '../../context/AuthContext';
import { getClassSettingsOffline } from '../../utils/offlineDataService';

// Minimal, single-definition component. Only the Resources badge is active.
const StudentModularDashboard = ({ userBatch }) => {
    // TabPanel component for accessible tab content
    const TabPanel = ({ children, value, index, labelledby }) => (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`dashboard-tabpanel-${index}`}
        aria-labelledby={labelledby || `dashboard-tab-${index}`}
        tabIndex={0}
      >
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
      </div>
    );
  const [activeTab, setActiveTab] = useState(0);
  const { user, userData } = useAuth();
  const [hasResourceUpdates, setHasResourceUpdates] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkResources = async () => {
      if (!user) return;
      try {
        const { data: classSettings } = await getClassSettingsOffline();
        if (!mounted || !classSettings) return;
        const resourcesUpdated = classSettings.resourcesUpdatedAt?.toMillis?.()
          || (classSettings.resourcesUpdatedAt ? new Date(classSettings.resourcesUpdatedAt).getTime() : 0);
        const lastLoginMillis = userData?.lastLogin?.toMillis?.()
          || (userData?.lastLogin ? new Date(userData.lastLogin).getTime() : 0);
        setHasResourceUpdates(resourcesUpdated > lastLoginMillis);
    } catch {
        // Silently ignore errors
      }
    };
    checkResources();
    return () => { mounted = false; };
  }, [user, userData]);

  const handleTabChange = (e, newValue) => setActiveTab(newValue);

  return (
    <div>
      <div>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Student dashboard navigation tabs"
          role="tablist"
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
          <Tab icon={<Megaphone className="w-5 h-5" aria-hidden="true" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Announcements</span></span>} id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
          <Tab icon={<Calendar className="w-5 h-5" aria-hidden="true" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Schedule</span></span>} id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
          <Tab
            icon={<BookOpen className="w-5 h-5" aria-hidden="true" />}
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
            id="dashboard-tab-2"
            aria-controls="dashboard-tabpanel-2"
            aria-label={hasResourceUpdates ? 'Resources (new updates)' : 'Resources'}
          />
          <Tab icon={<Send className="w-5 h-5" aria-hidden="true" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Submit Content</span></span>} id="dashboard-tab-3" aria-controls="dashboard-tabpanel-3" />
          <Tab icon={<TrendingUp className="w-5 h-5" aria-hidden="true" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Analytics</span></span>} id="dashboard-tab-4" aria-controls="dashboard-tabpanel-4" />
          <Tab icon={<Clock className="w-5 h-5" aria-hidden="true" />} iconPosition="start" label={<span className="flex items-center gap-2"><span>Pomodoro</span></span>} id="dashboard-tab-5" aria-controls="dashboard-tabpanel-5" />
        </Tabs>
      </div>
      <div>
        <TabPanel value={activeTab} index={0} labelledby="dashboard-tab-0">
          <AnnouncementPanel />
        </TabPanel>
        <TabPanel value={activeTab} index={1} labelledby="dashboard-tab-1">
          <ScheduleTable userBatch={userBatch} />
        </TabPanel>
        <TabPanel value={activeTab} index={2} labelledby="dashboard-tab-2">
          <ResourceLinks />
        </TabPanel>
        <TabPanel value={activeTab} index={3} labelledby="dashboard-tab-3">
          <ContentSubmissionPanel />
        </TabPanel>
        <TabPanel value={activeTab} index={4} labelledby="dashboard-tab-4">
          <Suspense fallback={<div className="flex justify-center items-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
            <StudentAnalytics />
          </Suspense>
        </TabPanel>
        <TabPanel value={activeTab} index={5} labelledby="dashboard-tab-5">
          <PomodoroTimer />
        </TabPanel>
      </div>
    </div>
  );
};

export default StudentModularDashboard;
