import { useState, useEffect } from 'react';
import { getAllUsers, getAllStudentProgress, getTaskRevisionRequests, getContentSubmissionRequests } from '../utils/firestore';

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    averageCompletion: 0,
    batch1A1Count: 0,
    batch1A2Count: 0,
    totalRevisionRequests: 0,
    totalContentSubmissions: 0
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [allUsers, progressData, revisionData, submissionData] = await Promise.all([
        getAllUsers(),
        getAllStudentProgress(),
        getTaskRevisionRequests(),
        getContentSubmissionRequests()
      ]);
      const studentUsers = allUsers.filter(u => u.role === 'student');

      const studentsWithProgress = studentUsers.map(student => {
        const studentProgress = progressData.filter(p => p.userId === student.id);
        const completedTasks = studentProgress.filter(p => p.status === 'done').length;
        const totalTasks = studentProgress.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks * 100) / totalTasks) : 0;

        return {
          ...student,
          completedTasks,
          totalTasks,
          completionRate
        };
      });

      studentsWithProgress.sort((a, b) => b.completionRate - a.completionRate);

      const activeCount = studentsWithProgress.filter(s => s.totalTasks > 0).length;
      const avgCompletion = studentsWithProgress.length > 0
        ? Math.round(studentsWithProgress.reduce((sum, s) => sum + s.completionRate, 0) / studentsWithProgress.length)
        : 0;
      const batch1A1Count = studentsWithProgress.filter(s => s.batch === '1A1').length;
      const batch1A2Count = studentsWithProgress.filter(s => s.batch === '1A2').length;

      setStudents(studentsWithProgress);
      setStats({
        totalStudents: studentsWithProgress.length,
        activeStudents: activeCount,
        averageCompletion: avgCompletion,
        batch1A1Count,
        batch1A2Count,
        totalRevisionRequests: revisionData.length,
        totalContentSubmissions: submissionData.length
      });
    } catch (error) {
      console.error('Error loading student data:', error);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCompletionColor = (rate) => {
    if (rate >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (rate >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (rate >= 25) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getProgressBarColor = (rate) => {
    if (rate >= 75) return 'dark:bg-emerald-500 light:bg-emerald-500';
    if (rate >= 50) return 'dark:bg-amber-500 light:bg-amber-500';
    if (rate >= 25) return 'dark:bg-orange-500 light:bg-orange-500';
    return 'dark:bg-slate-500 light:bg-slate-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary">Student Demographics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-hidden max-w-full">
        <div className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-slate-800/50 light:!border-blue-500 p-6 rounded-xl hover:border-sky-500/30 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-3xl font-bold dark:text-sky-400 light:!text-white">{stats.totalStudents}</p>
            <p className="text-sm dark:text-dark-text-muted light:!text-white/80 mt-1">Total Students</p>
          </div>
        </div>

        <div className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-slate-800/50 light:!border-blue-500 p-6 rounded-xl hover:border-emerald-500/30 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-3xl font-bold dark:text-emerald-400 light:!text-white">{stats.activeStudents}</p>
            <p className="dark:text-dark-text-muted light:!text-white/80 text-sm mt-2">Active Students</p>
          </div>
        </div>

        <div className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-slate-800/50 light:!border-blue-500 p-6 rounded-xl hover:border-amber-500/30 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-3xl font-bold dark:text-amber-400 light:!text-white">{stats.averageCompletion}%</p>
            <p className="dark:text-dark-text-muted light:!text-white/80 text-sm mt-2">Avg. Completion</p>
          </div>
        </div>

        <div className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-slate-800/50 light:!border-blue-500 p-6 rounded-xl hover:border-purple-500/30 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-bold dark:text-amber-400 light:!text-white">{stats.batch1A1Count}</p>
                <p className="text-xs dark:text-dark-text-muted light:!text-white/80">Batch 1A1</p>
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-purple-400 light:!text-white">{stats.batch1A2Count}</p>
                <p className="text-xs dark:text-dark-text-muted light:!text-white/80">Batch 1A2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Request Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-x-hidden max-w-full">
        <div className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-purple-800/50 light:!border-blue-500 p-6 rounded-xl hover:border-purple-500/30 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-3xl font-bold dark:text-purple-400 light:!text-white">{stats.totalRevisionRequests}</p>
            <p className="text-sm dark:text-dark-text-muted light:!text-white/80 mt-1">Revision Requests</p>
          </div>
        </div>

        <div className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-blue-800/50 light:!border-blue-500 p-6 rounded-xl hover:border-blue-500/30 hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-3xl font-bold dark:text-blue-400 light:!text-white">{stats.totalContentSubmissions}</p>
            <p className="text-sm dark:text-dark-text-muted light:!text-white/80 mt-1">Content Submissions</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl shadow-lg overflow-hidden">
        <div className="dark:bg-sky-500/10 light:bg-gray-50 p-4 shadow-sm">
          <h3 className="text-lg font-bold dark:text-dark-text-primary light:text-light-text-primary">All Students ({students.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="">
                <th className="text-left p-4 text-sm font-semibold dark:text-dark-text-secondary light:text-light-text-secondary">Student</th>
                <th className="text-left p-4 text-sm font-semibold dark:text-dark-text-secondary light:text-light-text-secondary">Email</th>
                <th className="text-center p-4 text-sm font-semibold dark:text-dark-text-secondary light:text-light-text-secondary">Batch</th>
                <th className="text-center p-4 text-sm font-semibold dark:text-dark-text-secondary light:text-light-text-secondary">Joined</th>
                <th className="text-center p-4 text-sm font-semibold dark:text-dark-text-secondary light:text-light-text-secondary">Tasks</th>
                <th className="text-center p-4 text-sm font-semibold dark:text-dark-text-secondary light:text-light-text-secondary">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 dark:text-dark-text-muted light:text-light-text-muted">
                    No students registered yet
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="dark:hover:bg-sky-500/5 light:hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-semibold dark:text-dark-text-primary light:text-light-text-primary">{student.displayName}</p>
                        <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted capitalize">{student.role}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary">{student.email}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        student.batch === '1A1'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : student.batch === '1A2'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {student.batch || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary">{formatDate(student.createdAt)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                        {student.completedTasks} / {student.totalTasks}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getCompletionColor(student.completionRate)}`}>
                          {student.completionRate}%
                        </span>
                        <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${getProgressBarColor(student.completionRate)} transition-all duration-500 rounded-full`}
                            style={{ width: `${student.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
