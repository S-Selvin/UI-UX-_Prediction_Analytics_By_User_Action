import type { TrackingEvent, BehavioralFeatures, BehaviorStatus } from './types';

const CONFUSION_THRESHOLD = 70;
const HESITATION_THRESHOLD = 70;
const ENGAGEMENT_THRESHOLD = 70;
const ACTIVITY_THRESHOLD = 50;

export function analyzeSession(events: TrackingEvent[]): BehavioralFeatures {
  const defaultFeatures: BehavioralFeatures = {
    sessionId: events.length > 0 ? events[0].session_id : 'unknown',
    sessionDuration: 0,
    pagesViewed: 0,
    totalClicks: 0,
    totalScrolls: 0,
    totalIdleTime: 0,
    backNavigationCount: 0,
    productsViewed: 0,
    cartActions: 0,

    clickFrequency: 0,
    scrollDepth: 0,
    averageTimePerPage: 0,

    engagementScore: 0,
    activityScore: 0,
    hesitationScore: 0,
    navigationConfusionScore: 0,

    behaviorStatus: "ACTIVE",
    reasons: []
  };

  if (events.length === 0) return defaultFeatures;

  const firstEventTime = new Date(events[0].timestamp).getTime();
  const lastEventTime = new Date(events[events.length - 1].timestamp).getTime();
  
  // Basic counts
  const pageViews = new Set<string>();
  let totalClicks = 0;
  let totalScrolls = 0;
  let maxScrollDepth = 0;
  let totalIdleTime = 0;
  let backNavigations = 0;
  let productsViewed = 0;
  let cartActions = 0;
  let idleStartMs = 0;

  events.forEach((event) => {
    switch (event.event_type) {
      case 'page_view':
        pageViews.add(event.page);
        if (event.page.includes('/products/')) {
          productsViewed++;
        }
        break;
      case 'click':
        totalClicks++;
        break;
      case 'scroll':
        totalScrolls++;
        if (event.metadata?.percentage) {
          maxScrollDepth = Math.max(maxScrollDepth, event.metadata.percentage);
        }
        break;
      case 'idle_start':
        idleStartMs = new Date(event.timestamp).getTime();
        break;
      case 'idle_end':
        if (idleStartMs > 0) {
          totalIdleTime += (new Date(event.timestamp).getTime() - idleStartMs) / 1000;
          idleStartMs = 0;
        }
        break;
      case 'back_navigation':
        backNavigations++;
        break;
      case 'add_to_cart':
      case 'remove_from_cart':
      case 'quantity_increase':
      case 'quantity_decrease':
        cartActions++;
        break;
    }
  });

  // Calculate session duration safely
  let sessionDuration = (lastEventTime - firstEventTime) / 1000;
  if (sessionDuration <= 0) sessionDuration = 1; // avoid division by zero

  const pagesViewedCount = pageViews.size;
  const clickFrequency = totalClicks / sessionDuration;
  const averageTimePerPage = pagesViewedCount > 0 ? sessionDuration / pagesViewedCount : sessionDuration;

  // Derive Scores (0 - 100)
  
  // Engagement: Clicks, views, cart interactions, scroll depth increase it. Idle time hurts it.
  let engagement = (totalClicks * 2) + (productsViewed * 5) + (cartActions * 10) + (maxScrollDepth * 0.2);
  engagement -= (totalIdleTime * 0.5); // penalize idle time
  const engagementScore = Math.max(0, Math.min(100, Math.round(engagement)));

  // Activity: Interaction frequency
  // Let's say 1 click/scroll every 5 seconds is 100% active -> 0.2 interactions/sec
  const totalInteractions = totalClicks + totalScrolls + cartActions;
  let activity = (totalInteractions / sessionDuration) * 500; // 0.2 * 500 = 100
  const activityScore = Math.max(0, Math.min(100, Math.round(activity)));

  // Hesitation: Idle time and back navigations without progression
  let hesitation = (totalIdleTime * 1) + (backNavigations * 10) + (cartActions > 0 && productsViewed === 0 ? 10 : 0);
  if (averageTimePerPage > 60 && totalClicks < 2) hesitation += 30; // Long time, no action
  const hesitationScore = Math.max(0, Math.min(100, Math.round(hesitation)));

  // Confusion: High back navigations, high page views without cart actions
  let confusion = (backNavigations * 15);
  if (pagesViewedCount > 5 && cartActions === 0) confusion += 40;
  if (pagesViewedCount > 10) confusion += 20;
  const navigationConfusionScore = Math.max(0, Math.min(100, Math.round(confusion)));

  // Behavior Status Logic
  let status: BehaviorStatus = "ACTIVE";
  const reasons: string[] = [];

  if (activityScore < 10 && totalIdleTime > sessionDuration * 0.5 && sessionDuration > 10) {
    status = "INACTIVE";
    reasons.push("User had a long inactive period");
  } else if (navigationConfusionScore >= CONFUSION_THRESHOLD) {
    status = "CONFUSED";
    reasons.push("User navigated backward or switched pages multiple times without progressing");
  } else if (hesitationScore >= HESITATION_THRESHOLD) {
    status = "HESITATING";
    if (totalIdleTime > 30) reasons.push("User had significant idle periods");
    if (averageTimePerPage > 60) reasons.push("User spent significant time on a page with little action");
    if (backNavigations > 0) reasons.push("User navigated backward multiple times");
  } else if (engagementScore >= ENGAGEMENT_THRESHOLD && activityScore >= ACTIVITY_THRESHOLD) {
    status = "ENGAGED";
    reasons.push("User interacted frequently and viewed multiple products");
    if (cartActions > 0) reasons.push("User performed cart actions");
  } else {
    // Normal ACTIVE state
    if (totalClicks > 0) reasons.push("User interacted with the page");
    if (pageViews.size > 1) reasons.push("User navigated between pages");
    if (reasons.length === 0) reasons.push("Session started");
  }

  return {
    sessionId: defaultFeatures.sessionId,
    sessionDuration,
    pagesViewed: pagesViewedCount,
    totalClicks,
    totalScrolls,
    totalIdleTime,
    backNavigationCount: backNavigations,
    productsViewed,
    cartActions,
    clickFrequency,
    scrollDepth: Math.min(100, maxScrollDepth),
    averageTimePerPage,
    engagementScore,
    activityScore,
    hesitationScore,
    navigationConfusionScore,
    behaviorStatus: status,
    reasons
  };
}
