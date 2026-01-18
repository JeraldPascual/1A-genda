/**
 * RequestableTaskCard component displays a task with the ability for students to request changes or submit attachments.
 * Handles file uploads, request status, and integrates with Firestore for request persistence.
 *
 * Props:
 * - task (object): The task data to display.
 * - userBatch (string): The student's batch.
 * - userId (string): The student's user ID.
 * - existingRequest (object): Existing request data, if any.
 *
 * Usage:
 * Use this component in the Kanban board or task lists to allow students to request task revisions.
 *
 * Avoid mutating the task or request objects directly or bypassing the provided upload/request logic to prevent bugs.
 */
import { useState } from 'react';
import { Card, CardContent, Button, Chip } from '@mui/material';
import { Calendar, BookOpen, Send, CheckCircle, Clock, Upload, Paperclip, X as XIcon, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { createTaskRequest } from '../../utils/firestore';
import { uploadFile, formatFileSize } from '../../utils/fileUpload';

const RequestableTaskCard = ({ task, userBatch, userId, existingRequest }) => {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(!!existingRequest);
  const [requestStatus, setRequestStatus] = useState(existingRequest?.status || null);
  const [reason, setReason] = useState("");
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

  const handleRequestAccess = async () => {
    setRequesting(true);
    try {
      const result = await createTaskRequest({
        taskId: task.id,
        userId: userId,
        userBatch: userBatch,
        taskBatch: task.batch,
        taskTitle: task.title,
        taskSubject: task.subject,
        reason: reason || `Student from batch ${userBatch} requesting access to ${task.batch} task`,
        attachments: attachments.length > 0 ? attachments : [],
      });

      if (result.success) {
        setRequested(true);
        setRequestStatus('pending');
      }
    } catch (error) {
      console.error('Error requesting task access:', error);
    }
    setRequesting(false);
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

  const getStatusDisplay = () => {
    if (requestStatus === 'approved') {
      return (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Request Approved</span>
        </div>
      );
    }
    if (requestStatus === 'pending' || requested) {
      return (
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>Request Pending</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={`mb-3! transition-all! duration-200! ${getPriorityColor(task.priority)} opacity-70 hover:opacity-100 max-w-full dark:bg-transparent! light:bg-white`}
      sx={{
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
    >
      <CardContent className="p-4!">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold dark:text-dark-text-primary light:text-light-text-primary line-clamp-2 flex-1">
            {task.title}
          </h3>
          <Chip
            label={task.batch}
            size="small"
            sx={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          />
        </div>

        {task.description && (
          <p className="text-sm dark:text-dark-text-muted light:text-light-text-muted mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs dark:text-dark-text-muted light:text-light-text-muted">
          {task.subject && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{task.subject}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

          <div className="p-3 dark:bg-primary-900 light:bg-gray-100 bg-opacity-20 border dark:border-primary-500 light:border-gray-200 border-opacity-30 rounded-lg mb-3">
          <p className="text-xs dark:text-primary-300 light:text-light-text-primary leading-relaxed">
            <strong>Different Batch Task:</strong> This task is assigned to batch <strong>{task.batch}</strong>.
            {userBatch && ` You are in batch ${userBatch}.`} You can request access if you need to work on this task.
          </p>
        </div>

        {getStatusDisplay() ? (
          getStatusDisplay()
        ) : (
          <>
            {/* Only show reason field for 1A2 users */}
            {userBatch === '1A2' && (
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1 dark:text-dark-text-muted light:text-light-text-primary">Reason for requesting this task</label>
                <textarea
                  className="w-full rounded border border-slate-400 dark:bg-slate-800 dark:text-dark-text-primary light:bg-white light:text-black p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={2}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Why do you need access to this task?"
                  disabled={requesting || requested}
                  style={{ marginBottom: 8 }}
                />
              </div>
            )}

            {/* File Upload Section - only for 1A2 */}
            {userBatch === '1A2' && (
              <div className="mb-3">
                <label className="text-xs font-medium mb-2 dark:text-sky-400 light:text-blue-600 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Attach Files (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  onChange={handleFileUpload}
                  disabled={uploading || requesting || requested}
                  className="hidden"
                  id={`file-upload-${task.id}`}
                />
                <label
                  htmlFor={`file-upload-${task.id}`}
                  className={`block w-full text-center px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    uploading || requesting || requested
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
                          disabled={requesting || requested}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                        >
                          <XIcon className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Button
              variant="outlined"
              fullWidth
              onClick={handleRequestAccess}
              disabled={requesting || requested || uploading || (userBatch === '1A2' && !reason.trim())}
              startIcon={<Send className="w-4 h-4" />}
              sx={{
                borderColor: 'rgba(59, 130, 246, 0.5)',
                color: '#60a5fa',
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.8)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {requesting ? 'Requesting...' : 'Request Access'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestableTaskCard;
