import type { 
  BehavioralFeatures, 
  AbandonmentPrediction, 
  TrackingEvent, 
  UXRecommendation,
  RecommendationPriority
} from './types';

export function generateUXRecommendations(
  features: BehavioralFeatures,
  prediction: AbandonmentPrediction,
  events: TrackingEvent[]
): UXRecommendation[] {
  const recommendations: UXRecommendation[] = [];

  // Helper to add recommendation without duplicates (by id)
  const addRec = (rec: UXRecommendation) => {
    if (!recommendations.some(r => r.id === rec.id)) {
      recommendations.push(rec);
    }
  };

  const hasCheckoutStarted = events.some(e => e.event_type === 'checkout_started');
  const hasPaymentSelected = events.some(e => e.event_type === 'payment_method_selected');
  const hasOrderCompleted = events.some(e => e.event_type === 'order_completed');

  // Rule G — REPEATED CART CHANGES
  const cartChanges = events.filter(e => e.event_type === 'quantity_increase' || e.event_type === 'quantity_decrease');
  if (cartChanges.length >= 3 && !hasOrderCompleted) {
    addRec({
      id: 'reduce-cart-decision-friction',
      category: 'CHECKOUT',
      priority: 'MEDIUM',
      title: 'Reduce Cart Decision Friction',
      description: 'The user is repeatedly modifying their cart quantities.',
      reason: 'Repeated cart changes indicate indecision or price sensitivity.',
      evidence: [`User modified cart quantity ${cartChanges.length} times.`],
      suggestedAction: 'Simplify quantity controls, make total price clearer, and show savings or shipping information.'
    });
  }

  // Rule I — PAYMENT SELECTED BUT NOT COMPLETED
  if (hasPaymentSelected && !hasOrderCompleted) {
    addRec({
      id: 'reduce-payment-drop-off',
      category: 'CHECKOUT',
      priority: 'HIGH',
      title: 'Reduce Payment Drop-Off',
      description: 'The user reached the payment step but did not complete the order.',
      reason: 'Drop-off at the final payment step suggests payment errors or lack of trust.',
      evidence: ['User selected payment method but has not completed the order.'],
      suggestedAction: 'Make payment confirmation clearer, improve payment error messaging, and reassure users about transaction security.'
    });
  }

  // Rule H — CHECKOUT STARTED BUT NOT COMPLETED
  // Only apply if we haven't already applied Rule I (which is more specific)
  if (hasCheckoutStarted && !hasOrderCompleted && !hasPaymentSelected) {
    addRec({
      id: 'improve-checkout-completion',
      category: 'CHECKOUT',
      priority: 'HIGH',
      title: 'Improve Checkout Completion',
      description: 'The user started checkout but has not completed the order.',
      reason: 'Friction during checkout form completion is causing abandonment.',
      evidence: ['User started checkout but abandoned before payment selection.'],
      suggestedAction: 'Reduce form complexity, minimize unnecessary fields, and improve checkout progress visibility.'
    });
  }

  // Rule B — NAVIGATION CONFUSION
  if (features.navigationConfusionScore >= 60 || features.backNavigationCount >= 3) {
    addRec({
      id: 'improve-navigation-clarity',
      category: 'NAVIGATION',
      priority: 'HIGH',
      title: 'Improve Navigation Clarity',
      description: 'The user appears to be struggling to navigate.',
      reason: 'High back navigation and confusion score indicates unclear site structure.',
      evidence: [
        `Navigation confusion score: ${Math.round(features.navigationConfusionScore)}/100`,
        `Back navigations: ${features.backNavigationCount}`
      ],
      suggestedAction: 'Add breadcrumbs, simplify navigation labels, and make previous/next actions clearer.'
    });
  }

  // Rule A — HIGH HESITATION
  if (features.hesitationScore >= 70) {
    addRec({
      id: 'reduce-user-hesitation',
      category: 'PRODUCT',
      priority: 'HIGH',
      title: 'Reduce User Hesitation',
      description: 'The user is spending significant time interacting with the product without showing strong purchase intent.',
      reason: 'High hesitation suggests missing information or lack of confidence in the product.',
      evidence: [`Hesitation score: ${Math.round(features.hesitationScore)}/100`],
      suggestedAction: 'Simplify product information, make price and key benefits more visible, and improve CTA visibility.'
    });
  }

  // Rule C — HIGH INACTIVITY
  // Let's define high inactivity as score >= 70 or totalIdleTime >= 60
  if (features.totalIdleTime >= 60 || features.activityScore < 20) {
    addRec({
      id: 're-engage-inactive-users',
      category: 'ENGAGEMENT',
      priority: features.totalIdleTime >= 120 ? 'HIGH' : 'MEDIUM',
      title: 'Re-engage Inactive Users',
      description: 'The user is showing prolonged periods of inactivity.',
      reason: 'Inactivity often precedes session abandonment.',
      evidence: [
        `Idle duration: ${Math.round(features.totalIdleTime)}s`,
        `Activity score: ${Math.round(features.activityScore)}/100`
      ],
      suggestedAction: 'Display a contextual prompt or highlight the next useful action to guide the user.'
    });
  }

  // Rule D — LOW ENGAGEMENT
  if (features.engagementScore < 40 && features.engagementScore > 0) { // Don't trigger if score is 0 due to completely fresh session
    addRec({
      id: 'increase-user-engagement',
      category: 'ENGAGEMENT',
      priority: 'MEDIUM',
      title: 'Increase User Engagement',
      description: 'The user is exhibiting low engagement with the page content.',
      reason: 'Low engagement indicates the content or CTAs are not capturing interest.',
      evidence: [`Engagement score: ${Math.round(features.engagementScore)}/100`],
      suggestedAction: 'Improve CTA visibility, make important actions more prominent, and simplify page structure.'
    });
  }

  // Rule E — LOW ACTIVITY
  if (features.activityScore < 40 && features.activityScore > 0 && features.totalIdleTime < 60) {
    // Only trigger if Rule C wasn't the main driver
    addRec({
      id: 'encourage-user-interaction',
      category: 'ENGAGEMENT',
      priority: 'MEDIUM',
      title: 'Encourage User Interaction',
      description: 'The user is passive and not interacting much with the interface.',
      reason: 'Low interaction levels correlate with lower conversion rates.',
      evidence: [`Activity score: ${Math.round(features.activityScore)}/100`],
      suggestedAction: 'Improve interactive elements and guide the user toward the next step.'
    });
  }

  // Rule F — PRODUCT VIEW WITHOUT CART ACTION
  if (features.productsViewed > 0 && features.cartActions === 0) {
    addRec({
      id: 'improve-product-cart-conversion',
      category: 'PRODUCT',
      priority: 'MEDIUM',
      title: 'Improve Product-to-Cart Conversion',
      description: 'The user has viewed products but has not added anything to the cart.',
      reason: 'Viewing products without adding to cart indicates friction in product selection or pricing.',
      evidence: [`User viewed ${features.productsViewed} products but performed no cart action.`],
      suggestedAction: 'Make Add to Cart more prominent, clarify pricing, and highlight product benefits.'
    });
  }

  // Rule J — HIGH ABANDONMENT RISK
  if (prediction.riskLevel === 'HIGH' && recommendations.filter(r => r.priority === 'HIGH').length === 0) {
    addRec({
      id: 'prioritize-user-experience',
      category: 'GENERAL',
      priority: 'HIGH',
      title: 'Prioritize This User Experience',
      description: 'This session shows a high probability of abandonment.',
      reason: 'Overall behavioral signals point strongly to imminent abandonment.',
      evidence: [
        `Risk score: ${Math.round(prediction.riskScore)}%`,
        `Strongest signal: ${prediction.reasons[0] || 'High aggregate risk'}`
      ],
      suggestedAction: 'Address the strongest behavioral signals before adding more conversion friction.'
    });
  }

  // Rule K — LOW RISK / HEALTHY EXPERIENCE
  if (prediction.riskLevel === 'LOW' && recommendations.length === 0 && events.length > 3) {
    addRec({
      id: 'healthy-experience',
      category: 'GENERAL',
      priority: 'LOW',
      title: 'User Experience Looks Healthy',
      description: 'The user is actively engaging with the website and showing positive intent.',
      reason: 'Healthy engagement and activity metrics with low confusion or hesitation.',
      evidence: [
        `Risk score: ${Math.round(prediction.riskScore)}%`,
        `Engagement score: ${Math.round(features.engagementScore)}/100`
      ],
      suggestedAction: 'Continue monitoring this interaction pattern and preserve the successful UX flow.'
    });
  }

  // Sort by priority (HIGH -> MEDIUM -> LOW)
  const priorityOrder: Record<RecommendationPriority, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2
  };

  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Max 5 recommendations
  return recommendations.slice(0, 5);
}
