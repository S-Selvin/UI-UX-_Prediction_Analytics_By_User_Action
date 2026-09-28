import { comparePeriods } from '../beforeAfterMeasurement';
import type { BehavioralFeatures, TrackingEvent, AbandonmentPrediction } from '../types';
import type { SessionData } from '../dashboardUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    // @ts-ignore
    process.exit(1);
  }
};

console.log('Running Before/After Measurement Tests...');

const createFeatures = (score: number): BehavioralFeatures => ({
  sessionId: 's1',
  sessionDuration: 300,
  pagesViewed: 5,
  totalClicks: 20,
  totalScrolls: 10,
  totalIdleTime: 120,
  backNavigationCount: 4,
  productsViewed: 3,
  cartActions: 0,
  clickFrequency: 0.5,
  scrollDepth: 60,
  averageTimePerPage: 60,
  engagementScore: score,
  activityScore: score,
  hesitationScore: 100 - score,
  navigationConfusionScore: 100 - score,
  behaviorStatus: 'ACTIVE',
  reasons: []
});

const createPrediction = (risk: number): AbandonmentPrediction => ({
  riskScore: risk,
  riskLevel: risk > 70 ? 'HIGH' : 'LOW',
  confidence: 80,
  reasons: [],
  signals: {
    hesitation: 50,
    inactivity: 20,
    navigationConfusion: 50,
    engagement: 50,
    activity: 50
  }
});

const baseEvents: TrackingEvent[] = [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'page_view', page: '/' },
  { event_id: 'e2', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'click', page: '/' }
];

const completedEvents: TrackingEvent[] = [
  ...baseEvents,
  { event_id: 'e3', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'order_completed', page: '/checkout' }
];

const createSession = (score: number, risk: number, completed = false, isLive = false): SessionData => ({
  sessionId: 's_' + score + '_' + risk,
  userId: 'u1',
  isLive,
  latestPage: '/',
  lastActivity: new Date(),
  events: completed ? completedEvents : [...baseEvents, { event_id: 'ex', user_id: 'u', session_id: 's', timestamp: new Date().toISOString(), event_type: 'page_view', page: '/x' }],
  features: createFeatures(score),
  prediction: createPrediction(risk)
});

// CASE 1: Empty inputs -> INSUFFICIENT_DATA
const emptyRes = comparePeriods([], []);
assert(emptyRes.status === 'INSUFFICIENT_DATA', 'Empty periods should yield INSUFFICIENT_DATA');

// CASE 2: All Positive -> IMPROVED
// Before: low score (worse health), high risk, not completed.
// After: high score (better health), low risk, completed.
const beforeBad = [createSession(20, 80)];
const afterGood = [createSession(80, 20, true)];
const impRes = comparePeriods(beforeBad, afterGood);
assert(impRes.status === 'IMPROVED', 'Should be IMPROVED');
assert(impRes.uxHealth.change! > 0, 'UX Health should increase');
assert(impRes.averageRisk.change! < 0, 'Risk should decrease');
assert(impRes.goalCompletionRate.change! > 0, 'Completion should increase');
assert(impRes.explanation.includes('positively'), 'Explanation should match IMPROVED');

// CASE 3: All Negative -> DECLINED
const decRes = comparePeriods(afterGood, beforeBad);
assert(decRes.status === 'DECLINED', 'Should be DECLINED');
assert(decRes.uxHealth.change! < 0, 'UX Health should decrease');
assert(decRes.averageRisk.change! > 0, 'Risk should increase');

// CASE 4: Mixed
// Health goes up (positive), but Risk goes up (negative)
const beforeMixed = [createSession(50, 50)];
const afterMixed = [createSession(80, 80)];
const mixRes = comparePeriods(beforeMixed, afterMixed);
assert(mixRes.status === 'MIXED', 'Should be MIXED');
assert(mixRes.explanation.includes('Some metrics improved'), 'Explanation should match MIXED');

// CASE 5: All Neutral
const neutRes = comparePeriods(beforeMixed, beforeMixed);
assert(neutRes.status === 'MIXED', 'Should be MIXED for neutral');
assert(neutRes.explanation.includes('neutral'), 'Explanation should mention neutral');

// CASE 6: Missing metric handling (Null never converted to 0)
// To trigger null Goal Completion, we need sessions that are live (not eligible for abandonment)
const liveSession = createSession(50, 50, false, true);
const liveRes = comparePeriods([liveSession], [liveSession]);
assert(liveRes.goalCompletionRate.before === null, 'Goal completion should be null for live sessions');
assert(liveRes.goalCompletionRate.change === null, 'Change should be null, not 0');

// CASE 7: Input immutability
const cloneBefore = JSON.stringify(beforeBad);
comparePeriods(beforeBad, afterGood);
assert(JSON.stringify(beforeBad) === cloneBefore, 'Inputs must not be mutated');

// CASE 8: No causal/financial claims
assert(!impRes.explanation.toLowerCase().includes('revenue'), 'No revenue claims');
assert(!impRes.explanation.toLowerCase().includes('caused by'), 'No causal claims');

console.log('✅ All Phase 17 Before/After Measurement tests passed!');
