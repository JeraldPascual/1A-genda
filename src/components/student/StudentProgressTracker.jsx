/**
 * StudentProgressTracker component displays a table of all students, their task completion, and request activity for admin or analytics views.
 * Fetches all relevant data from Firestore and computes completion rates and batch counts.
 *
 * Usage:
 * Use this component in admin dashboards or analytics pages to monitor student progress and engagement.
 *
 * Avoid bypassing the provided data fetching logic or mutating state directly to ensure accurate statistics and UI stability.
 */
import { useState, useEffect } from 'react';
import { getTasks, getUsers, getAllStudentProgressOffline, getTaskRevisionRequestsOffline, getContentSubmissionRequestsOffline } from '../../utils/offlineDataService';
import { Users, CheckCircle, Circle, TrendingUp, FileEdit, Send, Download } from 'lucide-react';
// pdfExport is dynamically imported on-demand

const StudentProgressTracker = () => {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [revisionRequests, setRevisionRequests] = useState([]);
  const [contentSubmissions, setContentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, tasksResult, progressResult, revisionResult, submissionResult] = await Promise.all([
        getUsers(),
        getTasks(),
        getAllStudentProgressOffline(),
        getTaskRevisionRequestsOffline(),
        getContentSubmissionRequestsOffline()
      ]);

      // Filter only students
      const studentUsers = (usersResult.data || []).filter(u => u.role === 'student');
      setStudents(studentUsers);
      setTasks(tasksResult.data || []);
      setProgressData(progressResult.data || []);
      setRevisionRequests(revisionResult.data || []);
      setContentSubmissions(submissionResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const getStudentProgress = (studentId, taskId) => {
    const progress = progressData.find(
      p => p.userId === studentId && p.taskId === taskId
    );
    return progress?.status || 'todo';
  };

  const getStudentTasks = (studentBatch) => {
    // Filter tasks for this student's batch
    return tasks.filter(task => {
      // Tasks without batch or 'all' batch - available to everyone
      if (!task.batch || task.batch === 'all') return true;
      // Tasks matching student's batch
      return task.batch === studentBatch;
    });
  };

  const getStudentCompletionRate = (studentId, studentBatch) => {
    const studentTasks = getStudentTasks(studentBatch);
    if (studentTasks.length === 0) return 0;
    const completedTasks = studentTasks.filter(
      task => getStudentProgress(studentId, task.id) === 'done'
    ).length;
    return Math.round((completedTasks / studentTasks.length) * 100);
  };

  const getStudentRevisionRequests = (studentId) => {
    return revisionRequests.filter(req => req.userId === studentId);
  };

  const getStudentContentSubmissions = (studentId) => {
    return contentSubmissions.filter(req => req.userId === studentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden max-w-full">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-primary-500" aria-hidden="true" />
        <div>
          <h2 className="text-2xl font-display font-bold text-dark-text-primary" id="progress-tracker-heading">
            Student Progress Tracker
          </h2>
          <p className="text-sm text-dark-text-muted">
            {students.length} students • {tasks.length} tasks • {revisionRequests.length} revisions • {contentSubmissions.length} submissions
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-dark-text-muted" role="status" aria-live="polite">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p>No students registered yet</p>
        </div>
      ) : (
        <div className="space-y-4" role="table" aria-label="Student Progress Table" aria-describedby="progress-tracker-heading">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden lg:grid gap-3 pb-3 border-b border-dark-border" style={{ gridTemplateColumns: '200px 1fr 120px' }} role="row">
            <div className="text-sm font-semibold text-dark-text-secondary uppercase tracking-wide" role="columnheader" tabIndex={0} aria-label="Student Name">
              Student
            </div>
            <div className="text-sm font-semibold text-dark-text-secondary uppercase tracking-wide" role="columnheader" tabIndex={0} aria-label="Task Progress">
              Task Progress
            </div>
            <div className="text-sm font-semibold text-dark-text-secondary uppercase tracking-wide text-right" role="columnheader" tabIndex={0} aria-label="Completion Rate">
              Completion
            </div>
          </div>

          {/* Student Rows */}
          <div className="space-y-3 max-h-150 overflow-y-auto">
            {students.map((student) => {
              const studentTasks = getStudentTasks(student.batch);
              const completionRate = getStudentCompletionRate(student.uid, student.batch);
              const completedCount = studentTasks.filter(
                task => getStudentProgress(student.uid, task.id) === 'done'
              ).length;

              return (
                <div
                  key={student.uid}
                  className="flex flex-col lg:grid gap-3 p-4 bg-slate-900/30 border border-slate-800/50 rounded-lg hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/10 transition-all"
                  style={{ gridTemplateColumns: 'lg:200px 1fr lg:120px' }}
                  role="row"
                  tabIndex={0}
                  aria-label={`Student ${student.displayName || student.email}`}
                >
                  {/* Student Info */}
                  <div className="flex flex-col justify-center mb-2 lg:mb-0" role="cell">
                    <p className="font-semibold text-dark-text-primary text-sm">
                      {student.displayName || student.email}
                    </p>
                    <p className="text-xs text-dark-text-muted">{student.email}</p>
                    <span className="text-xs text-primary-400 font-semibold">{student.batch}</span>
                  </div>

                  {/* Task Progress */}
                  <div className="flex flex-wrap gap-2 items-center mb-3 lg:mb-0" role="cell">
                    {studentTasks.length === 0 ? (
                      <span className="text-xs text-dark-text-muted">No tasks available</span>
                    ) : (
                      studentTasks.map((task) => {
                        const status = getStudentProgress(student.uid, task.id);
                        const isDone = status === 'done';

                        return (
                          <div
                            key={task.id}
                            className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
                              isDone
                                ? 'bg-success-600/20 border-success-600/30 text-success-400'
                                : 'bg-slate-700/50 border-slate-600/30 text-slate-400'
                            }`}
                            title={task.title}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isDone}
                            aria-label={`Task: ${task.title}, Status: ${isDone ? 'Completed' : 'Incomplete'}`}
                          >
                            {isDone ? (
                              <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span className="text-xs font-medium truncate max-w-25">
                              {task.title}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-dark-bg-primary border border-dark-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10" role="tooltip" aria-label={`Task: ${task.title}${task.subject ? ', Subject: ' + task.subject : ''}`}>
                              <p className="text-xs font-semibold text-dark-text-primary">
                                {task.title}
                              </p>
                              {task.subject && (
                                <p className="text-xs text-dark-text-muted">{task.subject}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Completion Rate */}
                  <div className="flex flex-col items-start lg:items-end justify-center gap-1" role="cell">
                    <button
                      onClick={async () => {
                        const studentProgress = progressData.filter(p => p.userId === student.uid);
                        const { exportStudentProgressToPDF } = await import('../../utils/pdfExport');
                        exportStudentProgressToPDF(student, tasks, studentProgress);
                      }}
                      className="mb-2 px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-400"
                      title="Export to PDF"
                      aria-label={`Export progress for ${student.displayName || student.email} to PDF`}
                    >
                      <Download className="w-3 h-3" aria-hidden="true" />
                      Export
                    </button>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`w-4 h-4 ${
                          completionRate >= 75
                            ? 'text-success-400'
                            : completionRate >= 50
                            ? 'text-amber-400'
                            : 'text-danger-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-lg font-bold ${
                          completionRate >= 75
                            ? 'text-success-400'
                            : completionRate >= 50
                            ? 'text-amber-400'
                            : 'text-danger-400'
                        }`}
                        aria-label={`Completion rate: ${completionRate}%`}
                      >
                        {completionRate}%
                      </span>
                    </div>
                    <p className="text-xs text-dark-text-muted">
                      {completedCount} of {studentTasks.length} tasks
                    </p>
                    <div className="w-full lg:w-20 h-1.5 bg-dark-bg-primary rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className={`h-full transition-all duration-500 ${
                          completionRate >= 75
                            ? 'bg-success-500'
                            : completionRate >= 50
                            ? 'bg-amber-500'
                            : 'bg-danger-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgressTracker;
