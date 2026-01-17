import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import KanbanBoard from './components/student/KanbanBoard';
import AnnouncementTicker from './components/shared/AnnouncementTicker';
import SemesterProgress from './components/shared/SemesterProgress';
import DailyQuote from './components/shared/DailyQuote';
import AdminPanel from './components/admin/AdminPanel';
import StudentModularDashboard from './components/student/StudentModularDashboard';
import GlobalSearch from './components/shared/GlobalSearch';
import InstallPrompt from './components/shared/InstallPrompt';
import NetworkStatus from './components/NetworkStatus';
import InfoBar from './components/shared/InfoBar';
import { LogOut, RefreshCw, LayoutDashboard, Target, Sun, Moon, Search, Download } from 'lucide-react';
import gsap from 'gsap';
import muiTheme from './theme/muiTheme';
import { getAllGlobalTasks } from './utils/firestore';
import { exportTasksToPDF } from './utils/pdfExport';
import { MultiStepLoader as Loader } from './components/ui/multi-step-loader';

// Site-specific loading messages for the page-load overlay
const loadingStates = [
  { text: 'Loading user profile' },
  { text: 'Fetching announcements' },
  { text: 'Preparing your dashboard' },
  { text: 'Syncing tasks and boards' },
  { text: 'Loading semester progress' },
  { text: 'Applying theme & preferences' },
  { text: 'Checking network & status' },
  { text: 'Almost ready — entering 1A-genda' },
];

