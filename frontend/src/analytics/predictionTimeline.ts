import type { TrackingEvent, PredictionTimelinePoint, EventType } from './types';
import { analyzeSession } from './behaviorAnalyzer';
import { predictAbandonment } from './abandonmentPredictor';

// Checkpoints that trigger a prediction timeline evaluation
const CHECKPOINT_EVENTS: Set<EventType> = new Set([
  'page_view',
  'search',
  'add_to_cart',
  'remove_from_cart',
  'quantity_increase',
  'quantity_decrease',
  'buy_now',
  'checkout_started',
  'payment_method_selected',
  'order_completed',
  'back_navigation'
]);

export const buildPredictionTimeline = (events: TrackingEvent[]): PredictionTimelinePoint[] => {
  if (!events || events.length === 0) {
    return [];
  }

  const timeline: PredictionTimelinePoint[] = [];
  let previousRiskScore = 0;
  let previousRiskLevel = 'LOW';

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Only run the prediction at meaningful checkpoints to avoid noisy timelines
    if (CHECKPOINT_EVENTS.has(event.event_type) || i === events.length - 1) {
      
      // Slicing the events array to simulate the progressive state of the session
      const eventsSoFar = events.slice(0, i + 1);
      
      // Re-use Phase 3 and Phase 4 logic entirely
      const features = analyzeSession(eventsSoFar);
      const prediction = predictAbandonment(features, eventsSoFar);

      // Determine a timeline-specific reason if risk changed
      let reason = prediction.reasons[0]; // fallback to predictor's top reason

      if (event.event_type === 'order_completed') {
        reason = 'Risk returned to LOW after order completion.';
      } else if (prediction.riskScore > previousRiskScore && prediction.riskLevel !== previousRiskLevel) {
        reason = `Risk increased after ${event.event_type.replace(/_/g, ' ')}.`;
      } else if (prediction.riskScore < previousRiskScore && prediction.riskLevel !== previousRiskLevel) {
        reason = `Risk decreased after ${event.event_type.replace(/_/g, ' ')}.`;
      }

      timeline.push({
        timestamp: event.timestamp,
        eventType: event.event_type,
        page: event.page,
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence,
        reason
      });

      previousRiskScore = prediction.riskScore;
      previousRiskLevel = prediction.riskLevel;
    }
  }

  return timeline;
};
