import { calculateInteractionFriction } from '../interactionFriction';
import { calculateUXHealth } from '../uxHealth';
import type { TrackingEvent, BehavioralFeatures } from '../types';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    // @ts-ignore
    process.exit(1);
  }
};

const baseBehavior: BehavioralFeatures = {
  sessionId: 'test',
  sessionDuration: 100,
  pagesViewed: 2,
  totalClicks: 10,
  totalScrolls: 5,
  totalIdleTime: 10,
  backNavigationCount: 0,
  productsViewed: 1,
  cartActions: 0,
  clickFrequency: 0.1,
  scrollDepth: 50,
  averageTimePerPage: 50,
  engagementScore: 80,
  activityScore: 80,
  hesitationScore: 20,
  navigationConfusionScore: 10,
  behaviorStatus: 'ENGAGED',
  reasons: []
};

console.log('Running UX Health Deterministic Tests...');

// CASE 1: Healthy browsing
let events: TrackingEvent[] = [{ event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'page_view', page: '/home' }];
let friction = calculateInteractionFriction(events, baseBehavior);
assert(friction.frictionLevel === 'LOW', 'Healthy browsing should have LOW friction');
let health = calculateUXHealth(events, baseBehavior);
assert((health.score || 0) >= 70, 'Healthy browsing should have high UX health');

// CASE 2: Repeated back navigation
events = [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'back_navigation', page: '/products' },
  { event_id: 'e2', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'back_navigation', page: '/home' }
];
friction = calculateInteractionFriction(events, baseBehavior);
assert((friction.frictionScore || 0) > 0, 'Back navigation should increase friction score');
assert(friction.evidence.some(e => e.includes('back navigations detected')), 'Missing evidence for back navigation');

// CASE 3: Long actual inactivity
const ts1 = new Date('2026-09-10T10:00:00Z').getTime();
const ts2 = ts1 + 70000;
events = [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date(ts1).toISOString(), event_type: 'idle_start', page: '/products' },
  { event_id: 'e2', user_id: 'u1', session_id: 's1', timestamp: new Date(ts2).toISOString(), event_type: 'idle_end', page: '/products' }
];
friction = calculateInteractionFriction(events, baseBehavior);
assert((friction.frictionScore || 0) > 0, 'Inactivity should increase friction score');
assert(friction.evidence.some(e => e.includes('idle inactivity')), 'Missing evidence for inactivity');

// CASE 4: Repeated cart changes
events = [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'quantity_increase', page: '/cart' },
  { event_id: 'e2', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'quantity_decrease', page: '/cart' },
  { event_id: 'e3', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'quantity_increase', page: '/cart' }
];
friction = calculateInteractionFriction(events, baseBehavior);
assert((friction.frictionScore || 0) > 0, 'Repeated cart changes should increase friction score');
assert(friction.evidence.some(e => e.includes('cart quantity changes detected')), 'Missing evidence for cart changes');

// CASE 5: Single cart change
events = [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'quantity_increase', page: '/cart' }
];
friction = calculateInteractionFriction(events, baseBehavior);
assert(!friction.evidence.some(e => e.includes('cart quantity changes detected')), 'Single cart change should NOT be reported as friction');

// CASE 6: No data
friction = calculateInteractionFriction([], baseBehavior);
assert(friction.frictionLevel === 'INSUFFICIENT_DATA', 'Empty events should result in INSUFFICIENT_DATA for friction');
health = calculateUXHealth([], baseBehavior);
assert(health.level === 'INSUFFICIENT_DATA', 'Empty events should result in INSUFFICIENT_DATA for health');

// CASE 7: Order completed
events = [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'order_completed', page: '/checkout' }
];
health = calculateUXHealth(events, baseBehavior);
assert((health.score || 0) > 70, 'Completed order should positively impact health');
assert(health.evidence.some(e => e.includes('Order completion event found')), 'Missing evidence for order completion');

console.log('✅ All deterministic tests passed!');
