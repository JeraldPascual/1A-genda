import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, Button, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, LinearProgress, Typography } from '@mui/material';
import { Calendar, BookOpen, CheckCircle, ArrowRight, ArrowLeft, X, Edit3, AlertCircle, Bell, MoreVertical, Trash2, Copy, Paperclip, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import gsap from 'gsap';
import { createTaskRevisionRequest } from '../utils/firestore';
import { uploadFile, validateAttachmentsSize } from '../utils/fileUpload';
import { useAuth } from '../context/AuthContext';
import AttachmentList from './AttachmentList';
import MarkdownDisplay from './MarkdownDisplay';
import MarkdownEditor from './MarkdownEditor';

const TaskCard = ({ task, onMoveTask, isAdmin, currentColumn, allColumns, userData }) => {
  const cardRef = useRef(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const { user } = useAuth();

  const [revisionForm, setRevisionForm] = useState({
    requestType: 'other',
    proposedTitle: task.title || '',
    proposedDescription: task.description || '',
    proposedDueDate: '',
    proposedPriority: task.priority || 'medium',
    proposedSubject: task.subject || '',
    reason: '',
  });

  const [revisionAttachments, setRevisionAttachments] = useState([]);
  const [uploadingRevision, setUploadingRevision] = useState(false);
  const [uploadRevisionProgress, setUploadRevisionProgress] = useState(0);
  const [uploadRevisionError, setUploadRevisionError] = useState('');

  const isLongDescription = (text) => {
    return text && text.length > 100;
  };

  useEffect(() => {
    // Entry animation
    gsap.fromTo(
      cardRef.current,
      {
        y: -20,
        opacity: 0,
        scale: 0.95,
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }
    );
  }, []);

  const handleMove = (targetColumn) => {
    // Animation before moving
    gsap.to(cardRef.current, {
      scale: 1.05,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        onMoveTask(task, targetColumn);
      }
    });
  };

  const getNextColumn = () => {
    const currentIndex = allColumns.findIndex(col => col.id === currentColumn);
    if (currentIndex < allColumns.length - 1) {
      return allColumns[currentIndex + 1];
    }
    return null;
  };

  const getPreviousColumn = () => {
    const currentIndex = allColumns.findIndex(col => col.id === currentColumn);
    if (currentIndex > 0) {
      return allColumns[currentIndex - 1];
    }
    return null;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-danger-500';
      case 'medium': return 'border-l-4 border-warning-500';
      case 'low': return 'border-l-4 border-success-500';
      default: return 'border-l-4 border-dark-border';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDeadlineWarning = () => {
    if (!task.dueDate) return null;

    const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
    const now = new Date();

    // Normalize both dates to midnight for accurate day comparison
    dueDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    console.log('Task:', task.title, 'Due Date:', dueDate, 'Now:', now, 'Diff Days:', diffDays);

    if (diffDays < 0) {
      return { type: 'overdue', message: 'Overdue!', days: Math.abs(diffDays) };
    } else if (diffDays === 0) {
      return { type: 'today', message: 'Due today!', days: 0 };
    } else if (diffDays === 1) {
      return { type: 'tomorrow', message: 'Due tomorrow!', days: 1 };
    } else if (diffDays <= 3) {
      return { type: 'soon', message: `Due in ${diffDays} days`, days: diffDays };
    }
    return null;
  };

  const handleCopyTask = () => {
    const taskText = `${task.title}\n${task.description || ''}\nSubject: ${task.subject || 'N/A'}\nDue: ${task.dueDate ? formatDate(task.dueDate) : 'N/A'}`;
    navigator.clipboard.writeText(taskText);
    setMenuAnchor(null);
  };

  const deadlineWarning = getDeadlineWarning();

  const handleRevisionFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (totalSize > maxSize) {
      setUploadRevisionError('Total file size exceeds 5MB limit');
      return;
    }

    setUploadingRevision(true);
    setUploadRevisionError('');
    setUploadRevisionProgress(0);

    try {
      const uploadedFiles = [];
      let processedSize = 0;

      for (const file of files) {
        const result = await uploadFile(file, (progress) => {
          const currentFileProgress = (processedSize + (file.size * progress / 100)) / totalSize * 100;
          setUploadRevisionProgress(currentFileProgress);
        });

        if (result.success && result.file) {
          uploadedFiles.push(result.file);
          processedSize += file.size;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }

      setRevisionAttachments(prev => [...prev, ...uploadedFiles]);
      setUploadRevisionProgress(100);

      setTimeout(() => {
        setUploadingRevision(false);
        setUploadRevisionProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadRevisionError(error.message || 'Failed to upload files');
      setUploadingRevision(false);
    }

    setUploadRevisionProgress(0);
    e.target.value = '';
  };

  const removeRevisionAttachment = (index) => {
    setRevisionAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleRevisionSubmit = async () => {
    if (!revisionForm.reason.trim()) {
      alert('Please provide a reason for the revision request');
      return;
    }

    if (uploadingRevision) {
      alert('Please wait for all files to finish uploading');
      return;
    }

    // Validate total attachment size before submitting
    if (revisionAttachments.length > 0) {
      const validation = validateAttachmentsSize(revisionAttachments);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }
    }

    setSubmittingRevision(true);
    try {
      const proposedChanges = {};

      // Only include fields that have been changed
      if (revisionForm.requestType === 'edit' || revisionForm.requestType === 'other') {
        if (revisionForm.proposedTitle !== task.title) proposedChanges.title = revisionForm.proposedTitle;
        if (revisionForm.proposedDescription !== task.description) proposedChanges.description = revisionForm.proposedDescription;
        if (revisionForm.proposedSubject !== task.subject) proposedChanges.subject = revisionForm.proposedSubject;
        if (revisionForm.proposedPriority !== task.priority) proposedChanges.priority = revisionForm.proposedPriority;
      }

      if (revisionForm.requestType === 'deadline' && revisionForm.proposedDueDate) {
        proposedChanges.dueDate = new Date(revisionForm.proposedDueDate);
      }

      const result = await createTaskRevisionRequest({
        taskId: task.id,
        userId: user.uid,
        userBatch: userData?.batch || 'unknown',
        taskTitle: task.title,
        requestType: revisionForm.requestType,
        proposedChanges,
        reason: revisionForm.reason,
        attachments: revisionAttachments,
      });

      if (result.success) {
        setRevisionSuccess(true);
        setTimeout(() => {
          setShowRevisionModal(false);
          setRevisionSuccess(false);
          // Reset form
          setRevisionForm({
            requestType: 'other',
            proposedTitle: task.title || '',
            proposedDescription: task.description || '',
            proposedDueDate: '',
            proposedPriority: task.priority || 'medium',
            proposedSubject: task.subject || '',
            reason: '',
          });
          setRevisionAttachments([]);
          setUploadRevisionError('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting revision request:', error);
      alert('Failed to submit revision request');
    }
    setSubmittingRevision(false);
  };

  const nextColumn = getNextColumn();
  const previousColumn = getPreviousColumn();

  return (
    <>
    <Card
      ref={cardRef}
      className={`!mb-3 !transition-all !duration-200 ${getPriorityColor(task.priority)} group hover:!shadow-2xl overflow-hidden max-w-full dark:!bg-transparent light:!bg-blue-600`}
      sx={{
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent className="!p-4">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="font-semibold dark:text-dark-text-primary light:!text-white flex-1 text-sm leading-tight break-words overflow-wrap-anywhere">
            {task.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {task.priority && (
              <Chip
                label={task.priority.toUpperCase()}
                size="small"
                className={`!text-xs !font-medium ${
                  task.priority === 'high' ? '!bg-danger-600/20 !text-danger-400 !border !border-danger-600/30' :
                  task.priority === 'medium' ? '!bg-amber-600/20 !text-amber-400 !border !border-amber-600/30' :
                  '!bg-success-600/20 !text-success-400 !border !border-success-600/30'
                }`}
              />
            )}
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-primary)' } }}
            >
              <MoreVertical className="w-4 h-4" />
            </IconButton>
          </div>
        </div>

        {task.description && (
          <div className="mb-3">
            <div className="text-xs dark:text-dark-text-secondary light:!text-white/90 leading-relaxed line-clamp-2 markdown-card-preview">
              <MarkdownDisplay content={task.description} />
            </div>
            {(isLongDescription(task.description) || (task.attachments && task.attachments.length > 0)) && (
              <button
                onClick={() => setShowDescriptionModal(true)}
                className="mt-2 flex items-center gap-1 text-xs font-semibold dark:text-sky-400 light:!text-white/90 dark:hover:text-sky-300 light:hover:!text-white transition-colors"
              >
                <span>{task.attachments && task.attachments.length > 0 ? 'View Details & Attachments' : 'Read More'}</span>
              </button>
            )}
          </div>
        )}

        {!task.description && task.attachments && task.attachments.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowDescriptionModal(true)}
              className="flex items-center gap-1 text-xs font-semibold dark:text-sky-400 light:!text-white/90 dark:hover:text-sky-300 light:hover:!text-white transition-colors"
            >
              <span>View Attachments</span>
            </button>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-2 text-xs dark:text-dark-text-muted light:!text-white mb-3">
          {task.subject && (
            <span className="dark:bg-primary-600/10 light:!bg-blue-700 dark:text-primary-400 light:!text-white px-2 py-1 rounded flex items-center gap-1 dark:border-primary-600/20 light:!border-blue-500 border">
              <BookOpen className="w-3 h-3" />
              <span className="font-medium">{task.subject}</span>
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 px-2 py-1 dark:bg-slate-700/50 light:!bg-blue-700 rounded border dark:border-slate-600/30 light:!border-blue-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 dark:bg-sky-600/20 light:!bg-blue-700 dark:text-sky-400 light:!text-white rounded border dark:border-sky-600/30 light:!border-blue-500">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </span>
          )}
          {/* Deadline Warning Badge - inline with date */}
          {deadlineWarning && currentColumn !== 'done' && (
            <span className={`flex items-center gap-1 px-2.5 py-1.5 rounded font-bold text-xs ${
              deadlineWarning.type === 'overdue' ? 'bg-red-500/30 border-2 border-red-500 text-red-300 animate-pulse' :
              deadlineWarning.type === 'today' ? 'bg-orange-500/30 border-2 border-orange-500 text-orange-300 animate-pulse' :
              'bg-amber-500/30 border-2 border-amber-500 text-amber-300 animate-pulse'
            }`}>
              <Bell className="w-3.5 h-3.5" />
              <span>{deadlineWarning.message}</span>
            </span>
          )}
        </div>

        {/* Revision Request Button - Available for all students */}
        {!isAdmin && (
          <Button
            onClick={() => setShowRevisionModal(true)}
            variant="outlined"
            size="small"
            startIcon={<Edit3 className="w-3 h-3" />}
            className="!mb-3 !w-full !text-xs !font-medium !normal-case"
            sx={{
              borderColor: 'rgba(168, 85, 247, 0.4)',
              color: '#c084fc',
              '&:hover': {
                borderColor: 'rgba(168, 85, 247, 0.6)',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
              },
            }}
          >
            Request Revision
          </Button>
        )}

        {!isAdmin && (
          <div className="flex gap-2">
            {previousColumn && (
              <Button
                onClick={() => handleMove(previousColumn.id)}
                variant="contained"
                startIcon={<ArrowLeft className="w-4 h-4" />}
                className="!flex-1 !text-xs !font-semibold !py-2.5 !bg-slate-600 hover:!bg-slate-700 !normal-case"
              >
                Back to {previousColumn.title}
              </Button>
            )}
            {nextColumn && (
              <Button
                onClick={() => handleMove(nextColumn.id)}
                variant="contained"
                endIcon={<ArrowRight className="w-4 h-4" />}
                color="success"
                className="!flex-1 !text-xs !font-semibold !py-2.5 !normal-case"
              >
                {nextColumn.id === 'done' ? 'Mark Complete' : `Move to ${nextColumn.title}`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Three-Dot Menu */}
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={() => setMenuAnchor(null)}
      PaperProps={{
        sx: {
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }
      }}
    >
      <MenuItem
        onClick={handleCopyTask}
        sx={{
          fontSize: '0.875rem',
          color: 'var(--color-text-primary)',
          '&:hover': { backgroundColor: 'var(--color-bg-hover)' }
        }}
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Task Details
      </MenuItem>
      {!isAdmin && (
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setShowRevisionModal(true);
          }}
          sx={{
            fontSize: '0.875rem',
            color: 'var(--color-text-primary)',
            '&:hover': { backgroundColor: 'var(--color-bg-hover)' }
          }}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Request Changes
        </MenuItem>
      )}
    </Menu>

    {/* Revision Request Modal */}
    <Dialog
      open={showRevisionModal}
      onClose={() => setShowRevisionModal(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-purple-400" />
          <span>Request Task Revision</span>
        </div>
      </DialogTitle>
      <DialogContent sx={{
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        pt: 3
      }}>
        {revisionSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
            <p className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">
              Revision Request Submitted!
            </p>
            <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted mt-2">
              Admin will review your request shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm dark:text-purple-300 light:text-purple-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Task:</strong> {task.title}
                  <br />
                  Request changes to this task. Admin will review and approve/reject your suggestions.
                </span>
              </p>
            </div>

            <TextField
              select
              label="Request Type"
              value={revisionForm.requestType}
              onChange={(e) => setRevisionForm({ ...revisionForm, requestType: e.target.value })}
              fullWidth
              size="small"
              sx={{
                '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
              }}
            >
              <MenuItem value="edit">Edit Task Details</MenuItem>
              <MenuItem value="deadline">Change Deadline</MenuItem>
              <MenuItem value="details">Update Instructions</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            {(revisionForm.requestType === 'edit' || revisionForm.requestType === 'other') && (
              <>
                <TextField
                  label="Proposed Title"
                  value={revisionForm.proposedTitle}
                  onChange={(e) => setRevisionForm({ ...revisionForm, proposedTitle: e.target.value })}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                    '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                  }}
                />
                <MarkdownEditor
                  value={revisionForm.proposedDescription}
                  onChange={(val) => setRevisionForm({ ...revisionForm, proposedDescription: val })}
                  label="Proposed Description"
                  rows={3}
                  size="small"
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    select
                    label="Proposed Priority"
                    value={revisionForm.proposedPriority}
                    onChange={(e) => setRevisionForm({ ...revisionForm, proposedPriority: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </TextField>
                  <TextField
                    label="Proposed Subject"
                    value={revisionForm.proposedSubject}
                    onChange={(e) => setRevisionForm({ ...revisionForm, proposedSubject: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  />
                </div>
              </>
            )}

            {revisionForm.requestType === 'deadline' && (
              <TextField
                label="Proposed Due Date"
                type="date"
                value={revisionForm.proposedDueDate}
                onChange={(e) => setRevisionForm({ ...revisionForm, proposedDueDate: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                  '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                }}
              />
            )}

            <MarkdownEditor
              value={revisionForm.reason}
              onChange={(val) => setRevisionForm({ ...revisionForm, reason: val })}
              label="Reason for Revision"
              rows={3}
              required
              placeholder="Explain why this revision is needed..."
              size="small"
            />

            {/* File Upload Section */}
            <div>
              <input
                type="file"
                multiple
                onChange={handleRevisionFileUpload}
                style={{ display: 'none' }}
                id="revision-file-upload"
                disabled={uploadingRevision}
              />
              <label htmlFor="revision-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Paperclip className="w-4 h-4" />}
                  disabled={uploadingRevision}
                  fullWidth
                  sx={{
                    color: 'var(--color-primary)',
                    borderColor: 'var(--color-border)',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)'
                    }
                  }}
                >
                  {uploadingRevision ? 'Uploading...' : 'Add Supporting Files'}
                </Button>
              </label>

              {uploadingRevision && (
                <div style={{ marginTop: '8px' }}>
                  <LinearProgress variant="determinate" value={uploadRevisionProgress} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Uploading... {Math.round(uploadRevisionProgress)}%
                  </Typography>
                </div>
              )}

              {uploadRevisionError && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {uploadRevisionError}
                </Typography>
              )}

              {revisionAttachments.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography variant="caption" color="text.secondary">
                      Attached Files ({revisionAttachments.length}):
                    </Typography>
                  </div>
                  <AttachmentList attachments={revisionAttachments} />
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {revisionAttachments.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => removeRevisionAttachment(index)}
                        disabled={uploadingRevision}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'rgb(239, 68, 68)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          cursor: uploadingRevision ? 'not-allowed' : 'pointer',
                          opacity: uploadingRevision ? 0.5 : 1
                        }}
                      >
                        <X className="w-3 h-3" />
                        Remove {file.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
      {!revisionSuccess && (
        <DialogActions sx={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          p: 2
        }}>
          <Button
            onClick={() => setShowRevisionModal(false)}
            sx={{ color: 'var(--color-text-muted)' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevisionSubmit}
            variant="contained"
            disabled={submittingRevision || !revisionForm.reason.trim()}
            sx={{
              backgroundColor: '#a855f7',
              '&:hover': { backgroundColor: '#9333ea' },
            }}
          >
            {submittingRevision ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      )}
    </Dialog>

    {/* Description Modal - Using Portal to render at body level */}
    {showDescriptionModal && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowDescriptionModal(false)}>
        <div className="glass-effect rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
          {/* Sticky Close Button */}
          <button
            onClick={() => setShowDescriptionModal(false)}
            className="sticky top-4 float-right z-10 p-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-lg transition-colors shadow-lg mr-4 backdrop-blur-sm"
          >
            <X className="w-5 h-5 dark:text-dark-text-muted light:text-light-text-muted" />
          </button>

          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                task.priority === 'high' ? 'bg-danger-600/20 text-danger-400' :
                task.priority === 'medium' ? 'bg-amber-600/20 text-amber-400' :
                'bg-success-600/20 text-success-400'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary mb-2">
                  {task.title}
                </h3>
                {task.subject && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                    {task.subject}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <div className="dark:text-dark-text-primary light:text-light-text-primary text-base leading-relaxed">
                <MarkdownDisplay content={task.description} />
              </div>

              {task.dueDate && (
                <div className="mt-4 pt-4 border-t dark:border-dark-border light:border-light-border">
                  <div className="flex items-center gap-2 text-sm dark:text-dark-text-muted light:text-light-text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                </div>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-dark-border light:border-light-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-semibold text-sky-400">
                      Attachments ({task.attachments.length})
                    </span>
                  </div>
                  <AttachmentList attachments={task.attachments} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
  );
};

export default TaskCard;
