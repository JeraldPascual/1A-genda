import { useState } from 'react';
import { Tabs, Tab, Box, Collapse, IconButton } from '@mui/material';
import { ChevronDown, ChevronUp, Calendar, Megaphone, Target, BookOpen, Send } from 'lucide-react';
import AnnouncementPanel from './AnnouncementPanel';
import ScheduleTable from './ScheduleTable';
import ResourceLinks from './ResourceLinks';
import ContentSubmissionPanel from './ContentSubmissionPanel';

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
        </Tabs>
      </div>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <AnnouncementPanel />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {userBatch && <ScheduleTable userBatch={userBatch} />}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ResourceLinks />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <ContentSubmissionPanel />
      </TabPanel>

      {/* Alternative: Accordion-style collapsible sections */}
      {/* Uncomment this section if you prefer accordion over tabs */}
      {/*
      <div className="space-y-4">
        <div className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
            onClick={() => toggleSection('announcements')}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
                Announcements
              </h3>
            </div>
            <IconButton size="small">
              {expandedSections.announcements ? (
                <ChevronUp className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              )}
            </IconButton>
          </div>
          <Collapse in={expandedSections.announcements}>
            <div className="p-4 pt-0">
              <AnnouncementPanel />
            </div>
          </Collapse>
        </div>

        <div className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
            onClick={() => toggleSection('schedule')}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
                Class Schedule
              </h3>
            </div>
            <IconButton size="small">
              {expandedSections.schedule ? (
                <ChevronUp className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              )}
            </IconButton>
          </div>
          <Collapse in={expandedSections.schedule}>
            <div className="p-4 pt-0">
              {userBatch && <ScheduleTable userBatch={userBatch} />}
            </div>
          </Collapse>
        </div>

        <div className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
            onClick={() => toggleSection('resources')}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
                Resources
              </h3>
            </div>
            <IconButton size="small">
              {expandedSections.resources ? (
                <ChevronUp className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              )}
            </IconButton>
          </div>
          <Collapse in={expandedSections.resources}>
            <div className="p-4 pt-0">
              <ResourceLinks />
            </div>
          </Collapse>
        </div>

        <div className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
            onClick={() => toggleSection('submissions')}
          >
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-sky-400" />
              <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
                Submit Content
              </h3>
            </div>
            <IconButton size="small">
              {expandedSections.submissions ? (
                <ChevronUp className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 dark:text-dark-text-primary light:text-white" />
              )}
            </IconButton>
          </div>
          <Collapse in={expandedSections.submissions}>
            <div className="p-4 pt-0">
              <ContentSubmissionPanel />
            </div>
          </Collapse>
        </div>
      </div>
      */}
    </div>
  );
};

export default StudentModularDashboard;
