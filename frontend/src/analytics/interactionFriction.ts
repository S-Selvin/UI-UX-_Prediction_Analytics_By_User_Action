import type { TrackingEvent, FrictionLevel, BehavioralFeatures } from './types';

/**
 * Calculates Interaction Friction deterministically based on actual observable events.
 * 
 * Score: 0 (No Friction) to 100 (Max Friction)
 * 0-30: LOW
 * 31-70: MEDIUM
 * 71-100: HIGH
 */
export const calculateInteractionFriction = (
  events: TrackingEvent[],
  behavioralFeatures?: BehavioralFeatures
): { frictionScore: number | null; frictionLevel: FrictionLevel; evidence: string[]; reasons: string[] } => {
  
  if (!events || events.length === 0) {
    return {
      frictionScore: null,
      frictionLevel: "INSUFFICIENT_DATA",
      evidence: [],
      reasons: []
    };
  }

  let frictionScore = 0;
  const evidence: string[] = [];
  const reasons: string[] = [];

  // Count observable events
  const backNavigations = events.filter(e => e.event_type === 'back_navigation').length;
  const cartChanges = events.filter(e => e.event_type === 'quantity_increase' || e.event_type === 'quantity_decrease').length;
  const formInteractions = events.filter(e => e.event_type === 'checkout_form_interaction').length;
  
  // Calculate true idle time from explicitly tracked idle events
  let totalIdleMs = 0;
  let currentIdleStart = 0;
  events.forEach(e => {
    if (e.event_type === 'idle_start') {
      currentIdleStart = new Date(e.timestamp).getTime();
    } else if (e.event_type === 'idle_end' && currentIdleStart > 0) {
      totalIdleMs += (new Date(e.timestamp).getTime() - currentIdleStart);
      currentIdleStart = 0;
    }
  });
  const totalIdleSeconds = Math.floor(totalIdleMs / 1000);

  // 1. Navigation Friction
  if (backNavigations >= 2) {
    frictionScore += Math.min(backNavigations * 10, 30);
    evidence.push(`${backNavigations} back navigations detected.`);
    reasons.push('Repeated back navigation suggests difficulty finding content.');
  }

  // 2. Cart Friction
  if (cartChanges >= 3) {
    frictionScore += Math.min(cartChanges * 5, 25);
    evidence.push(`${cartChanges} cart quantity changes detected.`);
    reasons.push('Repeated cart quantity changes detected.');
  }

  // 3. Form Friction
  if (formInteractions >= 5) {
    frictionScore += Math.min((formInteractions - 4) * 5, 25);
    evidence.push(`${formInteractions} checkout form interactions detected.`);
    reasons.push('High volume of form interactions implies difficulty completing checkout.');
  }

  // 4. Inactivity Friction (only if explicitly measured by the tracker)
  if (totalIdleSeconds >= 60) {
    frictionScore += Math.min(Math.floor(totalIdleSeconds / 30) * 5, 20);
    evidence.push(`${totalIdleSeconds}s of measured idle inactivity.`);
    reasons.push('Long inactivity occurred during the session.');
  }

  // 5. Behavioral Friction (if available)
  if (behavioralFeatures) {
    if (behavioralFeatures.hesitationScore > 50) {
      frictionScore += 10;
      evidence.push(`Hesitation score is high (${behavioralFeatures.hesitationScore}).`);
      reasons.push('Behavioral hesitation detected.');
    }
    if (behavioralFeatures.navigationConfusionScore > 50) {
      frictionScore += 10;
      evidence.push(`Navigation confusion score is high (${behavioralFeatures.navigationConfusionScore}).`);
      reasons.push('Behavioral navigation confusion detected.');
    }
  }

  // Clamp Score to 0-100
  frictionScore = Math.max(0, Math.min(frictionScore, 100));

  // If no friction evidence was found at all but we have data, score is 0
  if (frictionScore === 0 && evidence.length === 0) {
    return {
      frictionScore: 0,
      frictionLevel: "LOW",
      evidence: [],
      reasons: []
    };
  }

  let frictionLevel: FrictionLevel = "LOW";
  if (frictionScore > 70) frictionLevel = "HIGH";
  else if (frictionScore > 30) frictionLevel = "MEDIUM";

  return {
    frictionScore,
    frictionLevel,
    evidence,
    reasons: Array.from(new Set(reasons)) // ensure unique reasons
  };
};
