/**
 * @file App.jsx
 * @description Main application component for 1A-genda. Handles authentication, theming, global loading, dashboard routing, and top-level UI logic.
 *
 * Architecture:
 * - Uses React functional components and hooks for state and lifecycle management.
 * - Integrates with AuthContext and ThemeContext for global state.
 * - Handles global loading overlays, keyboard shortcuts, and animated transitions.
 * - Renders either admin or student dashboard based on user role.
 * - Provides PDF export, refresh, and theme switching logic.
 *
 * @module App
 */
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const KanbanBoard = lazy(() => import('./components/student/KanbanBoard'));
const AnnouncementTicker = lazy(() => import('./components/shared/AnnouncementTicker'));
const SemesterProgress = lazy(() => import('./components/shared/SemesterProgress'));
const MidtermCountdown = lazy(() => import('./components/shared/MidtermCountdown'));
const MidtermSchedule = lazy(() => import('./components/shared/MidtermSchedule'));
const DailyQuote = lazy(() => import('./components/shared/DailyQuote'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const StudentModularDashboard = lazy(() => import('./components/student/StudentModularDashboard'));
const GlobalSearch = lazy(() => import('./components/shared/GlobalSearch'));
const InstallPrompt = lazy(() => import('./components/shared/InstallPrompt'));
const NetworkStatus = lazy(() => import('./components/NetworkStatus'));
const InfoBar = lazy(() => import('./components/shared/InfoBar'));
import { LogOut, RefreshCw, LayoutDashboard, Target, Sun, Moon, Search, Download } from 'lucide-react';
import gsap from 'gsap';
import muiTheme from './theme/muiTheme';
import { getAllGlobalTasks } from './utils/firestore';
import { exportTasksToPDF } from './utils/pdfExport';
import { MultiStepLoader as Loader } from './components/ui/multi-step-loader';
import HeartTrail from './components/shared/HeartTrail';
import PinkThemeManager from './components/shared/PinkThemeManager';
import BearMascot from './components/shared/BearMascot';
import { hasSpecialEffects } from './utils/specialEffects';

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

/**
 * Main application component for 1A-genda.
 * Handles authentication, theming, global loading, dashboard routing, and top-level UI logic.
 *
 * @returns {JSX.Element} The rendered application UI.
 */
function App() {
  /**
   * Authenticated user object from AuthContext.
   * @type {import('./context/AuthContext').User | null}
   */
  const { user, userData, signOut, isAdmin } = useAuth();

  /**
   * Current theme and theme toggle function from ThemeContext.
   * @type {{ theme: string, toggleTheme: () => void }}
   */
  const { theme, toggleTheme } = useTheme();

  /**
   * Whether the global page loader is visible.
   * @type {[boolean, Function]}
   */
  const [pageLoading, setPageLoading] = useState(true);

  /**
   * Whether the window has finished loading.
   * @type {[boolean, Function]}
   */
  const [windowLoaded, setWindowLoaded] = useState(false);

  /**
   * Whether all async resources are ready (used for loader overlay).
   * @type {[boolean, Function]}
   */
  const [resourcesReady, setResourcesReady] = useState(true); // assume ready unless we start loading resources

  /**
   * Ref to track when loading started (for minimum loader duration).
   * @type {import('react').MutableRefObject<number>}
   */
  const loadStartRef = useRef(Date.now());

  /**
   * Minimum time (ms) to show the loader overlay.
   * @type {number}
   */
  const MIN_LOAD_MS = 1200;

  /**
   * Whether the loader animation has finished.
   * @type {[boolean, Function]}
   */
  const [animationDone, setAnimationDone] = useState(false);

  /**
   * Forces the loader to run once (e.g., on reload or resource refresh).
   * @type {[boolean, Function]}
   */
  const [forceLoaderOnce, setForceLoaderOnce] = useState(false);

  /**
   * Whether to show the registration screen (vs login).
   * @type {[boolean, Function]}
   */
  const [showRegister, setShowRegister] = useState(false);

  /**
   * Key to force refresh of child components (e.g., KanbanBoard).
   * @type {[number, Function]}
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Whether the logout confirmation dialog is open.
   * @type {[boolean, Function]}
   */
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  /**
   * Whether the light mode warning dialog is open.
   * @type {[boolean, Function]}
   */
  const [showLightModeWarning, setShowLightModeWarning] = useState(false);

  /**
   * Whether the global search modal is open.
   * @type {[boolean, Function]}
   */
  const [showSearch, setShowSearch] = useState(false);

  /**
   * List of tasks for the current user (student only).
   * @type {[Array<Object>, Function]}
   */
  const [tasks, setTasks] = useState([]);

  /**
   * Ref to the header DOM element (for GSAP animation).
   * @type {import('react').MutableRefObject<HTMLElement|null>}
   */
  const headerRef = useRef(null);

  /**
   * Ref to the student dashboard tab change handler.
   * @type {import('react').MutableRefObject<Function|null>}
   */
  const studentDashboardRef = useRef(null);

  /**
   * Animate header children on user login using GSAP.
   * Runs when user or userData changes.
   */
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
  }, [user, userData]);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  /**
   * Keyboard shortcut handler for global search (Ctrl+K or Cmd+K) and Escape to close.
   */
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
  /**
   * Tracks window load event to control loader overlay.
   */
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
  /**
   * Checks if the animated loader intro has already been seen (localStorage).
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = localStorage.getItem('msl_seen_v1');
      if (seen) setAnimationDone(true);
    } catch {
      setAnimationDone(true);
    }
  }, []);

  // When resourcesReady flips from false -> true, run a one-cycle loader
  /**
   * Forces loader to run a cycle when resources become ready after being not ready.
   */
  const prevResourcesReadyRef = useRef(resourcesReady);
  useEffect(() => {
    if (prevResourcesReadyRef.current === false && resourcesReady === true) {
      setForceLoaderOnce(true);
    }
    prevResourcesReadyRef.current = resourcesReady;
  }, [resourcesReady]);

  // If this navigation is a reload, force a one-cycle so manual reloads show the animation once.
  /**
   * Forces loader to run a cycle on page reload navigation.
   */
  useEffect(() => {
    try {
      const nav = performance.getEntriesByType?.('navigation')?.[0];
      const type = nav?.type || (performance?.navigation?.type || 'navigate');
      if (type === 'reload') {
        setForceLoaderOnce(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Hide loader only when window and resources are ready and minimum display time has elapsed
  /**
   * Hides loader overlay only when window, resources, and animation are all ready, and minimum loader time has elapsed.
   */
  useEffect(() => {
    if (!(windowLoaded && resourcesReady && animationDone)) return;

    const elapsed = Date.now() - (loadStartRef.current || 0);
    const remaining = Math.max(0, MIN_LOAD_MS - elapsed);
    const t = setTimeout(() => setPageLoading(false), remaining);
    return () => clearTimeout(t);
  }, [windowLoaded, resourcesReady, animationDone]);


  /**
   * Handles user sign out, showing loader during the process.
   * @returns {Promise<void>}
   */
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


  /**
   * Forces refresh of child components by incrementing refreshKey.
   */
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };


  /**
   * Handles navigation from global search to a specific tab in the student dashboard.
   * @param {number} tabIndex - The index of the tab to navigate to.
   */
  const handleNavigateFromSearch = (tabIndex) => {
    if (studentDashboardRef.current) {
      studentDashboardRef.current(tabIndex);
    }
  };


  /**
   * Loads all global tasks for the current student user (filtered by batch).
   * Sets resourcesReady to false while loading.
   * @returns {Promise<void>}
   */
  const loadTasks = async () => {
    if (!isAdmin() && userData?.batch) {
      // mark resources as loading so the global loader waits
      setResourcesReady(false);
      try {
        const tasksData = await getAllGlobalTasks();
        const filteredTasks = tasksData.filter(task => {
          // 1. Assigned to me?
          if (task.assignedToUserId === user.uid) return true;
          // 2. Assigned to someone else?
          if (task.assignedToUserId) return false;
          // 3. Global or matching batch?
          return !task.batch || task.batch === 'all' || task.batch === userData.batch;
        });
        setTasks(filteredTasks);
      } finally {
        // resources finished (either success or fail)
        setResourcesReady(true);
      }
    }
  };


  /**
   * Exports the current user's tasks to a PDF file.
   */
  const handleExportTasks = () => {
    exportTasksToPDF(tasks);
  };

  /**
   * Loads tasks for student users when user or userData changes.
   */
  useEffect(() => {
    if (user && !isAdmin()) {
      loadTasks();
    }
  }, [user, userData, isAdmin]);

  // Watch auth transitions (login/logout) and show loader during auth transitions
  /**
   * Watches authentication transitions (login/logout) and shows loader during transitions.
   */
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


  /**
   * Handles theme toggle, showing warning if switching to light mode.
   */
  const handleThemeToggle = () => {
    // If switching to light mode (currently dark), show warning
    if (theme === 'dark') {
      setShowLightModeWarning(true);
    } else {
      // If switching back to dark mode, just toggle
      toggleTheme();
    }
  };

  /**
   * Confirms switching to light mode after warning dialog.
   */
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
      <PinkThemeManager />
      <BearMascot />
      {/* Page-load loader overlay */}
      <Loader loadingStates={loadingStates} loading={pageLoading} duration={1800} forceRunOnce={forceLoaderOnce} onAnimationComplete={() => { setAnimationDone(true); setForceLoaderOnce(false); }} />
      <div className="min-h-screen max-w-full">
      {/* Header Group */}
      <div className="sticky top-0 z-50 w-full">
        {/* Announcement Ticker */}
        <div className="overflow-x-hidden bg-background">
          <AnnouncementTicker key={`announcement-${refreshKey}`} />
        </div>

        {/* Network status banner (online/offline) */}
        <NetworkStatus />

        {/* Header */}
        <header
          ref={headerRef}
          className="glass-effect backdrop-blur-xl shadow-lg shadow-black/5"
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
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <MidtermCountdown />
            <MidtermSchedule />
          </div>
        </div>

        {/* Admin Panel or Student Dashboard */}
        <Suspense fallback={<Loader loadingStates={loadingStates} loading={true} duration={1200} />}>
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
                <KanbanBoard key={refreshKey} userData={userData} />
              </div>
            </div>
          )}
        </Suspense>
      </main>
      </div>

      {/* HeartTrail: only for users with specialEffects enabled */}
      {hasSpecialEffects(userData) && (
        <HeartTrail enabled color="#F88379" />
      )}

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
