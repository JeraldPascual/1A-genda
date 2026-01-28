import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// SVG path for a heart shape (classic heart, not compass)
const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

function drawHeart(ctx, x, y, size, color, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.beginPath();
  const path = new Path2D(HEART_PATH);
  ctx.fill(path);
  ctx.restore();
}

const DEFAULT_COLOR = '#F88379'; // Carnation pink

/**
 * HeartTrail - a reusable mouse trail effect for hearts (or any SVG path)
 * Props:
 *   shapePath: SVG path string (default: heart)
 *   color: fill color (default: red carnation pink)
 *   size: heart size in px (default: 18)
 *   fadeDuration: ms for trail fade (default: 900)
 *   maxTrail: max hearts in trail (default: 18)
 *   enabled: boolean (should render trail)
 */
export default function HeartTrail({
  shapePath = HEART_PATH,
  color = DEFAULT_COLOR,
  size = 18,
  fadeDuration = 900,
  maxTrail = 18,
  enabled = true,
}) {
  const canvasRef = useRef(null);
  const trail = useRef([]); // [{x, y, time}]

  useEffect(() => {
    if (!enabled) return;
    const handleMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      trail.current.push({ x, y, time: Date.now() });
      if (trail.current.length > maxTrail) trail.current.shift();
    };
    const handleTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        trail.current.push({ x, y, time: Date.now() });
        if (trail.current.length > maxTrail) trail.current.shift();
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleTouch);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, [enabled, maxTrail]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let running = true;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      trail.current = trail.current.filter(
        (pt) => now - pt.time < fadeDuration
      );
      trail.current.forEach((pt, i) => {
        const age = now - pt.time;
        const opacity = 0.3 * (1 - age / fadeDuration);
        if (opacity > 0) {
          drawHeart(ctx, pt.x, pt.y, size, color, opacity);
        }
      });
      if (running) requestAnimationFrame(render);
    }
    render();
    return () => {
      running = false;
      window.removeEventListener('resize', resize);
    };
  }, [enabled, color, size, fadeDuration]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden="true"
    />
  );
}

HeartTrail.propTypes = {
  shapePath: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
  fadeDuration: PropTypes.number,
  maxTrail: PropTypes.number,
  enabled: PropTypes.bool,
};
