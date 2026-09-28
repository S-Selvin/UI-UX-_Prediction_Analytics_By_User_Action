import type { TrackingEvent, BehavioralFeatures, UXHealthReport, UXHealthLevel } from './types';
import { calculateInteractionFriction } from './interactionFriction';

/**
 * Calculates a deterministic UX Health Score (0-100) based on existing Phase 3 
 * behavioral signals and Interaction Friction.
 * 
 * Formula (Weighted):
 * Base Health starts at 50.
 * + Engagement (up to +20)
 * + Activity (up to +10)
 * - Hesitation (up to -15)
 * - Navigation Confusion (up to -15)
 * - Interaction Friction (up to -20)
 * + Goal Completion (+20 if COMPLETED)
 */
export const calculateUXHealth = (
  events: TrackingEvent[],
  behavioralFeatures?: BehavioralFeatures
): UXHealthReport => {

  const frictionReport = calculateInteractionFriction(events, behavioralFeatures);

  if (!events || events.length === 0 || !behavioralFeatures) {
    return {
      score: null,
      level: "INSUFFICIENT_DATA",
      frictionScore: frictionReport.frictionScore,
      frictionLevel: frictionReport.frictionLevel,
      reasons: [],
      evidence: [],
      signals: {
        engagement: null,
        activity: null,
        hesitation: null,
        navigationConfusion: null,
        friction: frictionReport.frictionScore,
        goalCompletion: null
      }
    };
  }

  const { engagementScore, activityScore, hesitationScore, navigationConfusionScore } = behavioralFeatures;
  const isGoalCompleted = events.some(e => e.event_type === 'order_completed');

  let healthScore = 50; // Neutral starting base
  const reasons: string[] = [...frictionReport.reasons];
  const evidence: string[] = [...frictionReport.evidence];

  // Positive signals
  const engagementBonus = (engagementScore / 100) * 20;
  healthScore += engagementBonus;
  if (engagementScore >= 70) {
    reasons.push('High engagement detected.');
  } else if (engagementScore < 30) {
    reasons.push('Engagement score is below the healthy range.');
  }

  const activityBonus = (activityScore / 100) * 10;
  healthScore += activityBonus;

  if (isGoalCompleted) {
    healthScore += 20;
    reasons.push('User successfully completed the primary goal (purchase).');
    evidence.push('Order completion event found.');
  }

  // Negative signals
  const hesitationPenalty = (hesitationScore / 100) * 15;
  healthScore -= hesitationPenalty;
  
  const confusionPenalty = (navigationConfusionScore / 100) * 15;
  healthScore -= confusionPenalty;
  if (navigationConfusionScore > 60) {
    reasons.push('Navigation confusion is lowering overall health.');
  }

  const frictionPenalty = ((frictionReport.frictionScore || 0) / 100) * 20;
  healthScore -= frictionPenalty;
  if (frictionReport.frictionScore && frictionReport.frictionScore > 30) {
    reasons.push('Several sessions or events showed interaction friction.');
  }

  // Clamp Score to 0-100
  healthScore = Math.max(0, Math.min(Math.round(healthScore), 100));

  let level: UXHealthLevel = "POOR";
  if (healthScore >= 90) level = "EXCELLENT";
  else if (healthScore >= 75) level = "GOOD";
  else if (healthScore >= 50) level = "NEEDS_ATTENTION";

  return {
    score: healthScore,
    level,
    frictionScore: frictionReport.frictionScore,
    frictionLevel: frictionReport.frictionLevel,
    reasons: Array.from(new Set(reasons)),
    evidence: Array.from(new Set(evidence)),
    signals: {
      engagement: engagementScore,
      activity: activityScore,
      hesitation: hesitationScore,
      navigationConfusion: navigationConfusionScore,
      friction: frictionReport.frictionScore,
      goalCompletion: isGoalCompleted ? 100 : null // null means not completed/unknown
    }
  };
};
