import type { BehavioralFeatures, TrackingEvent, AbandonmentPrediction, UXSimulationResult } from './types';
import { predictAbandonment } from './abandonmentPredictor';
import { calculateUXHealth } from './uxHealth';
import { calculateInteractionFriction } from './interactionFriction';
import type { SessionData } from './dashboardUtils';

export function simulateUXImprovement(
  features: BehavioralFeatures,
  prediction: AbandonmentPrediction,
  events: TrackingEvent[],
  problemId: string,
  improvementLevel: number
): UXSimulationResult | null {
  
  // Valid improvement levels
  const level = Math.max(0, Math.min(100, improvementLevel));
  if (level === 0) return null; // No simulation if 0

  const factor = level / 100;

  // 1. Clone original inputs
  const simulatedFeatures: BehavioralFeatures = { ...features };
  let explanation = '';

  // 2. Deterministic Mapping
  switch (problemId) {
    case 'improve-navigation-clarity':
      simulatedFeatures.navigationConfusionScore = Math.max(0, features.navigationConfusionScore - (features.navigationConfusionScore * factor));
      explanation = 'Reducing navigation confusion is simulated to improve the user\'s ability to progress through the site.';
      break;
    
    case 'reduce-user-hesitation':
      simulatedFeatures.hesitationScore = Math.max(0, features.hesitationScore - (features.hesitationScore * factor));
      explanation = 'Reducing hesitation is simulated to improve user decision-making confidence.';
      break;

    case 'increase-user-engagement':
      simulatedFeatures.engagementScore = Math.min(100, features.engagementScore + ((100 - features.engagementScore) * factor));
      explanation = 'Increasing engagement is simulated to improve user interaction with primary content.';
      break;

    case 'encourage-user-interaction':
      simulatedFeatures.activityScore = Math.min(100, features.activityScore + ((100 - features.activityScore) * factor));
      explanation = 'Encouraging interaction is simulated to increase user activity and progression.';
      break;

    case 'improve-product-cart-conversion':
      simulatedFeatures.hesitationScore = Math.max(0, features.hesitationScore - (features.hesitationScore * factor * 0.5));
      simulatedFeatures.engagementScore = Math.min(100, features.engagementScore + ((100 - features.engagementScore) * factor * 0.5));
      explanation = 'Improving product-to-cart flow is simulated to lower product hesitation and slightly increase engagement.';
      break;

    case 'reduce-cart-decision-friction':
      simulatedFeatures.hesitationScore = Math.max(0, features.hesitationScore - (features.hesitationScore * factor));
      explanation = 'Reducing cart friction is simulated to lower user hesitation during the checkout decision.';
      break;

    case 'improve-checkout-completion':
      simulatedFeatures.hesitationScore = Math.max(0, features.hesitationScore - (features.hesitationScore * factor));
      explanation = 'Simplifying checkout is simulated to lower hesitation. (Note: True completion cannot be safely predicted).';
      break;

    case 'reduce-payment-drop-off':
      simulatedFeatures.hesitationScore = Math.max(0, features.hesitationScore - (features.hesitationScore * factor));
      explanation = 'Clarifying payment is simulated to lower hesitation at the final step.';
      break;

    case 're-engage-inactive-users':
      simulatedFeatures.totalIdleTime = Math.max(0, features.totalIdleTime - (features.totalIdleTime * factor));
      simulatedFeatures.activityScore = Math.min(100, features.activityScore + ((100 - features.activityScore) * factor));
      explanation = 'Re-engaging users is simulated to lower inactivity and raise session activity.';
      break;

    default:
      // Unknown problem ID safely skipped
      return null;
  }

  // 3. Re-calculate metrics using original unmodified Phase 4/12 logic
  const originalHealth = calculateUXHealth(events, features);
  const simulatedHealth = calculateUXHealth(events, simulatedFeatures);

  // We do not filter events, so friction calculation just re-evaluates the cloned features alongside original events
  const originalFriction = calculateInteractionFriction(events, features);
  const simulatedFriction = calculateInteractionFriction(events, simulatedFeatures);

  const simulatedPrediction = predictAbandonment(simulatedFeatures, events);

  return {
    problemId,
    current: {
      uxHealth: originalHealth.score,
      friction: originalFriction.frictionScore,
      hesitation: features.hesitationScore,
      navigationConfusion: features.navigationConfusionScore,
      engagement: features.engagementScore,
      activity: features.activityScore,
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel
    },
    simulated: {
      uxHealth: simulatedHealth.score,
      friction: simulatedFriction.frictionScore,
      hesitation: simulatedFeatures.hesitationScore,
      navigationConfusion: simulatedFeatures.navigationConfusionScore,
      engagement: simulatedFeatures.engagementScore,
      activity: simulatedFeatures.activityScore,
      riskScore: simulatedPrediction.riskScore,
      riskLevel: simulatedPrediction.riskLevel
    },
    estimatedChanges: {
      uxHealthChange: (originalHealth.score !== null && simulatedHealth.score !== null) ? simulatedHealth.score - originalHealth.score : null,
      frictionChange: (originalFriction.frictionScore !== null && simulatedFriction.frictionScore !== null) ? simulatedFriction.frictionScore - originalFriction.frictionScore : null,
      riskScoreChange: simulatedPrediction.riskScore - prediction.riskScore
    },
    explanation
  };
}

