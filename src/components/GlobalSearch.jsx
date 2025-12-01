import { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, BookOpen, Megaphone, FileText } from 'lucide-react';
import { getAllGlobalTasks, getActiveAnnouncements, getContentSubmissionRequests } from '../utils/firestore';
import { useAuth } from '../context/AuthContext';

const GlobalSearch = ({ isOpen, onClose }) => {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], announcements: [], submissions: [] });
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({ tasks: [], announcements: [], submissions: [] });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setResults({ tasks: [], announcements: [], submissions: [] });
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tasksData, announcementsData, submissionsData] = await Promise.all([
        getAllGlobalTasks(),
        getActiveAnnouncements(),
        getContentSubmissionRequests()
      ]);

      // Filter tasks by batch
      const userBatch = userData?.batch;
      const filteredTasks = tasksData.filter(task =>
        !task.batch || task.batch === 'all' || task.batch === userBatch
      );

      setAllData({
        tasks: filteredTasks,
        announcements: announcementsData,
        submissions: submissionsData
      });
    } catch (error) {
      console.error('Error loading search data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ tasks: [], announcements: [], submissions: [] });
      return;
    }

    const query = searchQuery.toLowerCase();

    // Search tasks
    const taskResults = allData.tasks.filter(task =>
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.subject?.toLowerCase().includes(query)
    );

    // Search announcements
    const announcementResults = allData.announcements.filter(announcement =>
      announcement.title?.toLowerCase().includes(query) ||
      announcement.message?.toLowerCase().includes(query)
    );

    // Search submissions
    const submissionResults = allData.submissions.filter(submission =>
      submission.title?.toLowerCase().includes(query) ||
      submission.description?.toLowerCase().includes(query)
    );

    setResults({
      tasks: taskResults.slice(0, 5),
      announcements: announcementResults.slice(0, 5),
      submissions: submissionResults.slice(0, 5)
    });
  }, [searchQuery, allData]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalResults = results.tasks.length + results.announcements.length + results.submissions.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl dark:bg-dark-bg-secondary light:bg-light-bg-secondary rounded-xl shadow-2xl border dark:border-dark-border light:border-light-border overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b dark:border-dark-border light:border-light-border">
          <Search className="w-5 h-5 dark:text-dark-text-muted light:text-light-text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, announcements, submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none dark:text-dark-text-primary light:text-light-text-primary placeholder:dark:text-dark-text-muted placeholder:light:text-light-text-muted text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-md hover:dark:bg-dark-bg-tertiary hover:light:bg-light-bg-tertiary transition-colors"
            >
              <X className="w-4 h-4 dark:text-dark-text-muted light:text-light-text-muted" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 dark:text-dark-text-muted light:text-light-text-muted">
              <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-8 dark:text-dark-text-muted light:text-light-text-muted">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Type to search tasks, announcements, and submissions</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 dark:text-dark-text-muted light:text-light-text-muted">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-dark-text-muted light:text-light-text-muted mb-2 flex items-center gap-2">
                    <ListTodo className="w-4 h-4" />
                    Tasks ({results.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {results.tasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary border dark:border-dark-border light:border-light-border hover:dark:border-primary-600 hover:light:border-primary-600 transition-all cursor-pointer"
                        onClick={onClose}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary text-sm">
                            {task.title}
                          </h4>
                          {task.priority && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs dark:text-dark-text-secondary light:text-light-text-secondary line-clamp-1 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs dark:text-dark-text-muted light:text-light-text-muted">
                          {task.subject && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {task.subject}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {results.announcements.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-dark-text-muted light:text-light-text-muted mb-2 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Announcements ({results.announcements.length})
                  </h3>
                  <div className="space-y-2">
                    {results.announcements.map(announcement => (
                      <div
                        key={announcement.id}
                        className="p-3 rounded-lg dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary border dark:border-dark-border light:border-light-border hover:dark:border-primary-600 hover:light:border-primary-600 transition-all cursor-pointer"
                        onClick={onClose}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary text-sm">
                            {announcement.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            announcement.type === 'urgent' ? 'bg-red-500 text-white' :
                            announcement.type === 'celebration' ? 'bg-green-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {announcement.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs dark:text-dark-text-secondary light:text-light-text-secondary line-clamp-2">
                          {announcement.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions */}
              {results.submissions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-dark-text-muted light:text-light-text-muted mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submissions ({results.submissions.length})
                  </h3>
                  <div className="space-y-2">
                    {results.submissions.map(submission => (
                      <div
                        key={submission.id}
                        className="p-3 rounded-lg dark:bg-dark-bg-tertiary light:bg-light-bg-tertiary border dark:border-dark-border light:border-light-border hover:dark:border-primary-600 hover:light:border-primary-600 transition-all cursor-pointer"
                        onClick={onClose}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary text-sm">
                            {submission.title}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            submission.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {submission.status.toUpperCase()}
                          </span>
                        </div>
                        {submission.description && (
                          <p className="text-xs dark:text-dark-text-secondary light:text-light-text-secondary line-clamp-2">
                            {submission.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t dark:border-dark-border light:border-light-border dark:bg-dark-bg-primary/50 light:bg-light-bg-primary/50">
          <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted text-center">
            Press <kbd className="px-2 py-1 rounded bg-dark-bg-tertiary border border-dark-border">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

// Missing import for ListTodo
import { ListTodo } from 'lucide-react';

export default GlobalSearch;
