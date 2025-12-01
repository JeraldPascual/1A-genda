import { useState, useEffect } from 'react';
import { Card, CardContent, Button, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Plus, Send, Calendar, BookOpen, Bell, CheckCircle, Clock, X } from 'lucide-react';
import { createContentSubmissionRequest, getContentSubmissionRequests } from '../utils/firestore';
import { useAuth } from '../context/AuthContext';

const ContentSubmissionPanel = () => {
  const { user, userData } = useAuth();
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [formData, setFormData] = useState({
    contentType: 'task',
    // Task fields
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'medium',
    targetBatch: 'both',
    // Announcement fields
    announcementTitle: '',
    announcementMessage: '',
    announcementType: 'info',
    // Common
    reason: '',
  });

  useEffect(() => {
    loadMyRequests();
    // Poll for updates every 5 seconds to see status changes from admin
    const interval = setInterval(loadMyRequests, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadMyRequests = async () => {
    if (!user) return;
    const requests = await getContentSubmissionRequests({ userId: user.uid });
    setMyRequests(requests);
  };

  const resetForm = () => {
    setFormData({
      contentType: 'task',
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      priority: 'medium',
      targetBatch: 'both',
      announcementTitle: '',
      announcementMessage: '',
      announcementType: 'info',
      reason: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      alert('Please provide a reason for this submission');
      return;
    }

    if (formData.contentType === 'task' && !formData.title.trim()) {
      alert('Please provide a task title');
      return;
    }

    if (formData.contentType === 'announcement' && !formData.announcementTitle.trim()) {
      alert('Please provide an announcement title');
      return;
    }

    setSubmitting(true);
    try {
      const requestData = {
        userId: user.uid,
        userBatch: userData?.batch || 'unknown',
        contentType: formData.contentType,
        reason: formData.reason,
      };

      if (formData.contentType === 'task') {
        Object.assign(requestData, {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          priority: formData.priority,
          targetBatch: formData.targetBatch,
        });
      } else {
        Object.assign(requestData, {
          announcementTitle: formData.announcementTitle,
          announcementMessage: formData.announcementMessage,
          announcementType: formData.announcementType,
        });
      }

      const result = await createContentSubmissionRequest(requestData);

      if (result.success) {
        setSubmitSuccess(true);
        await loadMyRequests();
        setTimeout(() => {
          setShowSubmissionForm(false);
          setSubmitSuccess(false);
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      alert('Failed to submit request');
    }
    setSubmitting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Submit New Content Button */}
      <Card className="dark:!bg-transparent light:!bg-blue-600">
        <CardContent className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:!text-white mb-1">
                Submit New Content
              </h3>
              <p className="text-sm dark:text-dark-text-muted light:!text-white/80">
                Propose new tasks or announcements for the class
              </p>
            </div>
            <Button
              variant="contained"
              startIcon={<Plus className="w-5 h-5" />}
              onClick={() => setShowSubmissionForm(true)}
              sx={{
                backgroundColor: '#8b5cf6',
                '&:hover': { backgroundColor: '#7c3aed' },
              }}
            >
              Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Submissions */}
      {myRequests.length > 0 && (
        <Card className="dark:!bg-transparent light:!bg-blue-600">
          <CardContent className="!p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-dark-text-primary light:!text-white">
                My Submissions ({myRequests.length})
              </h3>
              {myRequests.length > 5 && (
                <Button
                  size="small"
                  onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                  sx={{
                    color: 'var(--color-primary)',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {showAllSubmissions ? 'Show Less' : `View All (${myRequests.length})`}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {(showAllSubmissions ? myRequests : myRequests.slice(0, 5)).map(request => (
                <div
                  key={request.id}
                  className="dark:bg-slate-800/50 light:!bg-blue-700 rounded-lg p-4 border dark:border-slate-700/50 light:!border-blue-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {request.contentType === 'task' ? (
                        <BookOpen className="w-5 h-5 dark:text-primary-400 light:!text-white" />
                      ) : (
                        <Bell className="w-5 h-5 dark:text-purple-400 light:!text-white" />
                      )}
                      <span className="font-semibold dark:text-dark-text-primary light:!text-white">
                        {request.contentType === 'task' ? request.title : request.announcementTitle}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(request)}
                    className="text-xs font-medium dark:text-sky-400 light:!text-white dark:hover:text-sky-300 light:hover:!text-blue-100 transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Form Dialog */}
      <Dialog
        open={showSubmissionForm}
        onClose={() => setShowSubmissionForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-400" />
            <span>Submit New Content</span>
          </div>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            pt: 2,
            pb: 1,
            maxHeight: { xs: '60vh', sm: '65vh', md: '70vh' },
            overflowY: 'auto',
          }}
        >
          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
              <p className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary">
                Submission Received!
              </p>
              <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted mt-2">
                Admin will review your submission shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <TextField
                select
                label="Content Type"
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                  '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                }}
              >
                <MenuItem value="task">Task</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
              </TextField>

              {formData.contentType === 'task' ? (
                <>
                  <TextField
                    label="Task Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                    required
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  />
                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    sx={{
                      mb: 2,
                      width: '100%',
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  />
                  <TextField
                    select
                    label="Subject *"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    fullWidth
                    required
                    size="small"
                    sx={{
                      mb: 2,
                      width: '100%',
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  >
                    <MenuItem value="">Select a subject</MenuItem>
                    <MenuItem value="IT 105 - Computer Programming 2">IT 105 - Computer Programming 2 (Major)</MenuItem>
                    <MenuItem value="PAL 101 - Panitikan at Lipunan">PAL 101 - Panitikan at Lipunan</MenuItem>
                    <MenuItem value="IT 107 - Human-Computer Interaction">IT 107 - Human-Computer Interaction (Major)</MenuItem>
                    <MenuItem value="IT 104 - Discrete Mathematics">IT 104 - Discrete Mathematics</MenuItem>
                    <MenuItem value="IT 106 - Platform Technologies">IT 106 - Platform Technologies (Major)</MenuItem>
                    <MenuItem value="PE 11 - PATHFIT 2">PE 11 - PATHFIT 2</MenuItem>
                    <MenuItem value="UTS 101 - Understanding the Self">UTS 101 - Understanding the Self</MenuItem>
                    <MenuItem value="NSTP 11 - National Service Training Program">NSTP 11 - National Service Training Program</MenuItem>
                  </TextField>
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Due Date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                        '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      select
                      label="Priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                      select
                      label="Target Batch"
                      value={formData.targetBatch}
                      onChange={(e) => setFormData({ ...formData, targetBatch: e.target.value })}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                        '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                      }}
                    >
                      <MenuItem value="both">Both Batches</MenuItem>
                      <MenuItem value="1A1">1A1 Only</MenuItem>
                      <MenuItem value="1A2">1A2 Only</MenuItem>
                    </TextField>
                  </div>
                </>
              ) : (
                <>
                  <TextField
                    label="Announcement Title *"
                    value={formData.announcementTitle}
                    onChange={(e) => setFormData({ ...formData, announcementTitle: e.target.value })}
                    fullWidth
                    required
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  />
                  <TextField
                    label="Message *"
                    value={formData.announcementMessage}
                    onChange={(e) => setFormData({ ...formData, announcementMessage: e.target.value })}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  />
                  <TextField
                    select
                    label="Type"
                    value={formData.announcementType}
                    onChange={(e) => setFormData({ ...formData, announcementType: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': { color: 'var(--color-text-primary)' },
                      '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
                    }}
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="celebration">Celebration</MenuItem>
                  </TextField>
                </>
              )}

              <TextField
                label="Reason for Submission *"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                fullWidth
                multiline
                rows={2}
                required
                placeholder="Why should this content be added?"
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
        {!submitSuccess && (
          <DialogActions sx={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)',
            p: 2
          }}>
            <Button
              onClick={() => setShowSubmissionForm(false)}
              sx={{ color: 'var(--color-text-muted)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting || !formData.reason.trim()}
              sx={{
                backgroundColor: '#8b5cf6',
                '&:hover': { backgroundColor: '#7c3aed' },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Submission Details Dialog */}
      {selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedSubmission.contentType === 'task' ? (
                  <BookOpen className="w-5 h-5 text-blue-400" />
                ) : (
                  <Bell className="w-5 h-5 text-purple-400" />
                )}
                <span>{selectedSubmission.contentType === 'task' ? selectedSubmission.title : selectedSubmission.announcementTitle}</span>
              </div>
              <span className={`text-xs font-semibold capitalize px-3 py-1 rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                {selectedSubmission.status}
              </span>
            </div>
          </DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              pt: 3,
              pb: 2,
              maxHeight: { xs: '60vh', sm: '65vh', md: '70vh' },
              overflowY: 'auto',
            }}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted mb-2">
                  Content Type
                </h4>
                <p className="dark:text-dark-text-primary light:text-light-text-primary capitalize">
                  {selectedSubmission.contentType}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted mb-2">
                  {selectedSubmission.contentType === 'task' ? 'Description' : 'Message'}
                </h4>
                <p className="dark:text-dark-text-primary light:text-light-text-primary whitespace-pre-wrap">
                  {selectedSubmission.contentType === 'task' ? selectedSubmission.description : selectedSubmission.announcementMessage}
                </p>
              </div>

              {selectedSubmission.contentType === 'task' && (
                <>
                  {selectedSubmission.subject && (
                    <div>
                      <h4 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted mb-2">
                        Subject
                      </h4>
                      <p className="dark:text-dark-text-primary light:text-light-text-primary">
                        {selectedSubmission.subject}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.dueDate && (
                    <div>
                      <h4 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted mb-2">
                        Due Date
                      </h4>
                      <p className="dark:text-dark-text-primary light:text-light-text-primary">
                        {new Date(selectedSubmission.dueDate.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.priority && (
                    <div>
                      <h4 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted mb-2">
                        Priority
                      </h4>
                      <p className="dark:text-dark-text-primary light:text-light-text-primary capitalize">
                        {selectedSubmission.priority}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div>
                <h4 className="text-sm font-semibold dark:text-dark-text-muted light:text-light-text-muted mb-2">
                  Reason for Submission
                </h4>
                <p className="dark:text-dark-text-primary light:text-light-text-primary whitespace-pre-wrap">
                  {selectedSubmission.reason}
                </p>
              </div>

              {selectedSubmission.adminNote && (
                <div className="p-3 dark:bg-slate-700/50 light:bg-blue-600 rounded-lg">
                  <h4 className="text-sm font-semibold dark:text-amber-400 light:text-white mb-2">
                    Admin Note
                  </h4>
                  <p className="dark:text-dark-text-primary light:text-white whitespace-pre-wrap">
                    {selectedSubmission.adminNote}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions sx={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)',
            padding: '16px 24px'
          }}>
            <Button
              onClick={() => setSelectedSubmission(null)}
              variant="contained"
              sx={{
                backgroundColor: '#8b5cf6',
                '&:hover': { backgroundColor: '#7c3aed' },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default ContentSubmissionPanel;
