import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasSpecialEffects } from '../../utils/specialEffects';

const BearMascot = () => {
  const { userData } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [message, setMessage] = useState("Keep going! 🐻");

  useEffect(() => {
    if (hasSpecialEffects(userData)) {
      // Delay appearance slightly
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  // Listen for fireworks/completion event
  useEffect(() => {
    const handleCompletion = () => {
      setIsJumping(true);
      setMessage("WOOOO! YIPEEE 🐻");
      setShowMessage(true);
      
      // Stop jumping after 5s (approx fireworks duration)
      setTimeout(() => {
        setIsJumping(false);
        setShowMessage(false);
        setTimeout(() => setMessage("Keep going! 🐻"), 300);
      }, 5000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('allTasksCompleted', handleCompletion);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('allTasksCompleted', handleCompletion);
      }
    };
  }, []);

  // Blink logic
  useEffect(() => {
    if (!isVisible) return;

    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200); // Blink duration

      // Schedule next blink
      const nextBlink = Math.random() * 3000 + 2000; // Random interval 2-5s
      return setTimeout(blinkLoop, nextBlink);
    };

    const timerId = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timerId);
  }, [isVisible]);

  const handleBearClick = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);

    if (!isBlinking) {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }
  };

  if (!hasSpecialEffects(userData) || !isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 right-8 z-50 pointer-events-auto transition-transform duration-300 ease-in-out"
      style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBearClick}
    >
      <div className={`relative w-32 h-32 md:w-40 md:h-40 cursor-pointer group ${isJumping ? 'animate-bounce' : ''}`}>
        {/* Speech Bubble */}
        <div className={`absolute -top-16 right-0 bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-br-none shadow-lg transform transition-all duration-300 origin-bottom-right ${isHovered || showMessage ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <p className="text-sm font-medium text-pink-500 whitespace-nowrap">{message}</p>
        </div>

        {/* Bear SVG */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
          <g transform="translate(0, 20)">
            {/* Body */}
            <path d="M50 120 C 50 120, 20 180, 100 180 C 180 180, 150 120, 150 120" fill="#8d5524" />
            <path d="M85 130 C 85 130, 90 150, 100 150 C 110 150, 115 130, 115 130" fill="#e0ac69" />
            
            {/* Head */}
            <circle cx="100" cy="80" r="50" fill="#8d5524" />
            
            {/* Ears */}
            <circle cx="60" cy="50" r="15" fill="#8d5524" />
            <circle cx="140" cy="50" r="15" fill="#8d5524" />
            <circle cx="60" cy="50" r="8" fill="#e0ac69" />
            <circle cx="140" cy="50" r="8" fill="#e0ac69" />
            
            {/* Eyes - Dynamic based on blinking */}
            {isBlinking ? (
              <>
                <path d="M80 75 Q 85 78 90 75" stroke="#000" strokeWidth="2" fill="none" />
                <path d="M110 75 Q 115 78 120 75" stroke="#000" strokeWidth="2" fill="none" />
              </>
            ) : (
              <>
                <circle cx="85" cy="75" r="5" fill="#000" />
                <circle cx="115" cy="75" r="5" fill="#000" />
              </>
            )}
            
            {/* Snout */}
            <ellipse cx="100" cy="90" rx="15" ry="10" fill="#e0ac69" />
            <ellipse cx="100" cy="86" rx="5" ry="3" fill="#000" />
            
            {/* Mouth */}
            <path d="M95 95 Q 100 100 105 95" stroke="#000" strokeWidth="2" fill="none" />
            
            {/* Blush */}
            <circle cx="70" cy="90" r="5" fill="#ffb7b2" opacity="0.6" />
            <circle cx="130" cy="90" r="5" fill="#ffb7b2" opacity="0.6" />
            
            {/* Paws (holding the edge) */}
            <ellipse cx="60" cy="160" rx="12" ry="15" fill="#8d5524" />
            <ellipse cx="140" cy="160" rx="12" ry="15" fill="#8d5524" />
            <circle cx="60" cy="158" r="8" fill="#e0ac69" />
            <circle cx="140" cy="158" r="8" fill="#e0ac69" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default BearMascot;