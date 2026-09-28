import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { trackEvent, throttle } from './core';

export const useTracking = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lastPathRef = useRef(location.pathname);
  const pageEnterTimeRef = useRef(Date.now());
  const highestScrollRef = useRef(0);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  // Global Click Tracking
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find closest button or link
      const clickable = target.closest('button, a');
      if (clickable) {
        const elementText = clickable.textContent?.trim() || clickable.getAttribute('aria-label') || clickable.tagName;
        trackEvent('click', window.location.pathname, elementText.substring(0, 50));
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Global Scroll Tracking (Throttled)
  useEffect(() => {
    highestScrollRef.current = 0; // reset on new page mount

    const handleScroll = throttle(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      
      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);
      
      // Track at 25%, 50%, 75%, 100%
      const thresholds = [25, 50, 75, 100];
      for (const threshold of thresholds) {
        if (scrollPercentage >= threshold && highestScrollRef.current < threshold) {
          highestScrollRef.current = threshold;
          trackEvent('scroll', window.location.pathname, undefined, { percentage: threshold });
        }
      }
    }, 500);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Page View, Time Spent, Back Navigation
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Time spent on previous page
    if (lastPathRef.current !== currentPath) {
      const timeSpentSec = Math.floor((Date.now() - pageEnterTimeRef.current) / 1000);
      trackEvent('time_spent', lastPathRef.current, undefined, { duration_seconds: timeSpentSec });
    }

    // Back Navigation
    if (navigationType === 'POP' && lastPathRef.current !== currentPath) {
      trackEvent('back_navigation', currentPath, undefined, { from_page: lastPathRef.current });
    }

    // Page View
    trackEvent('page_view', currentPath);

    lastPathRef.current = currentPath;
    pageEnterTimeRef.current = Date.now();
    highestScrollRef.current = 0;
  }, [location.pathname, navigationType]);

  // Idle and Mouse Activity Tracking
  useEffect(() => {
    const IDLE_TIMEOUT_MS = 5000;

    const resetIdle = () => {
      if (isIdleRef.current) {
        isIdleRef.current = false;
        trackEvent('idle_end', window.location.pathname);
      }
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      idleTimeoutRef.current = setTimeout(() => {
        isIdleRef.current = true;
        trackEvent('idle_start', window.location.pathname);
      }, IDLE_TIMEOUT_MS);
    };

    const handleActivity = throttle(() => {
      resetIdle();
      // Periodically record mouse activity (e.g. every 10 seconds of active moving)
      // For this phase, we rely on the idle logic to capture "mouse_idle_duration"
    }, 1000);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    resetIdle();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  return { trackEvent };
};

// Component to wrap the app and initialize tracking
export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useTracking();
  return <>{children}</>;
};
