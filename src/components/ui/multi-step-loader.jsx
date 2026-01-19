import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import gsap from 'gsap';

const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn('w-6 h-6 ', className)}>
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn('w-6 h-6 ', className)}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

/**
 * Renders the core checklist UI for the multi-step loader.
 * @param {Object} props
 * @param {{text: string}[]} props.loadingStates - Array of loading step objects.
 * @param {number} [props.value=0] - Current active step index.
 * @param {React.RefObject} props.listRef - Ref for the checklist container.
 * @returns {JSX.Element}
 */
const LoaderCore = ({ loadingStates, value = 0, listRef }) => {
  return (
    <div ref={listRef} className="flex relative flex-col justify-center max-w-xl mx-auto h-full">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacityClass = value === index ? 'opacity-100' : distance === 1 ? 'opacity-70' : 'opacity-40';

        return (
          <div
            key={index}
            className={cn('msl-item text-left flex gap-2 mb-4', opacityClass)}
          >
            <div>
              {index > value && <CheckIcon className="text-black dark:text-white" />}
              {index <= value && (
                <CheckFilled className={cn('text-black dark:text-white', value === index && 'text-black dark:text-lime-500 opacity-100')} />
              )}
            </div>
            <span className={cn('text-black dark:text-white', value === index && 'text-black dark:text-lime-500')}>{loadingState.text}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Displays a full-screen animated multi-step loader with checklist and progress animation.
 * Handles first-time viewer animation, looping, and disables background scroll while active.
 * @param {Object} props
 * @param {{text: string}[]} props.loadingStates - Array of loading step objects.
 * @param {boolean} props.loading - Whether the loader is visible/active.
 * @param {number} [props.duration=2000] - Duration per step in ms.
 * @param {boolean} [props.loop=true] - Whether to loop the animation.
 * @param {function} [props.onAnimationComplete] - Callback when animation completes.
 * @param {boolean} [props.forceRunOnce=false] - Force run the full sequence once.
 * @returns {JSX.Element|null}
 */
export const MultiStepLoader = ({ loadingStates, loading, duration = 2000, loop = true, onAnimationComplete, forceRunOnce = false }) => {
  const [currentState, setCurrentState] = useState(0);
  const listRef = useRef(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isFirstTimeKnown, setIsFirstTimeKnown] = useState(false);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }

    // If this is the first time run, the sequence is handled by a dedicated effect below.
    if (isFirstTime) return;

    const timeout = setTimeout(() => {
      setCurrentState((prevState) => (loop ? (prevState === loadingStates.length - 1 ? 0 : prevState + 1) : Math.min(prevState + 1, loadingStates.length - 1)));
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration, isFirstTime]);

  // Animate the active checklist item when the currentState changes
  useEffect(() => {
    if (!loading || !listRef.current) return;
    const items = listRef.current.querySelectorAll('.msl-item');
    if (!items || items.length === 0) return;

    const idx = Math.max(0, Math.min(currentState, items.length - 1));
    const active = items[idx];

    // animate the active item in
    if (active) {
      // reset other items' inline transforms/opacities so animation is consistent
      items.forEach((it) => {
        gsap.set(it, { clearProps: 'transform,opacity' });
      });

      gsap.fromTo(
        active,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, [currentState, loading]);

  // detect first-time viewers using localStorage and run a full sequence once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const seen = localStorage.getItem('msl_seen_v1');
      setIsFirstTime(!seen);
    } catch (e) {
      setIsFirstTime(false);
    } finally {
      setIsFirstTimeKnown(true);
    }
  }, []);

  // Run the full sequential animation for first-time viewers (overrides the looping behaviour)
  useEffect(() => {
    if (!loading) return;
    // Wait until we know whether this is first-time; don't prematurely notify parent
    if (!isFirstTimeKnown) return;
    if (!(isFirstTime || forceRunOnce)) {
      // Not first time and not forced - immediately notify parent animation is effectively done
      if (onAnimationComplete) onAnimationComplete();
      return;
    }

    let mounted = true;

    // For first-time viewers or forced runs, run a single sequence through the states.
    // Use a moderate per-step duration to avoid too-fast or too-slow blocking (cap at 400ms).
    const stepMs = Math.min(duration, 400);

    const runSequence = async () => {
      for (let i = 0; i < loadingStates.length; i++) {
        if (!mounted) return;
        // debug log

        setCurrentState(i);
        // wait for step duration
        await new Promise((r) => setTimeout(r, stepMs));
      }

      // small pause, then mark seen and notify parent
      await new Promise((r) => setTimeout(r, 350));
      if (!mounted) return;
      try {
        localStorage.setItem('msl_seen_v1', '1');
      } catch (e) {
        // ignore
      }

      if (onAnimationComplete) onAnimationComplete();
    };

    // Safety: ensure animation finishes or times out after a reasonable total duration
    const maxTotal = loadingStates.length * stepMs + 2000; // extra buffer
    const watchdog = setTimeout(() => {
      if (mounted && onAnimationComplete) onAnimationComplete();
    }, maxTotal);

    runSequence().finally(() => clearTimeout(watchdog));

    return () => {
      mounted = false;
    };
  }, [loading, isFirstTime, loadingStates, duration, onAnimationComplete]);

  // Prevent background scrolling while loader is visible
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev || '';
    }
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl">
      <div className="h-96 relative">
        <LoaderCore value={currentState} loadingStates={loadingStates} listRef={listRef} />
      </div>

      <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
    </div>
  );
};

export default MultiStepLoader;
