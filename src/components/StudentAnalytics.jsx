import { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, BookOpen, Target } from 'lucide-react';
import { getAllGlobalTasks, getStudentProgress } from '../utils/firestore';
import { useAuth } from '../context/AuthContext';

const StudentAnalytics = () => {
  const { user, userData } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, progressData] = await Promise.all([
        getAllGlobalTasks(),
        getStudentProgress(user.uid)
      ]);

      // Filter tasks by batch
      const userBatch = userData?.batch;
      const filteredTasks = tasksData.filter(task =>
        !task.batch || task.batch === 'all' || task.batch === userBatch
      );

      setTasks(filteredTasks);
      setProgress(progressData);
      console.log('Analytics Data:', {
        totalTasks: filteredTasks.length,
        progressEntries: progressData.length,
        completedTasks: progressData.filter(p => p.status === 'done').length
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
    setLoading(false);
  };

  // Calculate completion rate data
  const getCompletionData = () => {
    // Create a map of task progress
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.taskId] = p.status;
    });

    // Count only tasks that are marked as 'done'
    const completed = tasks.filter(task => progressMap[task.id] === 'done').length;
    const total = tasks.length;

    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Remaining', value: total - completed, color: '#64748b' }
    ];
  };

  // Calculate subject breakdown
  const getSubjectBreakdown = () => {
    const subjectMap = {};

    tasks.forEach(task => {
      if (!task.subject) return;
      if (!subjectMap[task.subject]) {
        subjectMap[task.subject] = { total: 0, completed: 0 };
      }
      subjectMap[task.subject].total++;

      const taskProgress = progress.find(p => p.taskId === task.id);
      if (taskProgress && taskProgress.status === 'done') {
        subjectMap[task.subject].completed++;
      }
    });

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      completed: data.completed,
      remaining: data.total - data.completed,
      total: data.total
    }));
  };

  // Calculate upcoming deadlines
  const getUpcomingDeadlines = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7; // Next 7 days
      })
      .map(task => {
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
        const taskProgress = progress.find(p => p.taskId === task.id);

        return {
          title: task.title,
          subject: task.subject || 'N/A',
          dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          daysLeft: diffDays,
          completed: taskProgress?.status === 'done',
          priority: task.priority || 'medium'
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const completionData = getCompletionData();
  const subjectBreakdown = getSubjectBreakdown();
  const upcomingDeadlines = getUpcomingDeadlines();

  // Use the same calculation logic as getCompletionData
  const progressMap = {};
  progress.forEach(p => {
    progressMap[p.taskId] = p.status;
  });
  const completed = tasks.filter(task => progressMap[task.id] === 'done').length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Auto-reload: Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [user.uid, userData?.batch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="dark:text-dark-text-muted light:text-light-text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted uppercase tracking-wide">Completion Rate</h3>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold dark:text-dark-text-primary light:text-light-text-primary">{completionRate}%</p>
          <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary mt-1">
            {completed} of {total} tasks completed
          </p>
        </div>

        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted uppercase tracking-wide">Total Tasks</h3>
            <Target className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-3xl font-bold dark:text-dark-text-primary light:text-light-text-primary">{total}</p>
          <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary mt-1">
            {total - completed} remaining
          </p>
        </div>

        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted uppercase tracking-wide">Upcoming</h3>
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold dark:text-dark-text-primary light:text-light-text-primary">{upcomingDeadlines.length}</p>
          <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary mt-1">
            Due in next 7 days
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Pie Chart */}
        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
          <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Task Completion
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => {
                  // On mobile, show shorter labels
                  if (window.innerWidth < 640) {
                    return `${value}`;
                  }
                  return `${name}: ${value}`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Breakdown Bar Chart */}
        <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
          <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Progress
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="subject"
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                tick={{ fill: 'var(--color-text-muted)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)'
                }}
              />
              <Legend
                wrapperStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
              <Bar dataKey="remaining" stackId="a" fill="#64748b" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Deadlines Timeline */}
      <div className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary rounded-xl p-6 border dark:border-dark-border light:border-light-border">
        <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Deadlines
        </h3>

        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8 dark:text-dark-text-muted light:text-light-text-muted">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No upcoming deadlines in the next 7 days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  task.completed
                    ? 'dark:bg-emerald-900/10 light:bg-emerald-100 dark:border-emerald-600/30 light:border-emerald-400'
                    : task.daysLeft === 0
                    ? 'dark:bg-orange-900/10 light:bg-orange-100 dark:border-orange-600/30 light:border-orange-400'
                    : task.daysLeft === 1
                    ? 'dark:bg-amber-900/10 light:bg-amber-100 dark:border-amber-600/30 light:border-amber-400'
                    : 'dark:bg-dark-bg-secondary light:bg-light-bg-secondary dark:border-dark-border light:border-light-border'
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary text-sm mb-1">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs dark:text-dark-text-muted light:text-light-text-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {task.subject}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                    {task.dueDate}
                  </p>
                  <p className={`text-xs font-medium ${
                    task.completed ? 'text-emerald-400' :
                    task.daysLeft === 0 ? 'text-orange-400' :
                    task.daysLeft === 1 ? 'text-amber-400' :
                    'dark:text-dark-text-muted light:text-light-text-muted'
                  }`}>
                    {task.completed ? 'Completed' :
                     task.daysLeft === 0 ? 'Due Today' :
                     task.daysLeft === 1 ? 'Due Tomorrow' :
                     `${task.daysLeft} days left`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalytics;
