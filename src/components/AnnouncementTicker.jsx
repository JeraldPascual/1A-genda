import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { getActiveAnnouncements } from '../utils/firestore';
import { Megaphone, AlertTriangle, PartyPopper, X } from 'lucide-react';

const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const tickerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await getActiveAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    if (announcements.length === 0 || !tickerRef.current) return;

    // infinite scroll animation for the announcement headline to keep cm aware
    const ticker = tickerRef.current;
    const tickerWidth = ticker.offsetWidth;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;

    // Calculate duration based on content width - FASTER speed
    const baseSpeed = 80;
    const duration = tickerWidth / baseSpeed;

    const tl = gsap.timeline({ repeat: -1 });

    tl.to(ticker, {
      x: -tickerWidth / 2,
      duration: Math.max(duration, 10),
      ease: 'none',
    }).set(ticker, {
      x: 0,
    });

    return () => tl.kill();
  }, [announcements]);

  // Show "No announcements" message when empty
  if (announcements.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 py-2 overflow-hidden shadow-lg">
        <div className="flex items-center justify-center">
          <span className="flex items-center text-slate-300 text-sm">
            <Megaphone className="w-4 h-4 mr-2" />
            No announcements at the moment.
          </span>
        </div>
      </div>
    );
  }

  const getAnnouncementStyle = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600';
      case 'celebration':
        return 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600';
      default:
        return 'bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600';
    }
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'celebration': return <PartyPopper className="w-5 h-5" />;
      default: return <Megaphone className="w-5 h-5" />;
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

  // Duplicate announcements for seamless loop
  const duplicatedAnnouncements = [...announcements, ...announcements];

  return (
    <>
      <div className={`${getAnnouncementStyle(announcements[0]?.type || 'info')} py-2 overflow-hidden shadow-lg`}>
        <div ref={containerRef} className="relative">
          <div ref={tickerRef} className="flex whitespace-nowrap">
            {duplicatedAnnouncements.map((announcement, index) => (
              <div
                key={`${announcement.id}-${index}`}
                className="inline-flex items-center mx-10 text-white cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <span className="mr-2 flex-shrink-0">
                  {getAnnouncementIcon(announcement.type)}
                </span>
                <span className="font-semibold text-sm mr-2 flex-shrink-0">
                  {announcement.title}
                </span>
                <span className="text-xs opacity-95">
                  Click to view details
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)}>
          <div className="glass-effect rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="sticky top-4 float-right z-10 p-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-lg transition-colors shadow-lg mr-4 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className={`p-6 flex items-start gap-4`}>
              <div className={`shrink-0 p-3 rounded-xl ${getAnnouncementTextColor(selectedAnnouncement.type)} bg-opacity-10 ${getGlowColor(selectedAnnouncement.type)} shadow-lg`}>
                {getAnnouncementIcon(selectedAnnouncement.type)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className={`text-2xl font-bold ${getAnnouncementTextColor(selectedAnnouncement.type)} wrap-break-word`}>
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
            <div className="p-6">
              <p className="dark:text-dark-text-primary light:text-light-text-primary text-lg leading-relaxed whitespace-pre-wrap wrap-break-word overflow-wrap-anywhere">
                {selectedAnnouncement.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementTicker;
