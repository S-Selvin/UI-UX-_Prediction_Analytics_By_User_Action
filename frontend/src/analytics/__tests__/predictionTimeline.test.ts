import { buildPredictionTimeline } from '../predictionTimeline';
import { buildUserJourney } from '../userJourney';
import type { TrackingEvent } from '../types';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    // @ts-ignore
    process.exit(1);
  }
};

console.log('Running Prediction Timeline & User Journey Deterministic Tests...');

// Helper to create an event quickly
let eventIdCounter = 1;
const createEvent = (type: any, timeOffsetSecs: number = 0): TrackingEvent => {
  return {
    event_id: `e${eventIdCounter++}`,
    user_id: 'u1',
    session_id: 's1',
    timestamp: new Date(Date.now() + timeOffsetSecs * 1000).toISOString(),
    event_type: type,
    page: '/test'
  };
};

// CASE 1: Normal browsing
let events = [
  createEvent('page_view', 0),
  createEvent('page_view', 10), // changing pages
  createEvent('add_to_cart', 20)
];
let journey = buildUserJourney(events);
assert(journey.length === 3, 'Journey should have 3 steps');
assert(!journey.some(j => j.frictionWarning), 'Journey should have NO fake friction');
let timeline = buildPredictionTimeline(events);
assert(timeline.length === 3, 'Timeline should have checkpoints for meaningful events');
assert(timeline[timeline.length - 1].riskLevel !== 'HIGH', 'Normal browsing risk should not be high');

// CASE 2: Navigation confusion
events = [
  createEvent('page_view', 0),
  createEvent('back_navigation', 10),
  createEvent('page_view', 20),
  createEvent('back_navigation', 30)
];
journey = buildUserJourney(events);
assert(journey.some(j => j.frictionWarning?.includes('Navigation friction')), 'Navigation friction should be detected');
timeline = buildPredictionTimeline(events);
assert(timeline.length === 4, 'Timeline should have 4 points');
assert(timeline[3].riskScore >= timeline[0].riskScore, 'Risk should increase or remain high after confusion');

// CASE 3: Inactivity
events = [
  createEvent('idle_start', 0),
  createEvent('idle_end', 70) // 70s idle
];
journey = buildUserJourney(events);
assert(journey.length === 0, 'Idle events themselves do not create independent journey steps without other interaction');
events = [
  createEvent('page_view', 0),
  createEvent('idle_start', 10),
  createEvent('idle_end', 80),
  createEvent('click', 90) // Not a journey step
];
// If we add another meaningful event, it should carry the inactivity warning
events.push(createEvent('add_to_cart', 100));
journey = buildUserJourney(events);
assert(journey.some(j => j.frictionWarning?.includes('Inactivity friction')), 'Inactivity should be explicitly tracked as friction');

// CASE 4: Cart friction
events = [
  createEvent('add_to_cart', 0),
  createEvent('quantity_increase', 10),
  createEvent('quantity_decrease', 20),
  createEvent('quantity_increase', 30) // 3 changes
];
journey = buildUserJourney(events);
assert(journey.some(j => j.frictionWarning?.includes('Cart friction')), 'Cart friction should be detected');

// CASE 5: Checkout drop-off
events = [
  createEvent('checkout_started', 0),
  createEvent('checkout_form_interaction', 10)
];
journey = buildUserJourney(events);
assert(journey.length === 2, 'Journey should end at the form interaction without fabricating completion');
timeline = buildPredictionTimeline(events);
assert(timeline[1].riskLevel === 'LOW' || timeline[1].riskScore <= 25, 'Early session suppression should maintain low risk initially');

// CASE 6: Payment completion
events = [
  createEvent('checkout_started', 0),
  createEvent('payment_method_selected', 10),
  createEvent('order_completed', 20)
];
timeline = buildPredictionTimeline(events);
assert(timeline[timeline.length - 1].riskScore === 0, 'Final prediction after order completion should be 0');
assert(timeline[timeline.length - 1].riskLevel === 'LOW', 'Final prediction after order completion should be LOW');
journey = buildUserJourney(events);
assert(journey[journey.length - 1].eventType === 'order_completed', 'Journey should clearly show completion');

// CASE 7: Empty session
journey = buildUserJourney([]);
assert(journey.length === 0, 'Empty session returns empty journey');
timeline = buildPredictionTimeline([]);
assert(timeline.length === 0, 'Empty session returns empty timeline');

console.log('✅ All Phase 13 timeline & journey tests passed!');
