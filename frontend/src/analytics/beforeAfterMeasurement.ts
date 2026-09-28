import type { SessionData } from './dashboardUtils';
import type { BeforeAfterResult, BeforeAfterStatus } from './types';
import { calculateUXHealth } from './uxHealth';
import { calculateInteractionFriction } from './interactionFriction';

const avgNull = (arr: (number | null)[]): number | null => {
  const valid = arr.filter(v => v !== null) as number[];
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
};

const getCompletionRate = (sessions: SessionData[]): number | null => {
  const completedSessions = sessions.filter(s => s.events.some(e => e.event_type === 'order_completed')).length;
  const abandonedSessions = sessions.filter(s => !s.isLive && s.events.length > 2 && !s.events.some(e => e.event_type === 'order_completed')).length;
  const eligibleForAbandonment = completedSessions + abandonedSessions;

  if (eligibleForAbandonment === 0) return null;
  return Math.round((completedSessions / eligibleForAbandonment) * 100);
};

export const comparePeriods = (beforeSessions: SessionData[], afterSessions: SessionData[]): BeforeAfterResult => {
  const beforeCount = beforeSessions.length;
  const afterCount = afterSessions.length;

  if (beforeCount === 0 || afterCount === 0) {
    return {
      sessionCount: { before: beforeCount, after: afterCount, change: afterCount - beforeCount },
      uxHealth: { before: null, after: null, change: null },
      friction: { before: null, after: null, change: null },
      averageRisk: { before: null, after: null, change: null },
      goalCompletionRate: { before: null, after: null, change: null },
      status: 'INSUFFICIENT_DATA',
      explanation: 'Not enough data in one or both periods to perform a comparison.'
    };
  }

  // Calculate UX Health averages
  const beforeHealths = beforeSessions.map(s => calculateUXHealth(s.events, s.features).score);
  const afterHealths = afterSessions.map(s => calculateUXHealth(s.events, s.features).score);
  const beforeHealth = avgNull(beforeHealths);
  const afterHealth = avgNull(afterHealths);
  const healthChange = (beforeHealth !== null && afterHealth !== null) ? afterHealth - beforeHealth : null;

  // Calculate Friction averages
  const beforeFrictions = beforeSessions.map(s => calculateInteractionFriction(s.events, s.features).frictionScore);
  const afterFrictions = afterSessions.map(s => calculateInteractionFriction(s.events, s.features).frictionScore);
  const beforeFriction = avgNull(beforeFrictions);
  const afterFriction = avgNull(afterFrictions);
  const frictionChange = (beforeFriction !== null && afterFriction !== null) ? afterFriction - beforeFriction : null;

  // Calculate Risk averages
  const beforeRisks = beforeSessions.map(s => s.prediction.riskScore);
  const afterRisks = afterSessions.map(s => s.prediction.riskScore);
  const beforeRisk = avgNull(beforeRisks);
  const afterRisk = avgNull(afterRisks);
  const riskChange = (beforeRisk !== null && afterRisk !== null) ? afterRisk - beforeRisk : null;

  // Calculate Completion Rates
  const beforeCompletion = getCompletionRate(beforeSessions);
  const afterCompletion = getCompletionRate(afterSessions);
  const completionChange = (beforeCompletion !== null && afterCompletion !== null) ? afterCompletion - beforeCompletion : null;

  // Evaluate Direction (positive, negative, neutral)
  let positives = 0;
  let negatives = 0;
  let neutrals = 0;
  let validMetrics = 0;

  // Polarity: Higher is better
  if (healthChange !== null) {
    validMetrics++;
    if (healthChange > 0) positives++;
    else if (healthChange < 0) negatives++;
    else neutrals++;
  }

  // Polarity: Lower is better
  if (frictionChange !== null) {
    validMetrics++;
    if (frictionChange < 0) positives++;
    else if (frictionChange > 0) negatives++;
    else neutrals++;
  }

  // Polarity: Lower is better
  if (riskChange !== null) {
    validMetrics++;
    if (riskChange < 0) positives++;
    else if (riskChange > 0) negatives++;
    else neutrals++;
  }

  // Polarity: Higher is better
  if (completionChange !== null) {
    validMetrics++;
    if (completionChange > 0) positives++;
    else if (completionChange < 0) negatives++;
    else neutrals++;
  }

  let status: BeforeAfterStatus = 'INSUFFICIENT_DATA';
  let explanation = 'Insufficient comparable key metrics.';

  if (validMetrics > 0) {
    if (positives > 0 && negatives === 0) {
      status = 'IMPROVED';
      explanation = 'All comparable key metrics trended positively.';
    } else if (negatives > 0 && positives === 0) {
      status = 'DECLINED';
      explanation = 'All comparable key metrics trended negatively.';
    } else if (positives > 0 && negatives > 0) {
      status = 'MIXED';
      explanation = 'Some metrics improved while others declined.';
    } else if (neutrals > 0 && positives === 0 && negatives === 0) {
      status = 'MIXED';
      explanation = 'There is valid data, but no observed directional improvement (all neutral).';
    }
  }

  return {
    sessionCount: { before: beforeCount, after: afterCount, change: afterCount - beforeCount },
    uxHealth: { before: beforeHealth, after: afterHealth, change: healthChange },
    friction: { before: beforeFriction, after: afterFriction, change: frictionChange },
    averageRisk: { before: beforeRisk, after: afterRisk, change: riskChange },
    goalCompletionRate: { before: beforeCompletion, after: afterCompletion, change: completionChange },
    status,
    explanation
  };
};
