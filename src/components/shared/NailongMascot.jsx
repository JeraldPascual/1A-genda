import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasSpecialEffects } from '../../utils/specialEffects';

const NailongMascot = () => {
  const { userData } = useAuth();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hasSpecialEffects(userData)) return;

    const showMascot = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Show for 3 seconds
    };

    // Initial delay before first appearance
    const initialDelay = setTimeout(() => {
      showMascot();
      // Set interval for recurring pop-ups
      const interval = setInterval(() => {
        showMascot();
      }, 6000);

      return () => clearInterval(interval);
    }, 1000); // Wait 2s before first appearance

    return () => clearTimeout(initialDelay);
  }, [userData]);

  // Don't render if not special user
  if (!hasSpecialEffects(userData)) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed left-4 bottom-20 z-40 transition-all duration-700 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-20 opacity-0 scale-75'
      }`}
      style={{
        transformOrigin: 'bottom left',
        pointerEvents: 'none',
      }}
    >

      <div
        className="relative"
        style={{
          width: '120px',
          height: '150px',
          transform: 'rotate(7deg)',
          filter: 'drop-shadow(0 8px 16px rgba(234, 160, 28, 0.45))',
        }}
      >
        <svg
          width="120"
          height="150"
          viewBox="0 0 120 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-bounce-gentle"
        >
          <defs>
            <linearGradient id="nailongBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBC02D" />
              <stop offset="50%" stopColor="#F9A825" />
              <stop offset="100%" stopColor="#F57F17" />
            </linearGradient>
            <linearGradient id="nailongBelly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFECB3" />
              <stop offset="100%" stopColor="#FFD54F" />
            </linearGradient>
            <radialGradient id="nailongShine" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#FFE082" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FBC02D" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="86" cy="96" rx="12" ry="8" fill="url(#nailongBody)" />
          <ellipse cx="92" cy="92" rx="10" ry="7" fill="url(#nailongBody)" />
          <ellipse cx="96" cy="88" rx="8" ry="6" fill="url(#nailongBody)" />
          <ellipse cx="99" cy="84" rx="6" ry="5" fill="url(#nailongBody)" />
          <ellipse cx="101" cy="81" rx="4" ry="4" fill="url(#nailongBody)" />
          <path
            d="M 30 115 Q 26 128 28 135 Q 30 140 40 140 Q 48 140 48 135 Q 48 128 42 115 Z"
            fill="url(#nailongBody)"
          />
          <ellipse cx="34" cy="139" rx="8" ry="4" fill="#F57F17" />
          <ellipse cx="28" cy="137" rx="1.5" ry="2" fill="#3E2723" />
          <ellipse cx="34" cy="136" rx="1.5" ry="2" fill="#3E2723" />
          <ellipse cx="40" cy="137" rx="1.5" ry="2" fill="#3E2723" />

          <path
            d="M 58 117 Q 56 128 58 135 Q 60 140 70 140 Q 78 140 78 135 Q 76 128 70 117 Z"
            fill="url(#nailongBody)"
          />
          <ellipse cx="68" cy="139" rx="8" ry="4" fill="#F57F17" />
          <ellipse cx="62" cy="137" rx="1.5" ry="2" fill="#3E2723" />
          <ellipse cx="68" cy="136" rx="1.5" ry="2" fill="#3E2723" />
          <ellipse cx="74" cy="137" rx="1.5" ry="2" fill="#3E2723" />

          <path
            d="M 18 50 Q 12 65 15 88 Q 18 115 32 120 Q 50 125 68 120 Q 88 115 90 98 Q 92 70 87 50 Q 80 35 55 30 Q 30 33 18 50 Z"
            fill="url(#nailongBody)"
          />

          <path
            d="M 30 55 Q 28 70 30 85 Q 40 90 50 85 Q 55 70 50 55 Q 45 45 30 55 Z"
            fill="url(#nailongShine)"
          />

          <ellipse cx="52" cy="88" rx="25" ry="24" fill="url(#nailongBelly)" />

          <path
            d="M 18 75 Q 6 72 -5 70 Q -12 68 -14 72 Q -16 76 -12 80 Q -8 84 0 86 Q 8 87 16 85 Z"
            fill="url(#nailongBody)"
          />
          <ellipse cx="-9" cy="73" rx="10" ry="8" fill="url(#nailongBody)" />
          <ellipse cx="-14" cy="70" rx="1" ry="1.5" fill="#3E2723" />
          <ellipse cx="-9" cy="68" rx="1" ry="1.5" fill="#3E2723" />
          <ellipse cx="-4" cy="70" rx="1" ry="1.5" fill="#3E2723" />

          <path
            d="M 85 65 Q 97 62 108 60 Q 115 58 117 62 Q 119 66 115 70 Q 111 74 103 76 Q 95 77 87 75 Z"
            fill="url(#nailongBody)"
          />
          <ellipse cx="116" cy="61" rx="10" ry="8" fill="url(#nailongBody)" />
          <ellipse cx="111" cy="58" rx="1" ry="1.5" fill="#3E2723" />
          <ellipse cx="116" cy="56" rx="1" ry="1.5" fill="#3E2723" />
          <ellipse cx="121" cy="58" rx="1" ry="1.5" fill="#3E2723" />

          <ellipse cx="52" cy="38" rx="40" ry="39"  fill="url(#nailongBody)" />

          <ellipse cx="42" cy="30" rx="14" ry="10" fill="url(#nailongShine)" />

          <ellipse cx="52" cy="52" rx="12" ry="8" fill="#F9A825" />

          <circle cx="38" cy="35" r="9" fill="#FFFFFF" />
          <circle cx="66" cy="35" r="9" fill="#FFFFFF" />
          <circle cx="40" cy="36" r="6" fill="#7FFF00" />
          <circle cx="64" cy="36" r="6" fill="#7FFF00" />
          <circle cx="41" cy="37" r="3.5" fill="#004D40" />
          <circle cx="63" cy="37" r="3.5" fill="#004D40" />
          <circle cx="38" cy="33" r="2.5" fill="#FFFFFF" />
          <circle cx="62" cy="33" r="2.5" fill="#FFFFFF" />


          <path
            d="M 45 55 Q 52 59 59 55"
            stroke="#E65100"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          <circle cx="8" cy="48" r="2" fill="#FFECB3" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="108" cy="45" r="2" fill="#FFECB3" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(5deg);
          }
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NailongMascot;
