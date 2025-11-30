import { useEffect, useState, useRef } from 'react';
import { getActiveAnnouncements } from '../utils/firestore';
import { Megaphone, AlertTriangle, PartyPopper, Sparkles, ChevronDown, X } from 'lucide-react';
import gsap from 'gsap';

const AnnouncementPanel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getActiveAnnouncements();
    setAnnouncements(data);
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
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-sky-400" />
        <h3 className="text-xl font-bold dark:text-dark-text-primary light:text-light-text-primary flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-sky-400" />
          <span>Important Announcements</span>
        </h3>
      </div>
      {announcements.map((announcement, index) => (
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
            </div>
            <p className="dark:text-dark-text-primary light:!text-white text-base leading-relaxed break-words overflow-wrap-anywhere">
              {isLongDescription(announcement.message)
                ? truncateText(announcement.message)
                : announcement.message}
            </p>
            {isLongDescription(announcement.message) && (
              <button
                onClick={() => setSelectedAnnouncement(announcement)}
                className="mt-3 flex items-center gap-2 text-sm font-semibold dark:text-sky-400 light:!text-white dark:hover:text-sky-300 light:hover:!text-blue-100 transition-colors"
              >
                <span>Read More</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Modal for full description */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)}>
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
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="dark:text-dark-text-primary light:text-light-text-primary text-lg leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                {selectedAnnouncement.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementPanel;
