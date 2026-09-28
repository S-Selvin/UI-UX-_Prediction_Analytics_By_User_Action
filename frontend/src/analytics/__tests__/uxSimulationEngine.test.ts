import { simulateUXImprovement, aggregateSimulations } from '../uxSimulationEngine';
import { predictAbandonment } from '../abandonmentPredictor';
import type { BehavioralFeatures, TrackingEvent } from '../types';
import type { SessionData } from '../dashboardUtils';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    // @ts-ignore
    process.exit(1);
  }
};

console.log('Running UX Simulation Engine Deterministic Tests...');

const createBaseFeatures = (): BehavioralFeatures => ({
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
  engagementScore: 40,
  activityScore: 40,
  hesitationScore: 80,
  navigationConfusionScore: 80,
  behaviorStatus: 'HESITATING',
  reasons: []
});


const createBaseEvents = (): TrackingEvent[] => [
  { event_id: 'e1', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'page_view', page: '/' },
  { event_id: 'e2', user_id: 'u1', session_id: 's1', timestamp: new Date().toISOString(), event_type: 'back_navigation', page: '/' }
];

const features = createBaseFeatures();
const events = createBaseEvents();
const prediction = predictAbandonment(features, events);

// CASE 1: Unknown problem ID returns null safely
assert(simulateUXImprovement(features, prediction, events, 'unknown-id', 50) === null, 'Unknown problem ID should return null');

// CASE 2: Improvement Level 0 returns null
assert(simulateUXImprovement(features, prediction, events, 'improve-navigation-clarity', 0) === null, 'Level 0 should return null');

// CASE 3: Improvement changes deterministic fields (Navigation)
const simNav = simulateUXImprovement(features, prediction, events, 'improve-navigation-clarity', 50)!;
assert(simNav.simulated.navigationConfusion === 40, 'Navigation confusion should decrease by 50%');
assert(simNav.current.navigationConfusion === 80, 'Current navigation confusion should remain untouched');
assert(simNav.current.riskLevel === 'HIGH', 'Original risk should be HIGH (or based on prediction)');

// CASE 4: Original objects are not mutated
assert(features.navigationConfusionScore === 80, 'Original feature object MUST NOT be mutated');
assert(events.length === 2, 'Original events MUST NOT be mutated');

// CASE 5: Improvement changes deterministic fields (Hesitation)
const simHes = simulateUXImprovement(features, prediction, events, 'reduce-user-hesitation', 25)!;
assert(simHes.simulated.hesitation === 60, 'Hesitation should decrease by 25%');

// CASE 6: Inactivity improvement
const simIdle = simulateUXImprovement(features, prediction, events, 're-engage-inactive-users', 100)!;
assert(simIdle.simulated.activity === 100, 'Activity should max out at 100');
assert(simIdle.current.activity === 40, 'Original activity untouched');

// CASE 7: Aggregation
const session1: SessionData = {
  sessionId: 's1', userId: 'u1', isLive: true, latestPage: '/', lastActivity: new Date(),
  events: events, features: features, prediction: prediction
};
const features2 = { ...features, hesitationScore: 60 };
const prediction2 = predictAbandonment(features2, events);
const session2: SessionData = {
  sessionId: 's2', userId: 'u1', isLive: true, latestPage: '/', lastActivity: new Date(),
  events: events, features: features2, prediction: prediction2
};
const aggregated = aggregateSimulations([session1, session2], 'reduce-user-hesitation', 50)!;

assert(aggregated.current.hesitation === 70, 'Aggregated current hesitation should average to 70');
assert(aggregated.simulated.hesitation === 35, 'Aggregated simulated hesitation should average to 35');
assert(aggregated.estimatedChanges.riskScoreChange <= 0, 'Risk score should decrease or stay the same (Got: ' + aggregated.estimatedChanges.riskScoreChange + ')');

// CASE 8: No financial claims
assert(!aggregated.explanation.includes('revenue') && !aggregated.explanation.includes('conversion rate'), 'No financial claims should be made');

console.log('✅ All Phase 16 UX Simulation Engine tests passed!');
