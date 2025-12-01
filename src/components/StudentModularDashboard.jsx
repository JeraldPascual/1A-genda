import { useState } from 'react';
import { Tabs, Tab, Box, Collapse, IconButton } from '@mui/material';
import { ChevronDown, ChevronUp, Calendar, Megaphone, Target, BookOpen, Send, TrendingUp, Clock } from 'lucide-react';
import AnnouncementPanel from './AnnouncementPanel';
import ScheduleTable from './ScheduleTable';
import ResourceLinks from './ResourceLinks';
import ContentSubmissionPanel from './ContentSubmissionPanel';
import StudentAnalytics from './StudentAnalytics';
import PomodoroTimer from './PomodoroTimer';

const StudentModularDashboard = ({ userBatch }) => {
  const [activeTab, setActiveTab] = useState(0);

  const [expandedSections, setExpandedSections] = useState({
    announcements: true,
    schedule: false,
    resources: false,
    submissions: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-xl overflow-hidden">
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              minHeight: '56px',
              '&.Mui-selected': {
                color: 'var(--color-primary)',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--color-primary)',
              height: '3px',
            },
          }}
        >
          <Tab
            icon={<Megaphone className="w-5 h-5" />}
            iconPosition="start"
            label="Announcements"
          />
          <Tab
            icon={<Calendar className="w-5 h-5" />}
            iconPosition="start"
            label="Schedule"
          />
          <Tab
            icon={<BookOpen className="w-5 h-5" />}
            iconPosition="start"
            label="Resources"
          />
          <Tab
            icon={<Send className="w-5 h-5" />}
            iconPosition="start"
            label="Submit Content"
          />
          <Tab
            icon={<TrendingUp className="w-5 h-5" />}
            iconPosition="start"
            label="Analytics"
          />
          <Tab
            icon={<Clock className="w-5 h-5" />}
            iconPosition="start"
            label="Pomodoro"
          />
        </Tabs>
      </div>

      {/* Tab Panels */}
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
