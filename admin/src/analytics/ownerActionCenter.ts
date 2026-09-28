import type { UXProblem, OwnerAction, RecommendationPriority } from './types';

interface ActionMapping {
  whyItMatters: string;
  recommendedAction: string;
  actionSteps: string[];
}

const ACTION_DICTIONARY: Record<string, ActionMapping> = {
  'improve-navigation-clarity': {
    whyItMatters: 'Repeated navigation reversals were observed.',
    recommendedAction: 'Review navigation paths and reduce unnecessary back-and-forth movement.',
    actionSteps: [
      'Identify pages where users frequently navigate backward.',
      'Check whether navigation labels are clear.',
      'Make important next steps more visible.',
      'Reduce unnecessary navigation depth.'
    ]
  },
  'reduce-user-hesitation': {
    whyItMatters: 'Users spend excessive time interacting with content without clear progression.',
    recommendedAction: 'Improve product information and decision clarity.',
    actionSteps: [
      'Make important product information easier to scan.',
      'Clarify price, details, and benefits where applicable.',
      'Make the primary action more visible.',
      'Review areas where users spend excessive time before progressing.'
    ]
  },
  'improve-product-cart-conversion': {
    whyItMatters: 'Product views are occurring but are not translating into cart additions.',
    recommendedAction: 'Make the transition from product discovery to cart easier.',
    actionSteps: [
      'Review visibility of the Add to Cart action.',
      'Check whether product information is sufficient for decision-making.',
      'Reduce unnecessary steps before adding to cart.'
    ]
  },
  'reduce-cart-decision-friction': {
    whyItMatters: 'Repeated cart quantity changes indicate friction or price sensitivity.',
    recommendedAction: 'Reduce repeated cart adjustments and decision friction.',
    actionSteps: [
      'Review quantity controls.',
      'Make cart totals easy to understand.',
      'Make remove/update actions clear.',
      'Check whether users need unnecessary steps to modify the cart.'
    ]
  },
  'improve-checkout-completion': {
    whyItMatters: 'Checkout sessions were observed ending without order completion.',
    recommendedAction: 'Simplify the checkout flow.',
    actionSteps: [
      'Review checkout form length.',
      'Remove unnecessary fields.',
      'Improve field validation and error clarity.',
      'Keep the primary completion action prominent.'
    ]
  },
  'reduce-payment-drop-off': {
    whyItMatters: 'Users reach the payment selection step but abandon before finalizing the order.',
    recommendedAction: 'Review the payment step for unnecessary friction.',
    actionSteps: [
      'Check payment method clarity.',
      'Make payment options easy to understand.',
      'Review errors or unclear states around payment.',
      'Reduce unnecessary steps after payment method selection.'
    ]
  },
  'increase-user-engagement': {
    whyItMatters: 'Users are showing low engagement with the current page content.',
    recommendedAction: 'Improve opportunities for meaningful interaction.',
    actionSteps: [
      'Review whether important content is easy to discover.',
      'Make useful interactions more visible.',
      'Reduce unnecessary passive browsing.'
    ]
  },
  'encourage-user-interaction': {
    whyItMatters: 'Users are passively browsing without actively interacting.',
    recommendedAction: 'Improve opportunities for meaningful interaction.',
    actionSteps: [
      'Review whether important content is easy to discover.',
      'Make useful interactions more visible.',
      'Reduce unnecessary passive browsing.'
    ]
  },
  're-engage-inactive-users': {
    whyItMatters: 'Periods of inactivity observed during user sessions.',
    recommendedAction: 'Review areas where users become inactive.',
    actionSteps: [
      'Identify pages associated with inactivity.',
      'Check whether the next action is obvious.',
      'Reduce unnecessary waiting or confusing content.',
      'Improve clarity of the primary action.'
    ]
  },
  'prioritize-user-experience': {
    whyItMatters: 'General high abandonment risk signals detected across interactions.',
    recommendedAction: 'Address overall user experience friction.',
    actionSteps: [
      'Review overall session metrics.',
      'Ensure primary conversion path is obvious.',
      'Test for broken links or unclear calls to action.'
    ]
  }
};

const PRIORITY_RANK: Record<RecommendationPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export const transformProblemsToActions = (problems: UXProblem[]): OwnerAction[] => {
  const actions: OwnerAction[] = [];

  for (const p of problems) {
    if (p.id === 'healthy-experience') continue;

    const mapping = ACTION_DICTIONARY[p.id];
    
    // Safely ignore unmapped problems
    if (!mapping) continue;

    const observedImpact = p.percentageOfSessions !== null
      ? `${p.percentageOfSessions}% of analyzed sessions.`
      : `Observed across ${p.affectedSessions} analyzed session${p.affectedSessions === 1 ? '' : 's'}.`;

    actions.push({
      id: p.id,
      problemId: p.id,
      category: p.category,
      priority: p.priority,
      problem: p.title,
      whyItMatters: mapping.whyItMatters,
      evidence: p.evidence,
      observedImpact: observedImpact,
      recommendedAction: mapping.recommendedAction,
      actionSteps: mapping.actionSteps,
      affectedSessions: p.affectedSessions,
      percentageOfSessions: p.percentageOfSessions
    });
  }

  // Sort explicitly: HIGH -> MEDIUM -> LOW, then affectedSessions descending, then stable ID ascending
  actions.sort((a, b) => {
    if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
      return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    }
    if (a.affectedSessions !== b.affectedSessions) {
      return b.affectedSessions - a.affectedSessions;
    }
    return a.id.localeCompare(b.id);
  });

  return actions;
};
