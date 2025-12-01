import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import KanbanColumn from './KanbanColumn';
import { useAuth } from '../context/AuthContext';
import {
  getAllGlobalTasks,
  getStudentProgress,
  updateStudentProgress,
  createTaskCreationRequest,
  getTaskCreationRequests
} from '../utils/firestore';
import confetti from 'canvas-confetti';
import { PlusCircle } from 'lucide-react';

const KanbanBoard = () => {
  const { user, isAdmin, userData } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMove, setLastMove] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
  });

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'done', title: 'Completed' },
  ];

  useEffect(() => {
    if (user && userData) {
      loadTasks();
    }
  }, [user, userData]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const globalTasks = await getAllGlobalTasks();

      if (!isAdmin()) {
        // For students: merge global tasks with their progress
        const progress = await getStudentProgress(user.uid);
        const progressMap = {};
        progress.forEach(p => {
          progressMap[p.taskId] = p.status;
        });

        const userBatch = userData?.batch;

        // Load task creation requests for 1A2 students
        if (userBatch === '1A2') {
          const requests = await getTaskCreationRequests({ userId: user.uid });
          setMyRequests(requests);
        }

        // Filter tasks for user's batch
        const userTasks = [];

        globalTasks.forEach(task => {
          // Tasks without batch or 'all' batch - available to everyone
          if (!task.batch || task.batch === 'all') {
            userTasks.push({
              ...task,
              column: progressMap[task.id] || task.column || 'todo',
            });
          }
          // Tasks matching user's batch
          else if (task.batch === userBatch) {
            userTasks.push({
              ...task,
              column: progressMap[task.id] || task.column || 'todo',
            });
          }
        });

        setTasks(userTasks);
      } else {
        // For admin: show global tasks as-is
        setTasks(globalTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    setLoading(false);
  };  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleMoveTask = async (task, newColumn) => {
    if (isAdmin()) return; // Admin can't move tasks

    const oldColumn = task.column;

    // Save last move for undo
    setLastMove({
      taskId: task.id,
      oldColumn,
      newColumn
    });

    try {
      // Update Firestore
      const result = await updateStudentProgress(user.uid, task.id, newColumn);

      if (result.success) {
        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === task.id ? { ...t, column: newColumn } : t
          )
        );

        // Trigger confetti if moved to done
        if (newColumn === 'done') {
          triggerConfetti();
        }
      } else {
        console.error('Failed to update task:', result.error);
        await loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      await loadTasks();
    }
  };

  const handleUndo = async () => {
    if (!lastMove || isAdmin()) return;

    try {
      const result = await updateStudentProgress(user.uid, lastMove.taskId, lastMove.oldColumn);

      if (result.success) {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === lastMove.taskId ? { ...t, column: lastMove.oldColumn } : t
          )
        );
        setLastMove(null);
      } else {
        console.error('Failed to undo:', result.error);
      }
    } catch (error) {
      console.error('Error undoing task:', error);
    }
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.column === columnId);
  };

  const handleRequestDialogOpen = () => {
    setShowRequestDialog(true);
  };

  const handleRequestDialogClose = () => {
    setShowRequestDialog(false);
    setRequestForm({
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      priority: 'medium',
    });
  };

  const handleRequestFormChange = (e) => {
    setRequestForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.title || !requestForm.subject) {
      alert('Please fill in title and subject');
      return;
    }

    const result = await createTaskCreationRequest({
      ...requestForm,
      batch: userData?.batch,
      userId: user.uid,
      userName: userData?.displayName || 'Unknown',
      userEmail: userData?.email || '',
    });

    if (result.success) {
      alert('Task request submitted! Wait for admin approval.');
      handleRequestDialogClose();

      // Reload requests immediately
      if (userData?.batch === '1A2') {
        const requests = await getTaskCreationRequests({ userId: user.uid });
        setMyRequests(requests);
      }
    } else {
      alert('Failed to submit request: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Only major subjects for 1A2 task requests
  const majorSubjects = [
    'IT 105 - Computer Programming 2',
    'IT 106 - Platform Technologies',
    'IT 107 - Human-Computer Interaction',
  ];

  return (
    <div className="space-y-4">
      {!isAdmin() && userData?.batch === '1A2' && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">Request New Task</h3>
            <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted">Submit tasks specific to 1A2 for admin approval</p>
          </div>
          <Button
            onClick={handleRequestDialogOpen}
            variant="contained"
            startIcon={<PlusCircle className="w-5 h-5" />}
            className="bg-primary-600! hover:bg-primary-700! text-sm! font-semibold! normal-case!"
          >
            Request Task
          </Button>
        </div>
      )}

      {!isAdmin() && lastMove && (
        <div className="flex justify-end">
          <Button
            onClick={handleUndo}
            variant="contained"
            className="bg-amber-600! hover:bg-amber-700! text-sm! font-semibold! normal-case!"
          >
            ↶ Undo Last Move
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-x-hidden">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByColumn(column.id)}
            onMoveTask={handleMoveTask}
            isAdmin={isAdmin()}
            allColumns={columns}
            userData={userData}
          />
        ))}
      </div>

      {/* My Task Requests Status */}
      {!isAdmin() && userData?.batch === '1A2' && myRequests.length > 0 && (
        <div className="mt-6">
          <div className="glass-card rounded-xl p-6 dark:border-dark-border light:border-light-border">
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-4">My Task Requests</h3>
            <div className="space-y-3">
              {myRequests.map(req => (
                <div key={req.id} className="dark:bg-slate-800/30 light:bg-white rounded-lg p-4 dark:border-slate-700/50 light:border-gray-200 border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary">{req.title}</h4>
                      <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted mt-1">{req.description}</p>
                      <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted mt-1">Subject: {req.subject}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'pending' ? 'dark:bg-yellow-500/20 dark:text-yellow-400 light:bg-yellow-100 light:text-yellow-800' :
                      req.status === 'approved' ? 'dark:bg-green-500/20 dark:text-green-400 light:bg-green-100 light:text-green-700' :
                      'dark:bg-red-500/20 dark:text-red-400 light:bg-red-100 light:text-red-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Request Dialog */}
      <Dialog open={showRequestDialog} onClose={handleRequestDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Request New Task for 1A2</DialogTitle>
        <DialogContent
          sx={{
            pt: 1,
            pb: 1,
            maxHeight: { xs: '60vh', sm: '65vh', md: '70vh' },
            overflowY: 'auto',
          }}
        >
          <div className="space-y-2 mt-1">
            <TextField
              name="title"
              label="Task Title"
              fullWidth
              value={requestForm.title}
              onChange={handleRequestFormChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={requestForm.description}
              onChange={handleRequestFormChange}
            />
            <TextField
              name="subject"
              label="Subject"
              select
              fullWidth
              value={requestForm.subject}
              onChange={handleRequestFormChange}
              required
            >
              {majorSubjects.map(subject => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </TextField>
            <TextField
              name="dueDate"
              label="Due Date"
              type="date"
              fullWidth
              value={requestForm.dueDate}
              onChange={handleRequestFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="priority"
              label="Priority"
              select
              fullWidth
              value={requestForm.priority}
              onChange={handleRequestFormChange}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRequestDialogClose}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained">Submit Request</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
