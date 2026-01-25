/**
 * AttachmentList component displays a list of file attachments with icons, download options, and fullscreen image viewing.
 * Handles various file types, normalizes file objects, and manages UI state for menus and fullscreen mode.
 *
 * Props:
 * - attachments (array): List of file objects to display. Each should have url, name, size, and type.
 * - className (string): Optional additional class names for the container.
 *
 * Usage:
 * Use this component to render attachments for announcements, tasks, or submissions. Supports images, PDFs, Office docs, and more.
 *
 * Avoid mutating the attachments array or bypassing the provided download/fullscreen handlers to prevent UI bugs.
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, FileText, FileSpreadsheet, File as FileIcon, Download, MoreVertical, X } from 'lucide-react';
import { formatFileSize } from '../../utils/fileUpload';

const AttachmentList = ({ attachments = [], className = '' }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    if (fullscreenImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [fullscreenImage]);

  if (!attachments || attachments.length === 0) return null;

  // Normalize file object to handle both old and new structures
  const normalizeFile = (file) => {
    if (!file) return { url: '', name: 'Unknown', size: 0, type: 'application/octet-stream' };
    return {
      url: file.url || '',
      name: file.name || file.fileName || 'Unknown',
      size: file.size || file.fileSize || 0,
      type: file.type || file.fileType || 'application/octet-stream'
    };
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return FileIcon;
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('word')) return FileText;
    if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet;
    return FileIcon;
  };

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveMenu(null);
  };

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  const openFullscreen = (file) => {
    setFullscreenImage(file);
    setActiveMenu(null);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-sm font-semibold dark:text-dark-text-primary light:text-light-text-primary flex items-center gap-2 mb-3">
        <FileIcon className="w-4 h-4" />
        Attachments ({attachments.length})
      </h4>
      <div className="flex flex-col gap-4">
        {attachments.map((attachment, index) => {
          const file = normalizeFile(attachment);
          const Icon = getFileIcon(file.type);
          const isImage = file.type && file.type.startsWith('image/');

          return (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden b-2order dark:border-slate-700/50 light:border-blue-200"
            >
              {isImage ? (
                <div
                  className="relative w-full cursor-pointer overflow-auto max-h-[60vh]"
                  onClick={() => openFullscreen(file)}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-auto max-h-[60vh] object-contain"
                    loading="lazy"
                  />
                  {/* Three-dot menu button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(index);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full transition-all z-20 dark:bg-black/50 dark:hover:bg-black/70 light:bg-white/70 light:hover:bg-white/80"
                    title="Options"
                    aria-label="Attachment options"
                    aria-haspopup="menu"
                    aria-expanded={activeMenu === index}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleMenu(index);
                      }
                    }}
                  >
                    <MoreVertical className="w-4 h-4 dark:text-white light:text-light-text-primary" />
                  </button>

                  {/* Dropdown menu */}
                  {activeMenu === index && (
                    <div
                      className="absolute top-12 right-2 bg-white dark:bg-slate-800 border dark:border-slate-700 light:border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-30"
                      onClick={(e) => e.stopPropagation()}
                      role="menu"
                      aria-label="Attachment options menu"
                      tabIndex={-1}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file.url, file.name);
                        }}
                        className="w-full px-4 py-2 text-left text-sm dark:text-dark-text-primary light:text-light-text-primary hover:bg-sky-500/10 flex items-center gap-2"
                        role="menuitem"
                        tabIndex={0}
                        aria-label={`Download ${file.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownload(file.url, file.name);
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  )}

                  {/* Filename overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3 pointer-events-none">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-300">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                </div>
              ) : (
                <div className="relative p-4 dark:bg-slate-900/40 light:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center dark:bg-sky-500/20 light:bg-gray-100 rounded">
                      <Icon className="w-6 h-6 dark:text-sky-400 light:text-light-text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-dark-text-primary light:text-light-text-primary truncate">
                        {file.name}
                      </p>
                      <p className="text-xs dark:text-dark-text-muted light:text-light-text-secondary">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Three-dot menu button for non-images */}
                  <button
                    onClick={() => toggleMenu(index)}
                    className="absolute top-2 right-2 p-2 hover:bg-sky-500/20 rounded-full transition-all"
                    title="Options"
                    aria-label="Attachment options"
                    aria-haspopup="menu"
                    aria-expanded={activeMenu === index}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleMenu(index);
                      }
                    }}
                  >
                    <MoreVertical className="w-4 h-4 dark:text-dark-text-primary light:text-light-text-primary" />
                  </button>

                  {/* Dropdown menu */}
                  {activeMenu === index && (
                    <div className="absolute top-12 right-2 bg-white dark:bg-slate-800 border dark:border-slate-700 light:border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-10"
                      role="menu"
                      aria-label="Attachment options menu"
                      tabIndex={-1}
                    >
                      <button
                        onClick={() => handleDownload(file.url, file.name)}
                        className="w-full px-4 py-2 text-left text-sm dark:text-dark-text-primary light:text-light-text-primary hover:bg-sky-500/10 flex items-center gap-2"
                        role="menuitem"
                        tabIndex={0}
                        aria-label={`Download ${file.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownload(file.url, file.name);
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Click outside to close menu */}
      {activeMenu !== null && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
          tabIndex={0}
          aria-label="Close attachment menu"
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setActiveMenu(null);
          }}
        />
      )}

      {/* Fullscreen image modal */}
      {fullscreenImage && createPortal(
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={closeFullscreen}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeFullscreen();
          }}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
            title="Close"
            aria-label="Close fullscreen image"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeFullscreen();
              }
            }}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={fullscreenImage.url}
            alt={fullscreenImage.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg">
            <p className="text-white text-sm font-medium">
              {fullscreenImage.name}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AttachmentList;
