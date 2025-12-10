import { useEffect, useState, useRef } from 'react';
import { getActiveAnnouncements, createAnnouncementRevisionRequest } from '../utils/firestore';
import { Megaphone, AlertTriangle, PartyPopper, Sparkles, ChevronDown, X, Download, Paperclip, FileEdit, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress, IconButton, Typography } from '@mui/material';
import { exportAnnouncementsToPDF } from '../utils/pdfExport';
import { uploadFile } from '../utils/fileUpload';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import AttachmentList from './AttachmentList';
import MarkdownDisplay from './MarkdownDisplay';
import MarkdownEditor from './MarkdownEditor';

const AnnouncementPanel = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [revisionDialog, setRevisionDialog] = useState({ open: false, announcement: null });
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionAttachments, setRevisionAttachments] = useState([]);
  const [uploadingRevision, setUploadingRevision] = useState(false);
  const [uploadRevisionProgress, setUploadRevisionProgress] = useState(0);
  const [uploadRevisionError, setUploadRevisionError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const cardRefs = useRef([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getActiveAnnouncements();
    setAnnouncements(data);
  };

  const handleExportAnnouncements = () => {
    exportAnnouncementsToPDF(announcements);
  };

  const handleRequestRevision = (announcement) => {
    setRevisionDialog({ open: true, announcement });
    setRevisionReason('');
    setRevisionAttachments([]);
    setUploadRevisionError('');
  };

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

        if (result.success) {
          uploadedFiles.push(result.file);
          processedSize += file.size;
        } else {
          throw new Error(result.error);
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

  const handleSubmitRevisionRequest = async () => {
    if (!revisionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for the revision request' });
      return;
    }

    if (uploadingRevision) {
      setMessage({ type: 'error', text: 'Please wait for all files to finish uploading' });
      return;
    }

    const result = await createAnnouncementRevisionRequest({
      announcementId: revisionDialog.announcement.id,
      announcementTitle: revisionDialog.announcement.title,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email,
      reason: revisionReason,
      attachments: revisionAttachments,
    });

    if (result.success) {
      setMessage({ type: 'success', text: 'Revision request submitted successfully!' });
      setRevisionDialog({ open: false, announcement: null });
      setRevisionReason('');
      setRevisionAttachments([]);
      setUploadRevisionError('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: result.error });
    }
  };

  useEffect(() => {
    // Animate cards on mount
    cardRefs.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: index * 0.1,
            ease: 'back.out(1.7)',
          }
        );
      }
    });
  }, [announcements]);

  const isLongDescription = (text) => {
    return text && text.length > 150;
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getAnnouncementStyle = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-gradient-to-br from-rose-600/20 via-red-600/15 to-rose-600/20 border-rose-500/40 shadow-rose-500/20';
      case 'celebration':
        return 'bg-gradient-to-br from-emerald-600/20 via-green-600/15 to-emerald-600/20 border-emerald-500/40 shadow-emerald-500/20';
      default:
        return 'bg-gradient-to-br from-sky-600/20 via-blue-600/15 to-sky-600/20 border-sky-500/40 shadow-sky-500/20';
    }
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-6 h-6" />;
      case 'celebration': return <PartyPopper className="w-6 h-6" />;
      default: return <Megaphone className="w-6 h-6" />;
    }
  };

  const getAnnouncementTextColor = (type) => {
    switch (type) {
      case 'urgent': return 'text-rose-400';
      case 'celebration': return 'text-emerald-400';
      default: return 'text-sky-400';
    }
  };

  const getGlowColor = (type) => {
    switch (type) {
      case 'urgent': return 'shadow-rose-500/30';
      case 'celebration': return 'shadow-emerald-500/30';
      default: return 'shadow-sky-500/30';
    }
  };

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-sky-400" />
          <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-sky-400" />
            <span>Important Announcements</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            startIcon={<Download className="w-4 h-4" />}
            onClick={handleExportAnnouncements}
            sx={{
              color: 'var(--color-primary)',
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(56, 189, 248, 0.1)'
              }
            }}
          >
            Export PDF
          </Button>
          {announcements.length > 5 && (
            <Button
              size="small"
              onClick={() => setShowAllAnnouncements(true)}
              sx={{
                color: 'var(--color-primary)',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {`View All (${announcements.length})`}
            </Button>
          )}
        </div>
      </div>
      {announcements.slice(0, 5).map((announcement, index) => (
        <div
          key={announcement.id}
          ref={(el) => (cardRefs.current[index] = el)}
          className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-2xl p-6 flex items-start gap-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className={`shrink-0 p-3 rounded-xl ${getAnnouncementTextColor(announcement.type)} dark:bg-opacity-10 light:!bg-blue-700 ${getGlowColor(announcement.type)} shadow-lg`}>
            {getAnnouncementIcon(announcement.type)}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h4 className={`font-bold text-lg ${getAnnouncementTextColor(announcement.type)} light:!text-white break-words`}>
                {announcement.title}
              </h4>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                announcement.type === 'urgent'
                  ? 'dark:bg-rose-500/20 light:!bg-blue-700 dark:text-rose-400 light:!text-white border dark:border-rose-500/30 light:!border-blue-500'
                  : announcement.type === 'celebration'
                  ? 'dark:bg-emerald-500/20 light:!bg-blue-700 dark:text-emerald-400 light:!text-white border dark:border-emerald-500/30 light:!border-blue-500'
                  : 'dark:bg-sky-500/20 light:!bg-blue-700 dark:text-sky-400 light:!text-white border dark:border-sky-500/30 light:!border-blue-500'
              }`}>
                {announcement.type.toUpperCase()}
              </span>
              {announcement.attachments && announcement.attachments.length > 0 && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap dark:bg-purple-500/20 light:!bg-blue-700 dark:text-purple-400 light:!text-white border dark:border-purple-500/30 light:!border-blue-500 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {announcement.attachments.length} {announcement.attachments.length === 1 ? 'file' : 'files'}
                </span>
              )}
            </div>
            <div className="dark:text-dark-text-muted light:!text-white/80 text-sm mb-3 line-clamp-2 break-words markdown-card-preview">
              <MarkdownDisplay content={announcement.message} />
            </div>
            <button
              onClick={() => setSelectedAnnouncement(announcement)}
              className="flex items-center gap-2 text-sm font-semibold dark:text-sky-400 light:!text-white dark:hover:text-sky-300 light:hover:!text-blue-100 transition-colors"
            >
              <span>Read More</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Modal for full description */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)}>
          <div className="glass-effect rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            {/* Sticky Close Button */}
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="sticky top-4 float-right z-10 p-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-lg transition-colors shadow-lg mr-4 backdrop-blur-sm"
            >
              <X className="w-5 h-5 dark:text-dark-text-muted light:text-light-text-muted" />
            </button>

            <div className={`p-6 flex items-start gap-4`}>
              <div className={`shrink-0 p-3 rounded-xl ${getAnnouncementTextColor(selectedAnnouncement.type)} bg-opacity-10 ${getGlowColor(selectedAnnouncement.type)} shadow-lg`}>
                {getAnnouncementIcon(selectedAnnouncement.type)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className={`text-2xl font-bold ${getAnnouncementTextColor(selectedAnnouncement.type)} break-words`}>
                    {selectedAnnouncement.title}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    selectedAnnouncement.type === 'urgent'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : selectedAnnouncement.type === 'celebration'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  }`}>
                    {selectedAnnouncement.type.toUpperCase()}
                  </span>
                  {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      {selectedAnnouncement.attachments.length} {selectedAnnouncement.attachments.length === 1 ? 'file' : 'files'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="dark:text-dark-text-primary light:text-light-text-primary text-lg leading-relaxed">
                <MarkdownDisplay content={selectedAnnouncement.message} />
              </div>
              {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                <AttachmentList attachments={selectedAnnouncement.attachments} />
              )}
              {/* Request Revision Button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="outlined"
                  startIcon={<FileEdit className="w-4 h-4" />}
                  onClick={() => handleRequestRevision(selectedAnnouncement)}
                  sx={{
                    color: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)'
                    }
                  }}
                >
                  Request Revision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Request Dialog */}
      <Dialog
        open={revisionDialog.open}
        onClose={() => setRevisionDialog({ open: false, announcement: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Announcement Revision</DialogTitle>
        <DialogContent>
          {revisionDialog.announcement && (
            <div className="space-y-4 mt-2">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Request a revision for: <strong>{revisionDialog.announcement.title}</strong>
              </Typography>

              <MarkdownEditor
                value={revisionReason}
                onChange={setRevisionReason}
                label="Reason for Revision"
                placeholder="Explain what needs to be revised and why..."
                rows={4}
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
                  >
                    {uploadingRevision ? 'Uploading...' : 'Add Supporting Files'}
                  </Button>
                </label>

                {uploadingRevision && (
                  <div className="mt-2">
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
                  <div className="mt-2 space-y-2">
                    <Typography variant="caption" color="text.secondary">
                      Attached Files:
                    </Typography>
                    {revisionAttachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      >
                        {file.type?.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileIcon className="w-4 h-4 text-gray-500" />
                        )}
                        <Typography variant="caption" sx={{ flex: 1 }}>
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeRevisionAttachment(index)}
                          disabled={uploadingRevision}
                        >
                          <X className="w-4 h-4" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevisionDialog({ open: false, announcement: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRevisionRequest}
            variant="contained"
            disabled={uploadingRevision || !revisionReason.trim()}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Snackbar */}
      {message.text && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      {/* Modal for viewing all announcements */}
      {showAllAnnouncements && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowAllAnnouncements(false)}>
          <div className="glass-effect rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAllAnnouncements(false)}
              className="sticky top-4 float-right z-10 p-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-lg transition-colors shadow-lg mr-4 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Megaphone className="w-6 h-6 text-sky-400" />
                <h3 className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
                  All Announcements ({announcements.length})
                </h3>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="glass-card dark:!bg-transparent light:!bg-blue-600 border-2 dark:border-slate-700 light:!border-blue-500 rounded-2xl p-6 flex items-start gap-4 shadow-lg"
                  >
                    <div className={`shrink-0 p-3 rounded-xl ${getAnnouncementTextColor(announcement.type)} dark:bg-opacity-10 light:!bg-blue-700 ${getGlowColor(announcement.type)} shadow-lg`}>
                      {getAnnouncementIcon(announcement.type)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className={`font-bold text-lg ${getAnnouncementTextColor(announcement.type)} light:!text-white break-words`}>
                          {announcement.title}
                        </h4>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          announcement.type === 'urgent'
                            ? 'dark:bg-rose-500/20 light:!bg-blue-700 dark:text-rose-400 light:!text-white border dark:border-rose-500/30 light:!border-blue-500'
                            : announcement.type === 'celebration'
                            ? 'dark:bg-emerald-500/20 light:!bg-blue-700 dark:text-emerald-400 light:!text-white border dark:border-emerald-500/30 light:!border-blue-500'
                            : 'dark:bg-sky-500/20 light:!bg-blue-700 dark:text-sky-400 light:!text-white border dark:border-sky-500/30 light:!border-blue-500'
                        }`}>
                          {announcement.type.toUpperCase()}
                        </span>
                        {announcement.attachments && announcement.attachments.length > 0 && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap dark:bg-purple-500/20 light:!bg-blue-700 dark:text-purple-400 light:!text-white border dark:border-purple-500/30 light:!border-blue-500 flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {announcement.attachments.length} {announcement.attachments.length === 1 ? 'file' : 'files'}
                          </span>
                        )}
                      </div>
                      <div className="dark:text-dark-text-muted light:!text-white/80 text-sm mb-3 line-clamp-2 break-words markdown-card-preview">
                        <MarkdownDisplay content={announcement.message} />
                      </div>
                      <button
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className="flex items-center gap-2 text-sm font-semibold dark:text-sky-400 light:!text-white dark:hover:text-sky-300 light:hover:!text-blue-100 transition-colors"
                      >
                        <span>Read More</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementPanel;
