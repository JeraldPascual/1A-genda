import { useState } from 'react';
import { Card, CardContent, Button, Chip } from '@mui/material';
import { Calendar, BookOpen, Send, CheckCircle, Clock } from 'lucide-react';
import { createTaskRequest } from '../utils/firestore';

const RequestableTaskCard = ({ task, userBatch, userId, existingRequest }) => {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(!!existingRequest);
  const [requestStatus, setRequestStatus] = useState(existingRequest?.status || null);

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
        reason: `Student from batch ${userBatch} requesting access to ${task.batch} task`,
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
      className={`!mb-3 !transition-all !duration-200 ${getPriorityColor(task.priority)} opacity-70 hover:opacity-100 max-w-full dark:!bg-transparent light:!bg-blue-600`}
      sx={{
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
    >
      <CardContent className="!p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold dark:text-dark-text-primary light:!text-white line-clamp-2 flex-1">
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
          <p className="text-sm dark:text-dark-text-muted light:!text-white/90 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs dark:text-dark-text-muted light:!text-white">
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

        <div className="p-3 dark:bg-primary-900 light:!bg-blue-700 bg-opacity-20 border dark:border-primary-500 light:!border-blue-500 border-opacity-30 rounded-lg mb-3">
          <p className="text-xs dark:text-primary-300 light:!text-white leading-relaxed">
            <strong>Different Batch Task:</strong> This task is assigned to batch <strong>{task.batch}</strong>.
            {userBatch && ` You are in batch ${userBatch}.`} You can request access if you need to work on this task.
          </p>
        </div>

        {getStatusDisplay() ? (
          getStatusDisplay()
        ) : (
          <Button
            variant="outlined"
            fullWidth
            onClick={handleRequestAccess}
            disabled={requesting || requested}
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
        )}
      </CardContent>
    </Card>
  );
};

export default RequestableTaskCard;
