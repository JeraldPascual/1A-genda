import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, Button, Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Calendar, BookOpen, CheckCircle, ArrowRight, ArrowLeft, X, Edit3, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { createTaskRevisionRequest } from '../utils/firestore';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ task, onMoveTask, isAdmin, currentColumn, allColumns, userData }) => {
  const cardRef = useRef(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState(false);
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

  const handleRevisionSubmit = async () => {
    if (!revisionForm.reason.trim()) {
      alert('Please provide a reason for the revision request');
      return;
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
          {task.priority && (
            <Chip
              label={task.priority.toUpperCase()}
              size="small"
              className={`!text-xs !font-medium shrink-0 ${
                task.priority === 'high' ? '!bg-danger-600/20 !text-danger-400 !border !border-danger-600/30' :
                task.priority === 'medium' ? '!bg-amber-600/20 !text-amber-400 !border !border-amber-600/30' :
                '!bg-success-600/20 !text-success-400 !border !border-success-600/30'
              }`}
            />
          )}
        </div>

        {task.description && (
          <div className="mb-3">
            <p className="text-xs dark:text-dark-text-secondary light:!text-white/90 leading-relaxed line-clamp-2">
              {task.description}
            </p>
            {isLongDescription(task.description) && (
              <button
                onClick={() => setShowDescriptionModal(true)}
                className="mt-2 flex items-center gap-1 text-xs font-semibold dark:text-sky-400 light:!text-white/90 dark:hover:text-sky-300 light:hover:!text-white transition-colors"
              >
                <span>Read More</span>
              </button>
            )}
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
                <TextField
                  label="Proposed Description"
                  value={revisionForm.proposedDescription}
                  onChange={(e) => setRevisionForm({ ...revisionForm, proposedDescription: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                    '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                  }}
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

            <TextField
              label="Reason for Revision *"
              value={revisionForm.reason}
              onChange={(e) => setRevisionForm({ ...revisionForm, reason: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
              placeholder="Explain why this revision is needed..."
              size="small"
              sx={{
                '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
              }}
            />
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
              <p className="dark:text-dark-text-primary light:text-light-text-primary text-base leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>

              {task.dueDate && (
                <div className="mt-4 pt-4 border-t dark:border-dark-border light:border-light-border">
                  <div className="flex items-center gap-2 text-sm dark:text-dark-text-muted light:text-light-text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
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
