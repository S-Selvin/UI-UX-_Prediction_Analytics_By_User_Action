import type { TrackingEvent, EventType, SessionSummary } from './types';

const STORAGE_KEY = 'shopsense_analytics_events';
const USER_ID_KEY = 'shopsense_user_id';
const SESSION_ID_KEY = 'shopsense_session_id';
const SESSION_START_KEY = 'shopsense_session_start';

// Generate a random ID (e.g. U8F32K)
const generateId = (prefix: string) => {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomChars}`;
};

export const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateId('U');
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateId('S');
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    sessionStorage.setItem(SESSION_START_KEY, new Date().toISOString());
  }
  return sessionId;
};

export const getSessionStartTime = (): string => {
  return sessionStorage.getItem(SESSION_START_KEY) || new Date().toISOString();
};

export interface ShopSenseConfig {
  websiteId: string;
  goal?: string;
}

let currentConfig: ShopSenseConfig = { websiteId: 'demo-site', goal: 'PURCHASE' };

export const ShopSense = {
  init: (config: ShopSenseConfig) => {
    currentConfig = { ...currentConfig, ...config };
  },
  getConfig: () => currentConfig
};

export const trackEvent = (
  event_type: EventType,
  page: string,
  element?: string,
  metadata?: Record<string, any>
): TrackingEvent => {
  const event: TrackingEvent = {
    event_id: `E${Math.floor(Math.random() * 10000)}`,
    user_id: getUserId(),
    session_id: getSessionId(),
    website_id: currentConfig.websiteId,
    timestamp: new Date().toISOString(),
    event_type,
    page,
    element,
    metadata
  };

  try {
    const existingEventsJson = localStorage.getItem(STORAGE_KEY);
    const existingEvents: TrackingEvent[] = existingEventsJson ? JSON.parse(existingEventsJson) : [];
    existingEvents.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingEvents));
    
    // Dispatch custom event for the Event Monitor to update in real-time
    window.dispatchEvent(new CustomEvent('shopsense_event_tracked', { detail: event }));
  } catch (error) {
    console.error('Failed to store tracking event', error);
  }

  // Safe Dual-Write: Asynchronously send to backend without blocking
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).catch(() => {
      // Catch network errors silently to avoid spamming the console during normal operation if backend is down
      console.warn('[ShopSense] Backend unavailable. Event retained in localStorage only.');
    });
  } catch (error) {
    // Failsafe catch block
  }

  return event;
};

export const getEvents = (): TrackingEvent[] => {
  try {
    const eventsJson = localStorage.getItem(STORAGE_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch {
    return [];
  }
};

export const clearEvents = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('shopsense_events_cleared'));
};

export const getSessionSummary = (): SessionSummary => {
  const events = getEvents().filter(e => e.session_id === getSessionId());
  
  let totalIdleTimeMs = 0;
  let lastIdleStart: Date | null = null;

  const pagesViewed = new Set(events.filter(e => e.event_type === 'page_view').map(e => e.page)).size;
  const productsViewed = new Set(events.filter(e => e.event_type === 'page_view' && e.page.includes('/products/')).map(e => e.page)).size;

  events.forEach(e => {
    if (e.event_type === 'idle_start') {
      lastIdleStart = new Date(e.timestamp);
    } else if (e.event_type === 'idle_end' && lastIdleStart) {
      totalIdleTimeMs += new Date(e.timestamp).getTime() - lastIdleStart.getTime();
      lastIdleStart = null;
    }
  });

  const sessionStart = new Date(getSessionStartTime()).getTime();
  const sessionDurationSec = Math.floor((new Date().getTime() - sessionStart) / 1000);

  return {
    sessionId: getSessionId(),
    totalEvents: events.length,
    pagesViewed,
    totalClicks: events.filter(e => e.event_type === 'click').length,
    totalScrolls: events.filter(e => e.event_type === 'scroll').length,
    totalIdleTimeSec: Math.floor(totalIdleTimeMs / 1000),
    backNavigationCount: events.filter(e => e.event_type === 'back_navigation').length,
    productsViewed,
    cartActions: events.filter(e => ['add_to_cart', 'remove_from_cart', 'quantity_increase', 'quantity_decrease'].includes(e.event_type)).length,
    sessionDurationSec,
  };
};

// Throttle utility
export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
