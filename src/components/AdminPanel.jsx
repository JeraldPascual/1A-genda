import { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { createGlobalTask, createAnnouncement, getAllGlobalTasks, getActiveAnnouncements, deleteGlobalTask, deactivateAnnouncement, updateGlobalTask, updateAnnouncement, getTaskCreationRequests, approveTaskCreationRequest, rejectTaskCreationRequest, deleteStudentProgress, deleteUserTaskCreationRequests, getAllUserIdsWithData, deleteUserDocument, getTaskRevisionRequests, approveTaskRevisionRequest, rejectTaskRevisionRequest, getContentSubmissionRequests, approveContentSubmissionRequest, rejectContentSubmissionRequest, getAllStudentProgress, getAllUsers } from '../utils/firestore';
import { useAuth } from '../context/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { PlusCircle, Megaphone, CheckCircle, AlertCircle, Shield, ListTodo, Trash2, Eye, Users, UserCheck, Zap, Target, Inbox, Edit, X, FileEdit, Send, Download, Upload, Paperclip, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import StudentProgressTracker from './StudentProgressTracker';
import StudentDashboard from './StudentDashboard';
import AttachmentList from './AttachmentList';
import { exportTasksToPDF, exportStudentProgressToPDF, exportAnnouncementsToPDF } from '../utils/pdfExport';
import { uploadFile, formatFileSize, getFileIcon } from '../utils/fileUpload';

const AdminPanel = ({ onTaskCreated, onAnnouncementCreated }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('studentProgress');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [taskCreationRequests, setTaskCreationRequests] = useState([]);
  const [taskRevisionRequests, setTaskRevisionRequests] = useState([]);
  const [contentSubmissionRequests, setContentSubmissionRequests] = useState([]);
  const [orphanedUsers, setOrphanedUsers] = useState([]);
  const [batchFilter, setBatchFilter] = useState('all'); // Filter for viewing tasks

  // Edit dialogs
  const [editTaskDialog, setEditTaskDialog] = useState({ open: false, task: null });
  const [editAnnouncementDialog, setEditAnnouncementDialog] = useState({ open: false, announcement: null });
  const [editAnnouncementAttachments, setEditAnnouncementAttachments] = useState([]);
  const [uploadingEditAnnouncement, setUploadingEditAnnouncement] = useState(false);
  const [uploadEditProgress, setUploadEditProgress] = useState(0);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
    column: 'todo',
    batch: 'all', // all, 1A1, or 1A2
  });

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info',
  });
  const [announcementAttachments, setAnnouncementAttachments] = useState([]);
  const [uploadingAnnouncement, setUploadingAnnouncement] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (activeTab === 'viewTasks') {
      loadTasks();
    } else if (activeTab === 'viewAnnouncements') {
      loadAnnouncements();
    } else if (activeTab === 'taskCreationRequests') {
      loadTaskCreationRequests();
    } else if (activeTab === 'taskRevisionRequests') {
      loadTaskRevisionRequests();
    } else if (activeTab === 'contentSubmissions') {
      loadContentSubmissionRequests();
    } else if (activeTab === 'utilities') {
      loadOrphanedUsers();
    }
  }, [activeTab]);

  const loadOrphanedUsers = async () => {
    const userIds = await getAllUserIdsWithData();
    setOrphanedUsers(userIds);
  };

  const loadTaskRevisionRequests = async () => {
    setLoading(true);
    const requests = await getTaskRevisionRequests();
    setTaskRevisionRequests(requests);
    setLoading(false);
  };

  const loadContentSubmissionRequests = async () => {
    setLoading(true);
    const requests = await getContentSubmissionRequests();
    setContentSubmissionRequests(requests);
    setLoading(false);
  };

  const loadTasks = async () => {
    const data = await getAllGlobalTasks();
    setTasks(data);
  };

  const loadAnnouncements = async () => {
    const data = await getActiveAnnouncements();
    setAnnouncements(data);
  };

  const loadTaskCreationRequests = async () => {
    const data = await getTaskCreationRequests({ status: 'pending' });
    setTaskCreationRequests(data);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const result = await deleteGlobalTask(taskId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Task deleted successfully!' });
      loadTasks();
      if (onTaskCreated) onTaskCreated();
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const result = await deactivateAnnouncement(announcementId);
    if (result.success) {
      setMessage({ type: 'success', text: 'Announcement deleted successfully!' });
      loadAnnouncements();
      if (onAnnouncementCreated) onAnnouncementCreated();
    }
  };

  const handleApproveTaskCreation = async (request) => {
    const result = await approveTaskCreationRequest(request.id, request);
    if (result.success) {
      setMessage({ type: 'success', text: 'Task created and added to 1A2!' });
      loadTaskCreationRequests();
      if (onTaskCreated) onTaskCreated();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleRejectTaskCreation = async (requestId) => {
    const result = await rejectTaskCreationRequest(requestId, 'Rejected by admin');
    if (result.success) {
      setMessage({ type: 'success', text: 'Request rejected!' });
      loadTaskCreationRequests();
    }
  };

  const handleCleanupDeletedUser = async (userInfo = null) => {
    let userId = userInfo?.userId || userInfo;
    let userName = userInfo?.name || userId;

    if (!userId) {
      userId = prompt('Enter the User ID (UID) of the deleted user to clean up their data:');
      userName = userId;
    }
    if (!userId || !userId.trim()) return;

    if (!confirm(`This will permanently delete task data for:\n\nUser: ${userName}\nID: ${userId}\n\nThis includes:\n- Task progress (${userInfo?.progressCount || '?'} records)\n- Task requests (${userInfo?.requestsCount || '?'} requests)\n\nNote: User profile will remain in system.\n\nContinue?`)) return;

    setLoading(true);
    try {
      const progressResult = await deleteStudentProgress(userId);
      const requestsResult = await deleteUserTaskCreationRequests(userId);

      setMessage({
        type: 'success',
        text: `Cleaned up "${userName}": ${progressResult.deletedCount || 0} progress records and ${requestsResult.deletedCount || 0} task requests deleted. User profile retained.`
      });

      // Reload the list to update counts
      await loadOrphanedUsers();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cleaning up user data: ' + error.message });
    }
    setLoading(false);
  };

  const handleEditTask = (task) => {
    setEditTaskDialog({ open: true, task });
  };

  const handleEditAnnouncement = (announcement) => {
    setEditAnnouncementDialog({ open: true, announcement });
    setEditAnnouncementAttachments(announcement.attachments || []);
  };

  const handleEditAnnouncementFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingEditAnnouncement(true);
    const uploadedFiles = [];

    for (const file of files) {
      try {
        const result = await uploadFile(file, 'announcements', (progress) => {
          setUploadEditProgress(progress);
        });

        if (result.success) {
          uploadedFiles.push(result);
        } else {
          setMessage({ type: 'error', text: `Failed to upload ${file.name}: ${result.error}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: `Error uploading ${file.name}` });
      }
    }

    setEditAnnouncementAttachments(prev => [...prev, ...uploadedFiles]);
    setUploadingEditAnnouncement(false);
    setUploadEditProgress(0);
    e.target.value = ''; // Reset file input
  };

  const removeEditAnnouncementAttachment = (index) => {
    setEditAnnouncementAttachments(prev => prev.filter((_, i) => i !== index));
  };


  const handleUpdateTask = async () => {
    const task = editTaskDialog.task;
    const result = await updateGlobalTask(task.id, {
      title: task.title,
      description: task.description,
      subject: task.subject,
      dueDate: task.dueDate ? (typeof task.dueDate === 'string' ? Timestamp.fromDate(new Date(task.dueDate)) : task.dueDate) : null,
      priority: task.priority,
      batch: task.batch,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Task updated successfully!' });
      setEditTaskDialog({ open: false, task: null });
      loadTasks();
      if (onTaskCreated) onTaskCreated();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleUpdateAnnouncement = async () => {
    // Check if files are still uploading
    if (uploadingEditAnnouncement) {
      setMessage({
        type: 'error',
        text: 'Please wait for all files to finish uploading before saving.'
      });
      return;
    }

    const announcement = editAnnouncementDialog.announcement;
    const result = await updateAnnouncement(announcement.id, {
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      attachments: editAnnouncementAttachments,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Announcement updated successfully!' });
      setEditAnnouncementDialog({ open: false, announcement: null });
      setEditAnnouncementAttachments([]);
      loadAnnouncements();
      if (onAnnouncementCreated) onAnnouncementCreated();
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  const handleTaskChange = (e) => {
    setTaskForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAnnouncementChange = (e) => {
    setAnnouncementForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAnnouncementFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingAnnouncement(true);
    const uploadedFiles = [];

    for (const file of files) {
      try {
        const result = await uploadFile(file, 'announcements', (progress) => {
          setUploadProgress(progress);
        });

        if (result.success) {
          uploadedFiles.push(result);
        } else {
          setMessage({ type: 'error', text: `Failed to upload ${file.name}: ${result.error}` });
        }
      } catch (error) {
        setMessage({ type: 'error', text: `Error uploading ${file.name}` });
      }
    }

    setAnnouncementAttachments(prev => [...prev, ...uploadedFiles]);
    setUploadingAnnouncement(false);
    setUploadProgress(0);
    e.target.value = ''; // Reset file input
  };

  const removeAnnouncementAttachment = (index) => {
    setAnnouncementAttachments(prev => prev.filter((_, i) => i !== index));
  };


  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const taskData = {
        ...taskForm,
        dueDate: taskForm.dueDate ? Timestamp.fromDate(new Date(taskForm.dueDate)) : null,
        createdBy: user.uid,
        order: Date.now(), // Simple ordering
      };

      const result = await createGlobalTask(taskData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Task created successfully!' });
        setTaskForm({
          title: '',
          description: '',
          subject: '',
          dueDate: '',
          priority: 'medium',
          column: 'todo',
        });
        if (onTaskCreated) onTaskCreated();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }

    setLoading(false);
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();

    // Check if files are still uploading
    if (uploadingAnnouncement) {
      setMessage({
        type: 'error',
        text: 'Please wait for all files to finish uploading before submitting.'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const announcementData = {
        ...announcementForm,
        createdBy: user.uid,
        attachments: announcementAttachments.length > 0 ? announcementAttachments : [],
      };

      const result = await createAnnouncement(announcementData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Announcement created successfully!' });
        setAnnouncementForm({
          title: '',
          message: '',
          type: 'info',
        });
        setAnnouncementAttachments([]);
        if (onAnnouncementCreated) onAnnouncementCreated();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }

    setLoading(false);
  };

  const handleApproveRevisionRequest = async (requestId, requestData) => {
    setLoading(true);
    try {
      const result = await approveTaskRevisionRequest(requestId, requestData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Task revision approved and applied!' });
        await loadTaskRevisionRequests();
        await loadTasks(); // Refresh tasks to show updated data
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleRejectRevisionRequest = async (requestId) => {
    const adminNote = prompt('Reason for rejection (optional):');
    setLoading(true);
    try {
      const result = await rejectTaskRevisionRequest(requestId, adminNote || '');
      if (result.success) {
        setMessage({ type: 'success', text: 'Revision request rejected.' });
        await loadTaskRevisionRequests();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  const handleApproveContentSubmission = async (requestId, requestData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await approveContentSubmissionRequest(requestId, requestData);
      if (result.success) {
        setMessage({
          type: 'success',
          text: `${requestData.contentType === 'task' ? 'Task' : 'Announcement'} created successfully! ${result.type === 'task' ? 'Check View Tasks tab.' : ''}`
        });
        // Reload the submissions list
        await loadContentSubmissionRequests();
        // Also reload tasks or announcements depending on type
        if (requestData.contentType === 'task') {
          await loadTasks();
        } else {
          await loadAnnouncements();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to approve submission' });
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };  const handleRejectContentSubmission = async (requestId) => {
    const adminNote = prompt('Reason for rejection (optional):');
    setLoading(true);
    try {
      const result = await rejectContentSubmissionRequest(requestId, adminNote || '');
      if (result.success) {
        setMessage({ type: 'success', text: 'Submission rejected.' });
        await loadContentSubmissionRequests();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="overflow-x-hidden max-w-full">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-primary-500" />
        <h2 className="text-2xl font-display font-bold dark:text-dark-text-primary light:text-light-text-primary">
          Admin Control Panel
        </h2>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab
            value="studentProgress"
            icon={<Users className="w-4 h-4" />}
            iconPosition="start"
            label="Student Progress"
          />
          <Tab
            value="studentDemographics"
            icon={<UserCheck className="w-4 h-4" />}
            iconPosition="start"
            label="Student Demographics"
          />
          <Tab
            value="task"
            icon={<PlusCircle className="w-4 h-4" />}
            iconPosition="start"
            label="Create Task"
          />
          <Tab
            value="announcement"
            icon={<Megaphone className="w-4 h-4" />}
            iconPosition="start"
            label="Create Announcement"
          />
          <Tab
            value="viewTasks"
            icon={<ListTodo className="w-4 h-4" />}
            iconPosition="start"
            label="View Tasks"
          />
          <Tab
            value="viewAnnouncements"
            icon={<Eye className="w-4 h-4" />}
            iconPosition="start"
            label="View Announcements"
          />
          <Tab
            value="taskCreationRequests"
            icon={<Inbox className="w-4 h-4" />}
            iconPosition="start"
            label="1A2 Task Requests"
          />
          <Tab
            value="taskRevisionRequests"
            icon={<FileEdit className="w-4 h-4" />}
            iconPosition="start"
            label="Revision Requests"
          />
          <Tab
            value="contentSubmissions"
            icon={<Send className="w-4 h-4" />}
            iconPosition="start"
            label="Content Submissions"
          />
          <Tab
            value="utilities"
            icon={<Zap className="w-4 h-4" />}
            iconPosition="start"
            label="Utilities"
          />
        </Tabs>
      </Box>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-success-600 bg-opacity-20 text-success-400 border border-success-600 border-opacity-30'
              : 'bg-danger-600 bg-opacity-20 text-danger-400 border border-danger-600 border-opacity-30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Student Progress Tracker */}
      {activeTab === 'studentProgress' && (
        <StudentProgressTracker />
      )}

      {/* Student Demographics Dashboard */}
      {activeTab === 'studentDemographics' && (
        <StudentDashboard />
      )}

      {/* Task Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-sky-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary placeholder-slate-500 transition-all"
                placeholder="e.g., Math Problem Set Chapter 5"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-sky-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={handleTaskChange}
                rows="3"
                className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary placeholder-slate-500 transition-all resize-none"
                placeholder="Additional details about the task..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-400 mb-2">
                Subject *
              </label>
              <select
                name="subject"
                value={taskForm.subject}
                onChange={handleTaskChange}
                className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Select a subject</option>
                <option value="IT 105 - Computer Programming 2">IT 105 - Computer Programming 2 (Major)</option>
                <option value="PAL 101 - Panitikan at Lipunan">PAL 101 - Panitikan at Lipunan</option>
                <option value="IT 107 - Human-Computer Interaction">IT 107 - Human-Computer Interaction (Major)</option>
                <option value="IT 104 - Discrete Mathematics">IT 104 - Discrete Mathematics</option>
                <option value="IT 106 - Platform Technologies">IT 106 - Platform Technologies (Major)</option>
                <option value="PE 11 - PATHFIT 2">PE 11 - PATHFIT 2</option>
                <option value="UTS 101 - Understanding the Self">UTS 101 - Understanding the Self</option>
                <option value="NSTP 11 - National Service Training Program">NSTP 11 - National Service Training Program</option>
              </select>
            </div>

            {/* Show batch selector only for major subjects */}
            {(taskForm.subject.includes('IT 105') || taskForm.subject.includes('IT 107') || taskForm.subject.includes('IT 106')) && (
              <div>
                <label className="block text-sm font-semibold text-sky-400 mb-2">
                  Target Batch *
                </label>
                <select
                  name="batch"
                  value={taskForm.batch}
                  onChange={handleTaskChange}
                  className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="all">All Students (1A1 & 1A2)</option>
                  <option value="1A1">1A1 Only</option>
                  <option value="1A2">1A2 Only</option>
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  Major subject tasks can be assigned to specific lab batches. Students from other batches can request access if needed.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-sky-400 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={handleTaskChange}
                className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-400 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Priority
              </label>
              <select
                name="priority"
                value={taskForm.priority}
                onChange={handleTaskChange}
                className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary transition-all appearance-none cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-400 mb-2">
                Initial Column
              </label>
              <select
                name="column"
                value={taskForm.column}
                onChange={handleTaskChange}
                className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary transition-all appearance-none cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{loading ? 'Creating Task...' : 'Create Global Task'}</span>
          </button>
        </form>
      )}

      {/* Announcement Form */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-sky-400 mb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcement Title *
            </label>
            <input
              type="text"
              name="title"
              value={announcementForm.title}
              onChange={handleAnnouncementChange}
              className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary placeholder-slate-500 transition-all"
              placeholder="e.g., Class Suspended"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sky-400 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={announcementForm.message}
              onChange={handleAnnouncementChange}
              rows="4"
              className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary placeholder-slate-500 transition-all resize-none"
              placeholder="Your announcement message..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sky-400 mb-2">
              Type
            </label>
            <select
              name="type"
              value={announcementForm.type}
              onChange={handleAnnouncementChange}
              className="w-full px-4 py-3 dark:bg-slate-900/40 light:bg-white border dark:border-slate-700/50 light:border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 focus:outline-none dark:text-dark-text-primary light:text-light-text-primary transition-all appearance-none cursor-pointer"
            >
              <option value="info">Info</option>
              <option value="urgent">Urgent</option>
              <option value="celebration">Celebration</option>
            </select>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="flex text-sm font-semibold text-sky-400 mb-2 items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments (optional)
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed dark:border-slate-700/50 light:border-gray-300 rounded-lg cursor-pointer hover:border-sky-500/50 transition-all group">
                <div className="flex items-center gap-2 text-sm dark:text-dark-text-muted light:text-light-text-secondary group-hover:text-sky-400 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>{uploadingAnnouncement ? `Uploading... ${Math.round(uploadProgress)}%` : 'Click to upload files'}</span>
                </div>
                <input
                  type="file"
                  onChange={handleAnnouncementFileUpload}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  disabled={uploadingAnnouncement}
                />
              </label>
              <p className="text-xs dark:text-dark-text-muted light:text-light-text-secondary">
                Supported: Images, PDF, Word, Excel, PowerPoint, Text, ZIP (Max 5MB per file)
              </p>

              {/* Uploaded Files List */}
              {announcementAttachments.length > 0 && (
                <div className="space-y-2">
                  {announcementAttachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 dark:bg-slate-900/40 light:bg-gray-50 border dark:border-slate-700/50 light:border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {file.fileType.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-sky-400 shrink-0" />
                        ) : (
                          <FileIcon className="w-5 h-5 text-sky-400 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm dark:text-dark-text-primary light:text-light-text-primary truncate">{file.fileName}</p>
                          <p className="text-xs dark:text-dark-text-muted light:text-light-text-secondary">{formatFileSize(file.fileSize)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAnnouncementAttachment(index)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingAnnouncement}
            className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Megaphone className="w-5 h-5" />
            <span>
              {uploadingAnnouncement
                ? 'Uploading files...'
                : loading
                ? 'Creating Announcement...'
                : 'Broadcast Announcement'}
            </span>
          </button>
        </form>
      )}

      {/* View Tasks */}
      {activeTab === 'viewTasks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-dark-text-primary">All Global Tasks</h3>
            <div className="flex gap-2">
              <button
                onClick={() => exportTasksToPDF(tasks)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => setBatchFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  batchFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'dark:bg-dark-bg-secondary light:bg-light-bg-secondary dark:text-dark-text-muted light:text-light-text-muted hover:dark:bg-dark-bg-tertiary hover:light:bg-light-bg-tertiary'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setBatchFilter('1A1')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  batchFilter === '1A1'
                    ? 'bg-emerald-600 text-white'
                    : 'dark:bg-dark-bg-secondary light:bg-light-bg-secondary dark:text-dark-text-muted light:text-light-text-muted hover:dark:bg-dark-bg-tertiary hover:light:bg-light-bg-tertiary'
                }`}
              >
                1A1 ({tasks.filter(t => t.batch === '1A1' || t.batch === 'all' || !t.batch).length})
              </button>
              <button
                onClick={() => setBatchFilter('1A2')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  batchFilter === '1A2'
                    ? 'bg-purple-600 text-white'
                    : 'dark:bg-dark-bg-secondary light:bg-light-bg-secondary dark:text-dark-text-muted light:text-light-text-muted hover:dark:bg-dark-bg-tertiary hover:light:bg-light-bg-tertiary'
                }`}
              >
                1A2 ({tasks.filter(t => t.batch === '1A2' || t.batch === 'all' || !t.batch).length})
              </button>
            </div>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-12 dark:text-dark-text-muted light:text-light-text-muted">
              <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No tasks created yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tasks
                .filter(task => {
                  if (batchFilter === 'all') return true;
                  if (!task.batch || task.batch === 'all') return true;
                  return task.batch === batchFilter;
                })
                .map((task) => (
                <div
                  key={task.id}
                  className="dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary border dark:border-dark-border light:border-light-border rounded-lg p-4 hover:border-primary-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary wrap-break-word">{task.title}</h4>
                        {task.batch && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                              task.batch === '1A1'
                                ? 'bg-emerald-600 bg-opacity-20 text-emerald-400 border border-emerald-600 border-opacity-30'
                                : task.batch === '1A2'
                                ? 'bg-purple-600 bg-opacity-20 text-purple-400 border border-purple-600 border-opacity-30'
                                : 'bg-sky-600 bg-opacity-20 text-sky-400 border border-sky-600 border-opacity-30'
                            }`}
                          >
                            {task.batch === 'all' ? 'All Batches' : task.batch}
                          </span>
                        )}
                        {task.priority && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                              task.priority === 'high'
                                ? 'bg-danger-600 bg-opacity-20 text-danger-400 border border-danger-600 border-opacity-30'
                                : task.priority === 'medium'
                                ? 'bg-amber-600 bg-opacity-20 text-amber-400 border border-amber-600 border-opacity-30'
                                : 'bg-success-600 bg-opacity-20 text-success-400 border border-success-600 border-opacity-30'
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                            task.column === 'todo'
                              ? 'bg-blue-600 bg-opacity-20 text-blue-400 border border-blue-600 border-opacity-30'
                              : 'bg-emerald-600 bg-opacity-20 text-emerald-400 border border-emerald-600 border-opacity-30'
                          }`}
                        >
                          {task.column === 'done' ? 'Completed' : 'To Do'}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary mb-2 wrap-break-word overflow-wrap-anywhere">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs dark:text-dark-text-muted light:text-light-text-muted">
                        {task.subject && (
                          <span className="bg-primary-600 bg-opacity-10 text-primary-400 px-2 py-1 rounded">
                            {task.subject}
                          </span>
                        )}
                        {task.dueDate && (
                          <span>Due: {task.dueDate.toDate ? task.dueDate.toDate().toLocaleDateString() : 'N/A'}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 hover:bg-primary-600 hover:bg-opacity-20 rounded-lg transition-all text-primary-400"
                        aria-label="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-danger-600 hover:bg-opacity-20 rounded-lg transition-all text-danger-400"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Announcements */}
      {activeTab === 'viewAnnouncements' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">Active Announcements</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportAnnouncementsToPDF(announcements)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <span className="text-sm dark:text-dark-text-muted light:text-light-text-muted">{announcements.length} active</span>
            </div>
          </div>
          {announcements.length === 0 ? (
            <div className="text-center py-12 dark:text-dark-text-muted light:text-light-text-muted">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No active announcements</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`border rounded-lg p-4 flex items-start justify-between gap-3 ${
                    announcement.type === 'urgent'
                      ? 'bg-danger-600 bg-opacity-10 border-danger-600 border-opacity-30'
                      : announcement.type === 'celebration'
                      ? 'bg-success-600 bg-opacity-10 border-success-600 border-opacity-30'
                      : 'bg-primary-600 bg-opacity-10 border-primary-600 border-opacity-30'
                  }`}
                >
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary wrap-break-word">{announcement.title}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                          announcement.type === 'urgent'
                            ? 'bg-danger-600 text-white'
                            : announcement.type === 'celebration'
                            ? 'bg-success-600 text-white'
                            : 'bg-primary-600 text-white'
                        }`}
                      >
                        {announcement.type}
                      </span>
                      {announcement.attachments && announcement.attachments.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {announcement.attachments.length}
                        </span>
                      )}
                    </div>
                    <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary wrap-break-word overflow-wrap-anywhere">{announcement.message}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="p-2 hover:bg-primary-600 hover:bg-opacity-20 rounded-lg transition-all text-primary-400"
                      aria-label="Edit announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 hover:bg-danger-600 hover:bg-opacity-20 rounded-lg transition-all text-danger-400"
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Creation Requests Tab */}
      {activeTab === 'taskCreationRequests' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">1A2 Task Creation Requests</h3>
              <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted">Review and approve tasks requested by 1A2 students</p>
            </div>
            <span className="text-sm dark:text-dark-text-muted light:text-light-text-muted">{taskCreationRequests.length} pending</span>
          </div>
          {taskCreationRequests.length === 0 ? (
            <div className="text-center py-12 dark:text-dark-text-muted light:text-light-text-muted">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No pending task creation requests</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {taskCreationRequests.map((request) => (
                <div
                  key={request.id}
                  className="border dark:border-dark-border light:border-light-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-1">
                        {request.title}
                      </h4>
                      <p className="text-sm dark:text-dark-text-secondary light:text-light-text-secondary mb-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs dark:text-dark-text-muted light:text-light-text-muted mb-2">
                        <span>Subject: <strong className="text-primary-400">{request.subject}</strong></span>
                        <span>Batch: <strong className="text-purple-400">{request.batch}</strong></span>
                        <span>Priority: <strong className="text-amber-400">{request.priority}</strong></span>
                        {request.dueDate && <span>Due: <strong>{new Date(request.dueDate).toLocaleDateString()}</strong></span>}
                      </div>
                      <div className="text-xs dark:text-dark-text-muted light:text-light-text-muted">
                        <span>Requested by: <strong>{request.userName}</strong> ({request.userEmail})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveTaskCreation(request)}
                      className="flex-1 px-4 py-2 bg-emerald-600 bg-opacity-20 hover:bg-opacity-30 border border-emerald-600 border-opacity-30 text-emerald-400 rounded-lg transition-all font-semibold text-sm"
                    >
                      ✓ Approve & Create Task
                    </button>
                    <button
                      onClick={() => handleRejectTaskCreation(request.id)}
                      className="flex-1 px-4 py-2 bg-danger-600 bg-opacity-20 hover:bg-opacity-30 border border-danger-600 border-opacity-30 text-danger-400 rounded-lg transition-all font-semibold text-sm"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Revision Requests Tab */}
      {activeTab === 'taskRevisionRequests' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-2">
              Task Revision Requests
            </h3>
            <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted">
              Review and approve/reject student requests to modify existing tasks
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="dark:text-dark-text-muted light:text-light-text-muted">Loading...</p>
            </div>
          ) : taskRevisionRequests.length === 0 ? (
            <div className="text-center py-12 border dark:border-dark-border light:border-light-border rounded-lg">
              <FileEdit className="w-12 h-12 mx-auto mb-3 dark:text-dark-text-muted light:text-light-text-muted opacity-30" />
              <p className="dark:text-dark-text-muted light:text-light-text-muted">No revision requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {taskRevisionRequests.map(request => (
                <div
                  key={request.id}
                  className="border dark:border-dark-border light:border-light-border rounded-lg p-6 dark:bg-slate-800/30 light:bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                          {request.taskTitle}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          request.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          request.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                          {request.requestType}
                        </span>
                      </div>
                      <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted mb-3">
                        <strong>Batch:</strong> {request.userBatch}
                      </p>
                      <div className="p-3 dark:bg-slate-700/50 light:bg-gray-100 rounded-lg mb-3">
                        <p className="text-sm dark:text-dark-text-primary light:text-light-text-primary">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      </div>

                      {request.proposedChanges && Object.keys(request.proposedChanges).length > 0 && (
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold dark:text-dark-text-primary light:text-light-text-primary">Proposed Changes:</p>
                          {request.proposedChanges.title && (
                            <div className="pl-4">
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">Title:</span>
                              <span className="ml-2 dark:text-primary-400 light:text-primary-600">{request.proposedChanges.title}</span>
                            </div>
                          )}
                          {request.proposedChanges.description && (
                            <div className="pl-4">
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">Description:</span>
                              <span className="ml-2 dark:text-primary-400 light:text-primary-600">{request.proposedChanges.description}</span>
                            </div>
                          )}
                          {request.proposedChanges.subject && (
                            <div className="pl-4">
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">Subject:</span>
                              <span className="ml-2 dark:text-primary-400 light:text-primary-600">{request.proposedChanges.subject}</span>
                            </div>
                          )}
                          {request.proposedChanges.priority && (
                            <div className="pl-4">
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">Priority:</span>
                              <span className="ml-2 dark:text-primary-400 light:text-primary-600">{request.proposedChanges.priority}</span>
                            </div>
                          )}
                          {request.proposedChanges.dueDate && (
                            <div className="pl-4">
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">Due Date:</span>
                              <span className="ml-2 dark:text-primary-400 light:text-primary-600">
                                {new Date(request.proposedChanges.dueDate.seconds * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {request.adminNote && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-400">
                            <strong>Admin Note:</strong> {request.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-3 pt-3 border-t dark:border-dark-border light:border-light-border">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApproveRevisionRequest(request.id, request)}
                        disabled={loading}
                        startIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Approve & Apply Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRejectRevisionRequest(request.id)}
                        disabled={loading}
                        startIcon={<X className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Submissions Tab */}
      {activeTab === 'contentSubmissions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-2">
              Content Submissions
            </h3>
            <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted">
              Review and approve/reject student submissions for new tasks and announcements
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="dark:text-dark-text-muted light:text-light-text-muted">Loading...</p>
            </div>
          ) : contentSubmissionRequests.length === 0 ? (
            <div className="text-center py-12 border dark:border-dark-border light:border-light-border rounded-lg">
              <Send className="w-12 h-12 mx-auto mb-3 dark:text-dark-text-muted light:text-light-text-muted opacity-30" />
              <p className="dark:text-dark-text-muted light:text-light-text-muted">No content submissions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentSubmissionRequests.map(request => (
                <div
                  key={request.id}
                  className="border dark:border-dark-border light:border-light-border rounded-lg p-6 dark:bg-slate-800/30 light:bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          request.contentType === 'task' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        }`}>
                          {request.contentType === 'task' ? (
                            <ListTodo className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Megaphone className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <h4 className="text-base font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                          {request.contentType === 'task' ? request.title : request.announcementTitle}
                        </h4>
                        {request.attachments && request.attachments.length > 0 && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-400 font-medium">
                            <Paperclip className="w-3 h-3" />
                            {request.attachments.length}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          request.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          request.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 font-medium">
                          {request.userBatch}
                        </span>
                      </div>

                      {request.contentType === 'task' ? (
                        <div className="space-y-2 text-sm">
                          <p className="dark:text-dark-text-muted light:text-light-text-muted">
                            <strong>Description:</strong> {request.description}
                          </p>
                          <div className="flex flex-wrap gap-4">
                            {request.subject && (
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">
                                <strong>Subject:</strong> {request.subject}
                              </span>
                            )}
                            {request.priority && (
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">
                                <strong>Priority:</strong> {request.priority}
                              </span>
                            )}
                            {request.targetBatch && (
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">
                                <strong>Target:</strong> {request.targetBatch}
                              </span>
                            )}
                            {request.dueDate && (
                              <span className="dark:text-dark-text-muted light:text-light-text-muted">
                                <strong>Due:</strong> {new Date(request.dueDate.seconds * 1000).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-sm">
                          <p className="dark:text-dark-text-muted light:text-light-text-muted">
                            <strong>Message:</strong> {request.announcementMessage}
                          </p>
                          <p className="dark:text-dark-text-muted light:text-light-text-muted">
                            <strong>Type:</strong> {request.announcementType}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 p-3 dark:bg-slate-700/50 light:bg-gray-100 rounded-lg">
                        <p className="text-sm dark:text-dark-text-primary light:text-light-text-primary">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      </div>

                      {request.attachments && request.attachments.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Paperclip className="w-4 h-4 text-sky-400" />
                            <span className="text-sm font-semibold text-sky-400">
                              Attachments ({request.attachments.length})
                            </span>
                          </div>
                          <AttachmentList attachments={request.attachments} />
                        </div>
                      )}

                      {request.adminNote && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-400">
                            <strong>Admin Note:</strong> {request.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-3 pt-3 border-t dark:border-dark-border light:border-light-border">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApproveContentSubmission(request.id, request)}
                        disabled={loading}
                        startIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Approve & Create {request.contentType === 'task' ? 'Task' : 'Announcement'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRejectContentSubmission(request.id)}
                        disabled={loading}
                        startIcon={<X className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Utilities Tab */}
      {activeTab === 'utilities' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-2">Admin Utilities</h3>
            <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted">Maintenance and cleanup tools</p>
          </div>

          <div className="border dark:border-dark-border light:border-light-border rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-danger-600/10 rounded-lg">
                <Trash2 className="w-6 h-6 text-danger-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-2">
                  Clean Up User Task Data
                </h4>
                <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted mb-4">
                  Delete task progress and task requests for any user. This will NOT delete the user profile -
                  they will still appear in Student Progress and Demographics tabs, but their task history will be cleared.
                </p>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleCleanupDeletedUser()}
                  disabled={loading}
                  startIcon={<Trash2 className="w-4 h-4" />}
                >
                  Enter User ID Manually
                </Button>
              </div>
            </div>

            <div className="border-t dark:border-dark-border light:border-light-border pt-6">
              <h5 className="text-sm font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-3">
                All Users in System ({orphanedUsers.length})
              </h5>
              <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted mb-4">
                Click "Delete Data" to clear a user's task progress and requests. Their profile will remain.
              </p>
              {orphanedUsers.length === 0 ? (
                <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted italic">No user data found</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {orphanedUsers.map((userInfo) => (
                    <div
                      key={userInfo.userId}
                      className="flex items-center justify-between p-4 dark:bg-dark-bg-secondary light:bg-light-bg-secondary rounded-lg border dark:border-dark-border light:border-light-border hover:border-primary-600/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold dark:text-dark-text-primary light:text-light-text-primary">{userInfo.name}</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary-600/20 text-primary-400 border border-primary-600/30">
                            {userInfo.batch}
                          </span>
                        </div>
                        <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted mb-1">{userInfo.email}</p>
                        <div className="flex items-center gap-3 text-xs dark:text-dark-text-muted light:text-light-text-muted mb-1">
                          <span>Progress: <strong className="text-primary-400">{userInfo.progressCount}</strong></span>
                          <span>Requests: <strong className="text-amber-400">{userInfo.requestsCount}</strong></span>
                        </div>
                        <code className="text-xs dark:text-dark-text-muted light:text-light-text-muted font-mono break-all">ID: {userInfo.userId}</code>
                      </div>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleCleanupDeletedUser(userInfo)}
                        disabled={loading}
                        startIcon={<Trash2 className="w-3 h-3" />}
                      >
                        Delete Data
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={editTaskDialog.open} onClose={() => setEditTaskDialog({ open: false, task: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {editTaskDialog.task && (
            <div className="space-y-4 mt-2">
              <TextField
                label="Title"
                fullWidth
                value={editTaskDialog.task.title}
                onChange={(e) => setEditTaskDialog(prev => ({ ...prev, task: { ...prev.task, title: e.target.value } }))}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editTaskDialog.task.description}
                onChange={(e) => setEditTaskDialog(prev => ({ ...prev, task: { ...prev.task, description: e.target.value } }))}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Subject"
                fullWidth
                value={editTaskDialog.task.subject}
                onChange={(e) => setEditTaskDialog(prev => ({ ...prev, task: { ...prev.task, subject: e.target.value } }))}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Priority"
                select
                fullWidth
                value={editTaskDialog.task.priority}
                onChange={(e) => setEditTaskDialog(prev => ({ ...prev, task: { ...prev.task, priority: e.target.value } }))}
                sx={{ mb: 2.5 }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                value={editTaskDialog.task.dueDate ? (editTaskDialog.task.dueDate.toDate ? editTaskDialog.task.dueDate.toDate().toISOString().split('T')[0] : new Date(editTaskDialog.task.dueDate).toISOString().split('T')[0]) : ''}
                onChange={(e) => setEditTaskDialog(prev => ({ ...prev, task: { ...prev.task, dueDate: e.target.value } }))}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Batch"
                select
                fullWidth
                value={editTaskDialog.task.batch || 'all'}
                onChange={(e) => setEditTaskDialog(prev => ({ ...prev, task: { ...prev.task, batch: e.target.value } }))}
                sx={{ mb: 2.5 }}
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="1A1">1A1 Only</MenuItem>
                <MenuItem value="1A2">1A2 Only</MenuItem>
              </TextField>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTaskDialog({ open: false, task: null })}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Announcement Dialog */}
      <Dialog open={editAnnouncementDialog.open} onClose={() => setEditAnnouncementDialog({ open: false, announcement: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent>
          {editAnnouncementDialog.announcement && (
            <div className="space-y-4 mt-2">
              <TextField
                label="Title"
                fullWidth
                value={editAnnouncementDialog.announcement.title}
                onChange={(e) => setEditAnnouncementDialog(prev => ({ ...prev, announcement: { ...prev.announcement, title: e.target.value } }))}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={4}
                value={editAnnouncementDialog.announcement.message}
                onChange={(e) => setEditAnnouncementDialog(prev => ({ ...prev, announcement: { ...prev.announcement, message: e.target.value } }))}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Type"
                select
                fullWidth
                value={editAnnouncementDialog.announcement.type}
                onChange={(e) => setEditAnnouncementDialog(prev => ({ ...prev, announcement: { ...prev.announcement, type: e.target.value } }))}
                sx={{ mb: 2.5 }}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>

              {/* File Upload Section */}
              <div>
                <label className="flex text-sm font-semibold text-sky-400 mb-2 items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments (optional)
                </label>
                <div className="space-y-3">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed dark:border-slate-700/50 light:border-gray-300 rounded-lg cursor-pointer hover:border-sky-500/50 transition-all group">
                    <div className="flex items-center gap-2 text-sm dark:text-dark-text-muted light:text-light-text-secondary group-hover:text-sky-400 transition-colors">
                      <Upload className="w-5 h-5" />
                      <span>{uploadingEditAnnouncement ? `Uploading... ${Math.round(uploadEditProgress)}%` : 'Click to upload files'}</span>
                    </div>
                    <input
                      type="file"
                      onChange={handleEditAnnouncementFileUpload}
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                      disabled={uploadingEditAnnouncement}
                    />
                  </label>
                  <p className="text-xs dark:text-dark-text-muted light:text-light-text-secondary">
                    Supported: Images, PDF, Word, Excel, PowerPoint, Text, ZIP (Max 5MB per file)
                  </p>

                  {/* Uploaded Files List */}
                  {editAnnouncementAttachments.length > 0 && (
                    <div className="space-y-2">
                      {editAnnouncementAttachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 dark:bg-slate-900/40 light:bg-gray-50 border dark:border-slate-700/50 light:border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {file.fileType?.startsWith('image/') ? (
                              <ImageIcon className="w-5 h-5 text-sky-400 shrink-0" />
                            ) : (
                              <FileIcon className="w-5 h-5 text-sky-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm dark:text-dark-text-primary light:text-light-text-primary truncate">{file.fileName}</p>
                              <p className="text-xs dark:text-dark-text-muted light:text-light-text-secondary">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeEditAnnouncementAttachment(index)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditAnnouncementDialog({ open: false, announcement: null });
            setEditAnnouncementAttachments([]);
          }}>Cancel</Button>
          <Button
            onClick={handleUpdateAnnouncement}
            variant="contained"
            disabled={uploadingEditAnnouncement}
          >
            {uploadingEditAnnouncement ? 'Uploading...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