function App() {
  const { user, userData, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pageLoading, setPageLoading] = useState(true);
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [resourcesReady, setResourcesReady] = useState(true); // assume ready unless we start loading resources
  const loadStartRef = useRef(Date.now());
  const MIN_LOAD_MS = 1200; // minimum time to show the loader
  const [animationDone, setAnimationDone] = useState(false);
  const [forceLoaderOnce, setForceLoaderOnce] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLightModeWarning, setShowLightModeWarning] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [tasks, setTasks] = useState([]);
  const headerRef = useRef(null);
  const studentDashboardRef = useRef(null);

  useEffect(() => {
    if (user && headerRef.current && headerRef.current.children.length > 0) {
      // Reset to visible first
      gsap.set(headerRef.current.children, {
        y: 0,
        opacity: 1,
      });

      // Then animate from above
      gsap.from(headerRef.current.children, {
        y: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        clearProps: 'all', // Clear inline styles after animation
      });
    }
  }, [user, userData]); // Add userData dependency

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // Track window load and ensure the loader remains visible until resources finish loading
  useEffect(() => {
    const onLoad = () => setWindowLoaded(true);

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => window.removeEventListener('load', onLoad);
  }, []);

  // If user already saw the animated intro, mark animationDone immediately
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = localStorage.getItem('msl_seen_v1');
      if (seen) setAnimationDone(true);
    } catch (e) {
      setAnimationDone(true);
    }
  }, []);

  // When resourcesReady flips from false -> true, run a one-cycle loader
  const prevResourcesReadyRef = useRef(resourcesReady);
  useEffect(() => {
    if (prevResourcesReadyRef.current === false && resourcesReady === true) {
      setForceLoaderOnce(true);
    }
    prevResourcesReadyRef.current = resourcesReady;
  }, [resourcesReady]);

  // If this navigation is a reload, force a one-cycle so manual reloads show the animation once.
  useEffect(() => {
    try {
      const nav = performance.getEntriesByType?.('navigation')?.[0];
      const type = nav?.type || (performance?.navigation?.type || 'navigate');
      if (type === 'reload') {
        setForceLoaderOnce(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Hide loader only when window and resources are ready and minimum display time has elapsed
  useEffect(() => {
    if (!(windowLoaded && resourcesReady && animationDone)) return;

    const elapsed = Date.now() - (loadStartRef.current || 0);
    const remaining = Math.max(0, MIN_LOAD_MS - elapsed);
    const t = setTimeout(() => setPageLoading(false), remaining);
    return () => clearTimeout(t);
  }, [windowLoaded, resourcesReady, animationDone]);

  const handleSignOut = async () => {
    setShowLogoutDialog(false);
    // show loader while signing out
    setAnimationDone(false);
    setForceLoaderOnce(true);
    setPageLoading(true);
    setResourcesReady(false);
    try {
      await signOut();
    } finally {
      setResourcesReady(true);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleNavigateFromSearch = (tabIndex) => {
    if (studentDashboardRef.current) {
      studentDashboardRef.current(tabIndex);
    }
  };

  const loadTasks = async () => {
    if (!isAdmin() && userData?.batch) {
      // mark resources as loading so the global loader waits
      setResourcesReady(false);
      try {
        const tasksData = await getAllGlobalTasks();
        const filteredTasks = tasksData.filter(task =>
          !task.batch || task.batch === 'all' || task.batch === userData.batch
        );
        setTasks(filteredTasks);
      } finally {
        // resources finished (either success or fail)
        setResourcesReady(true);
      }
    }
  };

  const handleExportTasks = () => {
    exportTasksToPDF(tasks);
  };

  useEffect(() => {
    if (user && !isAdmin()) {
      loadTasks();
    }
  }, [user, userData, isAdmin]);

  // Watch auth transitions (login/logout) and show loader during auth transitions
  const prevUserRef = useRef(user);
  useEffect(() => {
    // user became logged in
    if (prevUserRef.current == null && user != null) {
      loadStartRef.current = Date.now();
      setAnimationDone(false);
      setForceLoaderOnce(true);
      setPageLoading(true);
      // If we need to fetch resources for the logged-in user, ensure the loader waits
      if (!isAdmin() && userData?.batch) {
        setResourcesReady(false);
        // trigger task load immediately
        loadTasks();
      } else {
        setResourcesReady(true);
      }
    }

    // user became logged out
    if (prevUserRef.current != null && user == null) {
      loadStartRef.current = Date.now();
      setAnimationDone(false);
      setForceLoaderOnce(true);
      setPageLoading(true);
      setResourcesReady(true);
      // hide shortly after to avoid stuck overlay if nothing else is loading
      setTimeout(() => setPageLoading(false), 600);
    }

    prevUserRef.current = user;
  }, [user, userData, isAdmin]);

  const handleThemeToggle = () => {
    // If switching to light mode (currently dark), show warning
    if (theme === 'dark') {
      setShowLightModeWarning(true);
    } else {
      // If switching back to dark mode, just toggle
      toggleTheme();
    }
  };

  const confirmLightMode = () => {
    setShowLightModeWarning(false);
    toggleTheme();
  };

  // Show auth screens if not logged in
  if (!user) {
    return (
      <ThemeProvider theme={muiTheme}>
        {/* Page-load loader overlay (also on auth screens) */}
        <Loader loadingStates={loadingStates} loading={pageLoading} duration={1800} forceRunOnce={forceLoaderOnce} onAnimationComplete={() => { setAnimationDone(true); setForceLoaderOnce(false); }} />
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      {/* Page-load loader overlay */}
      <Loader loadingStates={loadingStates} loading={pageLoading} duration={1800} forceRunOnce={forceLoaderOnce} onAnimationComplete={() => { setAnimationDone(true); setForceLoaderOnce(false); }} />
      <div className="min-h-screen max-w-full">
      {/* Announcement Ticker - Sticky at top */}
      <div className="sticky top-0 z-50 overflow-x-hidden">
        <AnnouncementTicker key={`announcement-${refreshKey}`} />
      </div>

      {/* Network status banner (online/offline) */}
      <NetworkStatus />


      {/* Header - Sticky below ticker */}
      <header
        ref={headerRef}
        className="glass-effect sticky top-[38px] z-40 backdrop-blur-xl shadow-lg shadow-black/5"
        style={{ opacity: 1, visibility: 'visible' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-5 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0" style={{ opacity: 1 }}>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg shadow-sky-500/30">
                  <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400">
                  1A-genda
                </h1>
              </div>
              {isAdmin() && (
                <span className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-400 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-sky-500/30 shadow-sm whitespace-nowrap">
                  P.I.O. Admin
                </span>
              )}
              {!isAdmin() && userData?.batch && (
                <span className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-500/30 shadow-sm whitespace-nowrap">
                  Batch {userData.batch}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm font-semibold dark:text-dark-text-primary light:text-light-text-primary truncate max-w-[150px] sm:max-w-none">
                  {userData?.displayName || user.email}
                </p>
                <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted">
                  {isAdmin() ? 'Administrator' : 'Student'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => setShowSearch(true)}
                  title="Search (Ctrl+K)"
                  sx={{
                    color: 'var(--color-text-primary)',
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
                  }}
                >
                  <Search className="w-5 h-5" />
                </IconButton>

                <IconButton
                  onClick={handleThemeToggle}
                  title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  sx={{
                    color: 'var(--color-text-primary)',
                    '&:hover': { backgroundColor: 'rgba(56, 189, 248, 0.1)' },
                  }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </IconButton>

                <Button
                  onClick={() => setShowLogoutDialog(true)}
                  startIcon={<LogOut className="w-4 h-4" />}
                  variant="outlined"
                  className="glass-effect dark:!text-dark-text-primary light:!text-light-text-primary !normal-case !font-medium !px-3 sm:!px-4 !py-2 sm:!py-2.5 !rounded-lg sm:!rounded-xl !transition-all !duration-200 hover:!shadow-lg hover:!shadow-sky-500/20"
                  sx={{
                    '& .MuiButton-startIcon': {
                      margin: { xs: 0, sm: '0 8px 0 -4px' },
                    },
                  }}
                >
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* InfoBar below header for all users */}
      <InfoBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 overflow-x-hidden">
        {/* Daily Quote */}
        <div className="mb-6">
          <DailyQuote />
        </div>

        {/* Semester Progress */}
        <div className="mb-8">
          <SemesterProgress />
        </div>

        {/* Admin Panel or Student Dashboard */}
        {isAdmin() ? (
          <AdminPanel
            onTaskCreated={handleRefresh}
            onAnnouncementCreated={handleRefresh}
          />
        ) : (
          <div className="space-y-8">
            {/* Modular Dashboard with Tabs */}
            <StudentModularDashboard
              userBatch={userData?.batch}
              onTabChange={(handler) => studentDashboardRef.current = handler}
            />

            {/* Task Board */}
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold dark:text-dark-text-primary light:text-light-text-primary flex items-center gap-3 mb-3">
                  <Target className="w-8 h-8 text-sky-400" />
                  <span>My Task Board</span>
                </h2>
                <div className="flex items-center gap-3">
                  <Button
                    size="small"
                    startIcon={<Download className="w-4 h-4" />}
                    onClick={handleExportTasks}
                    sx={{
                      color: 'var(--color-primary)',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(56, 189, 248, 0.1)'
                      }
                    }}
                  >
                    Export PDF
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    startIcon={<RefreshCw className="w-4 h-4" />}
                    variant="contained"
                    className="!normal-case !font-semibold !px-5 !py-2.5 !rounded-xl !shadow-lg !shadow-sky-600/30 hover:!shadow-xl hover:!shadow-sky-600/40 hover:!scale-105"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              <KanbanBoard key={refreshKey} />
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        PaperProps={{
          className: 'glass-card',
          sx: {
            borderRadius: '16px',
            minWidth: '320px',
          }
        }}
      >
        <DialogTitle
          className="dark:text-dark-text-primary !font-bold"
          sx={{
            color: 'var(--color-text-primary) !important',
          }}
        >
          Confirm Sign Out
        </DialogTitle>
        <DialogContent
          sx={{
            color: 'var(--color-text-primary) !important',
          }}
        >
          <p className="dark:text-dark-text-secondary !text-base">
            Are you sure you want to sign out?
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button
            onClick={() => setShowLogoutDialog(false)}
            variant="outlined"
            className="!normal-case !font-medium dark:!text-slate-300"
            sx={{
              color: 'var(--color-text-primary) !important',
              borderColor: 'var(--color-border)',
              '&:hover': {
                borderColor: 'var(--color-text-muted)',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSignOut}
            variant="contained"
            className="!normal-case !font-semibold dark:!text-white light:text-light-text-primary"
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626',
              },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Light Mode Warning Dialog */}
      <Dialog
        open={showLightModeWarning}
        onClose={() => setShowLightModeWarning(false)}
        PaperProps={{
          className: 'glass-card',
          sx: {
            borderRadius: '16px',
            minWidth: '320px',
            maxWidth: '500px',
          }
        }}
      >
        <DialogTitle
          className="dark:text-dark-text-primary !font-bold"
          sx={{
            color: 'var(--color-text-primary) !important',
          }}
        >
          ⚠️ Light Mode - Experimental
        </DialogTitle>
        <DialogContent
          sx={{
            color: 'var(--color-text-primary) !important',
          }}
        >
          <p className="dark:text-dark-text-secondary !text-base mb-2">
            Light mode is currently in testing and development. Some colors may not appear properly or may affect readability.
          </p>
          <p className="dark:text-dark-text-secondary !text-base font-semibold">
            It is recommended to stay in dark mode for the best experience.
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button
            onClick={() => setShowLightModeWarning(false)}
            variant="outlined"
            className="!normal-case !font-medium dark:!text-slate-300"
            sx={{
              color: 'var(--color-text-primary) !important',
              borderColor: 'var(--color-border)',
              '&:hover': {
                borderColor: 'var(--color-text-muted)',
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLightMode}
            variant="contained"
            className="!normal-case !font-semibold dark:!text-white light:text-light-text-primary"
            sx={{
              backgroundColor: '#f59e0b',
              '&:hover': {
                backgroundColor: '#d97706',
              },
            }}
          >
            Continue to Light Mode
          </Button>
        </DialogActions>
      </Dialog>

      {/* Global Search */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigate={handleNavigateFromSearch}
      />

      {/* Install Prompt - Only shows on mobile */}
      {user && <InstallPrompt />}
    </ThemeProvider>
  );
}

export default App;
