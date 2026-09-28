import { aggregateUXProblems } from '../uxProblemCenter';
import type { TrackingEvent, AbandonmentPrediction, BehavioralFeatures, EventType } from '../types';
import type { SessionData } from '../dashboardUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    // @ts-ignore
    process.exit(1);
  }
};

console.log('Running UX Problem Center Deterministic Tests...');

let eventIdCounter = 1;
const createEvent = (type: EventType, timeOffsetSecs: number = 0): TrackingEvent => {
  return {
    event_id: `e${eventIdCounter++}`,
    user_id: 'u1',
    session_id: 's1',
    timestamp: new Date(Date.now() + timeOffsetSecs * 1000).toISOString(),
    event_type: type,
    page: '/test'
  };
};

const createMockSession = (sessionId: string, events: TrackingEvent[]): SessionData => {
  // We mock a simple feature set that triggers known rules
  const features: BehavioralFeatures = {
    sessionId,
    sessionDuration: events.length * 10,
    pagesViewed: 1,
    totalClicks: 0,
    totalScrolls: 0,
    productsViewed: 0,
    cartActions: 0,
    backNavigationCount: events.filter(e => e.event_type === 'back_navigation').length,
    clickFrequency: 0,
    scrollDepth: 0,
    averageTimePerPage: 10,
    engagementScore: 50,
    hesitationScore: 10,
    navigationConfusionScore: events.filter(e => e.event_type === 'back_navigation').length >= 3 ? 100 : 0,
    activityScore: 50,
    totalIdleTime: 0,
    behaviorStatus: 'ENGAGED',
    reasons: []
  };

  const prediction: AbandonmentPrediction = {
    riskScore: 20,
    riskLevel: 'LOW',
    confidence: 80,
    reasons: [],
    signals: {
      hesitation: 10,
      inactivity: 0,
      navigationConfusion: features.navigationConfusionScore,
      engagement: 50,
      activity: 50
    }
  };

  return {
    sessionId,
    userId: 'u1',
    events,
    features,
    prediction,
    isLive: false,
    latestPage: events[events.length - 1]?.page || '/',
    lastActivity: new Date(),
    sessionStatus: 'ENDED',
    startTime: new Date(),
    endTime: new Date()
  };
};

// CASE 1: No recommendations/problems (only healthy)
let sessions: SessionData[] = [
  createMockSession('s1', [createEvent('page_view'), createEvent('click'), createEvent('click'), createEvent('click')])
];
let problems = aggregateUXProblems(sessions);
assert(problems.length === 0, 'Should have empty state when only healthy experience exists');

// CASE 2: One session with Navigation recommendation
sessions = [
  createMockSession('s2', [
    createEvent('page_view'), 
    createEvent('back_navigation'), 
    createEvent('back_navigation'), 
    createEvent('back_navigation')
  ])
];
problems = aggregateUXProblems(sessions);
assert(problems.length === 1, 'Should detect 1 problem');
assert(problems[0].id === 'improve-navigation-clarity', 'Should be navigation problem');
assert(problems[0].affectedSessions === 1, 'Should affect 1 session');

// CASE 3: Two sessions with Navigation recommendation
sessions = [
  createMockSession('s3_1', [
    createEvent('back_navigation'), 
    createEvent('back_navigation'), 
    createEvent('back_navigation')
  ]),
  createMockSession('s3_2', [
    createEvent('back_navigation'), 
    createEvent('back_navigation'), 
    createEvent('back_navigation')
  ])
];
problems = aggregateUXProblems(sessions);
assert(problems[0].affectedSessions === 2, 'Should affect 2 unique sessions');

// CASE 4: One session triggering same recommendation multiple times (simulated by high back count)
sessions = [
  createMockSession('s4', [
    createEvent('back_navigation'), 
    createEvent('back_navigation'), 
    createEvent('back_navigation'),
    createEvent('back_navigation'),
    createEvent('back_navigation')
  ])
];
problems = aggregateUXProblems(sessions);
assert(problems[0].affectedSessions === 1, 'Repeated events in same session must only count as 1 affected session');

// CASE 5: Checkout problem without checkout evidence (should not appear)
sessions = [
  createMockSession('s5', [createEvent('page_view')])
];
problems = aggregateUXProblems(sessions);
assert(!problems.some(p => p.category === 'CHECKOUT'), 'Checkout problem should not appear without checkout events');

// CASE 6: Payment problem without payment event (should not appear)
sessions = [
  createMockSession('s6', [createEvent('checkout_started')])
];
problems = aggregateUXProblems(sessions);
assert(!problems.some(p => p.id === 'reduce-payment-drop-off'), 'Payment problem should not appear without payment events');

// CASE 7: Zero analyzed sessions
problems = aggregateUXProblems([]);
assert(problems.length === 0, 'Zero sessions handled cleanly');

console.log('✅ All Phase 14 UX Problem Center tests passed!');
