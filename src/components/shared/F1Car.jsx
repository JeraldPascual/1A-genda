import { useRef } from 'react';
import gsap from 'gsap';

const F1Car = ({ className, onClick }) => {
  const carRef = useRef(null);

  const handleClick = (e) => {
    if (onClick) onClick(e);

    // Simple "drive off" animation
    if (carRef.current) {
      gsap.to(carRef.current, {
        x: 200,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(carRef.current, { x: -200, opacity: 0 });
          gsap.to(carRef.current, { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
        }
      });
    }
  };

  return (
    <div
      ref={carRef}
      className={`relative cursor-pointer transition-transform hover:scale-110 active:scale-95 ${className}`}
      onClick={handleClick}
      title="Vroom! (Click me)"
    >
      <svg viewBox="0 0 200 60" className="w-32 h-10 drop-shadow-lg">
        {/* McLaren F1 Style Car (Papaya Orange) */}
        <g>
          {/* Wheels */}
          <circle cx="40" cy="45" r="12" fill="#111" />
          <circle cx="160" cy="45" r="12" fill="#111" />
          <circle cx="40" cy="45" r="5" fill="#333" stroke="#ff8000" strokeWidth="2" />
          <circle cx="160" cy="45" r="5" fill="#333" stroke="#ff8000" strokeWidth="2" />

          {/* Body Main */}
          <path d="M20 40 L 50 40 L 60 30 L 120 30 L 130 20 L 150 20 L 170 35 L 190 35 L 190 45 L 30 45 Z" fill="#FF8000" />
        
          {/* Cockpit */}
          <path d="M90 30 L 100 20 L 120 20 L 115 30 Z" fill="#111" />

          {/* Rear Wing */}
          <path d="M20 25 L 15 15 L 45 15 L 40 25 Z" fill="#111" />
          <path d="M15 15 L 15 35" stroke="#111" strokeWidth="3" />

          {/* Front Wing */}
          <path d="M170 40 L 195 40 L 195 45 L 175 45 Z" fill="#111" />

          {/* Details/Sponsors */}
          <path d="M70 35 L 110 35" stroke="#111" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};

export default F1Car;
