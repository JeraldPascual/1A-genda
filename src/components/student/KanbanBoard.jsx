/**
 * KanbanBoard component displays the student's personal task board with columns for task states.
 * Handles task progress, creation requests, file uploads, and integrates with Firestore for data persistence.
 *
 * Usage:
 * Use this component in the student dashboard to allow students to track and manage their tasks independently.
 *
 * Avoid mutating state directly or bypassing provided utility functions to prevent data and UI bugs.
 */
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import KanbanColumn from './KanbanColumn';
import { useAuth } from '../../context/AuthContext';
import {
  getTasks,
  getUserStudentProgress,
  updateStudentProgressUpsert,
  getTaskCreationRequests as getTaskCreationRequestsOffline,
  createTaskCreationRequestOffline,
} from '../../utils/offlineDataService';
import { triggerHeartConfetti, triggerPinkFireworks, hasSpecialEffects } from '../../utils/specialEffects';
import { PlusCircle, Upload, Paperclip, X as XIcon, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { uploadFile, formatFileSize } from '../../utils/fileUpload';
import MarkdownEditor from '../shared/MarkdownEditor';

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
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadError('');
    setUploading(true);
    const uploadedFiles = [];
    const failedFiles = [];

    for (const file of files) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        failedFiles.push({ name: file.name, reason: 'File exceeds 5MB limit' });
        continue;
      }

      try {
        const result = await uploadFile(file, (progress) => {
          setUploadProgress(progress);
        });

        if (result.success && result.file) {
          uploadedFiles.push(result.file);
        } else {
          failedFiles.push({ name: file.name, reason: result.error || 'Upload failed' });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        failedFiles.push({ name: file.name, reason: error.message || 'Upload failed' });
      }
    }

    if (failedFiles.length > 0) {
      const errorMsg = `Failed to upload ${failedFiles.length} file(s):\n${failedFiles.map(f => `• ${f.name}: ${f.reason}`).join('\n')}`;
      setUploadError(errorMsg);
    }

    if (uploadedFiles.length > 0) {
      setAttachments(prev => [...prev, ...uploadedFiles]);
    }

    setUploading(false);
    setUploadProgress(0);
    event.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

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
      const tasksResult = await getTasks();
      const globalTasks = tasksResult.data || [];

      if (!isAdmin()) {
        // For students: merge global tasks with their progress
        const { data: progress } = await getUserStudentProgress(user.uid);
        const progressMap = {};
        (progress || []).forEach(p => {
          progressMap[p.taskId] = p.status;
        });

        const userBatch = userData?.batch;

        // Load task creation requests for 1A2 students
        if (userBatch === '1A2') {
          const { data: requests } = await getTaskCreationRequestsOffline({ userId: user.uid });
          setMyRequests(requests || []);
        }

        // Filter tasks for user's batch or specific assignment
        const userTasks = [];

        globalTasks.forEach(task => {
          // 1. Task assigned specifically to this user
          if (task.assignedToUserId === user.uid) {
            userTasks.push({
              ...task,
              column: progressMap[task.id] || task.column || 'todo',
            });
          }
          // 2. Task assigned to another user - SKIP
          else if (task.assignedToUserId) {
            return;
          }
          // 3. Tasks without batch or 'all' batch - available to everyone
          else if (!task.batch || task.batch === 'all') {
            userTasks.push({
              ...task,
              column: progressMap[task.id] || task.column || 'todo',
            });
          }
          // 4. Tasks matching user's batch
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
      // Update via offline-first service
      const result = await updateStudentProgressUpsert(user.uid, task.id, newColumn);

      if (result.success) {
        // Update local state
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === task.id ? { ...t, column: newColumn } : t
          )
        );

        // Trigger effects if moved to done
        if (newColumn === 'done') {
          if (hasSpecialEffects(userData)) {
            // Heart confetti for individual task completion
            triggerHeartConfetti({ count: 100 });

            // Check if ALL tasks are now done
            // Use current 'tasks' state, assuming the current task is now done
            const allDone = tasks.every(t =>
              t.id === task.id ? true : t.column === 'done'
            );

            if (allDone) {
              // Trigger big fireworks if everything is completed
              setTimeout(() => triggerPinkFireworks(), 800); // Slight delay for dramatic effect
            }
          } else {
            // Default confetti for normal users
            import('canvas-confetti').then(({ default: confetti }) => {
               confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
            });
          }
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
    setAttachments([]);
    setUploadError('');
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

    const result = await createTaskCreationRequestOffline({
      ...requestForm,
      batch: userData?.batch,
      userId: user.uid,
      userName: userData?.displayName || 'Unknown',
      userEmail: userData?.email || '',
      attachments: attachments.length > 0 ? attachments : [],
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
      <Dialog
        open={showRequestDialog}
        onClose={handleRequestDialogClose}
        maxWidth="sm"
        fullWidth
        aria-label="Task creation request dialog"
        role="dialog"
        aria-modal="true"
      >
        <DialogTitle id="task-request-dialog-title">Request New Task for 1A2</DialogTitle>
        <DialogContent
          aria-labelledby="task-request-dialog-title"
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
            <MarkdownEditor
              value={requestForm.description}
              onChange={(val) => setRequestForm({ ...requestForm, description: val })}
              label="Description"
              rows={3}
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

            {/* File Upload Section */}
            <div className="mt-3">
              <label className="block text-xs font-medium mb-2 dark:text-sky-400 light:text-blue-600 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Attach Files (Optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="task-request-file-upload"
              />
              <label
                htmlFor="task-request-file-upload"
                className={`block w-full text-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploading
                    ? 'border-slate-600 text-slate-500 cursor-not-allowed'
                    : 'border-sky-500 text-sky-400 hover:border-sky-400 hover:bg-sky-500/10'
                }`}
              >
                {uploading ? `Uploading... ${uploadProgress}%` : 'Click to upload files'}
              </label>
              <p className="text-xs text-slate-400 mt-1">
                Supported: Images, PDF, Word, Excel, PowerPoint, Text, ZIP (Max 2MB per file)
              </p>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 dark:bg-slate-800 light:bg-gray-100 rounded border dark:border-slate-700 light:border-gray-300"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {file.fileType?.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
                        ) : (
                          <FileIcon className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                        <span className="text-xs dark:text-dark-text-primary light:text-light-text-primary truncate">
                          {file.fileName}
                        </span>
                        <span className="text-xs dark:text-dark-text-muted light:text-light-text-muted shrink-0">
                          ({formatFileSize(file.fileSize)})
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <XIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Display */}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 whitespace-pre-line">{uploadError}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRequestDialogClose}>Cancel</Button>
          <Button onClick={handleSubmitRequest} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