export function aggregateSimulations(sessions: SessionData[], problemId: string, improvementLevel: number): UXSimulationResult | null {
  if (!sessions || sessions.length === 0) return null;

  const validSimulations: UXSimulationResult[] = [];

  for (const session of sessions) {
    const sim = simulateUXImprovement(
      session.features,
      session.prediction,
      session.events,
      problemId,
      improvementLevel
    );
    if (sim) validSimulations.push(sim);
  }

  if (validSimulations.length === 0) return null;



  const avg = (arr: number[]) => Math.round(arr.reduce((a,b)=>a+b, 0) / arr.length);
  const avgNull = (arr: (number|null)[]) => {
    const valid = arr.filter(v => v !== null) as number[];
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((a,b)=>a+b, 0) / valid.length);
  };

  const getRiskLevel = (score: number) => {
    if (score > 70) return 'HIGH';
    if (score > 30) return 'MEDIUM';
    return 'LOW';
  };

  const avgCurrentRiskScore = avg(validSimulations.map(s => s.current.riskScore));
  const avgSimulatedRiskScore = avg(validSimulations.map(s => s.simulated.riskScore));

  return {
    problemId,
    current: {
      uxHealth: avgNull(validSimulations.map(s => s.current.uxHealth)),
      friction: avgNull(validSimulations.map(s => s.current.friction)),
      hesitation: avg(validSimulations.map(s => s.current.hesitation)),
      navigationConfusion: avg(validSimulations.map(s => s.current.navigationConfusion)),
      engagement: avg(validSimulations.map(s => s.current.engagement)),
      activity: avg(validSimulations.map(s => s.current.activity)),
      riskScore: avgCurrentRiskScore,
      riskLevel: getRiskLevel(avgCurrentRiskScore)
    },
    simulated: {
      uxHealth: avgNull(validSimulations.map(s => s.simulated.uxHealth)),
      friction: avgNull(validSimulations.map(s => s.simulated.friction)),
      hesitation: avg(validSimulations.map(s => s.simulated.hesitation)),
      navigationConfusion: avg(validSimulations.map(s => s.simulated.navigationConfusion)),
      engagement: avg(validSimulations.map(s => s.simulated.engagement)),
      activity: avg(validSimulations.map(s => s.simulated.activity)),
      riskScore: avgSimulatedRiskScore,
      riskLevel: getRiskLevel(avgSimulatedRiskScore)
    },
    estimatedChanges: {
      uxHealthChange: avgNull(validSimulations.map(s => s.estimatedChanges.uxHealthChange)),
      frictionChange: avgNull(validSimulations.map(s => s.estimatedChanges.frictionChange)),
      riskScoreChange: avgSimulatedRiskScore - avgCurrentRiskScore
    },
    explanation: validSimulations[0].explanation // All share the same explanation
  };
}
