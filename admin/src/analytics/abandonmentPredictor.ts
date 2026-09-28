import type { BehavioralFeatures, AbandonmentPrediction, RiskLevel, TrackingEvent } from './types';

const LOW_RISK_THRESHOLD = 30;
const HIGH_RISK_THRESHOLD = 70;

export function predictAbandonment(
    features: BehavioralFeatures, 
    events: TrackingEvent[]
): AbandonmentPrediction {
    let reasons: string[] = [];

    // Signals derivation
    // 100 max, higher totalIdleTime = higher inactivity risk
    const inactivityRisk = Math.min(100, (features.totalIdleTime / 60) * 100);
    // Lower engagement = higher risk
    const lowEngagementRisk = Math.max(0, 100 - features.engagementScore);
    // Lower activity = higher risk
    const lowActivityRisk = Math.max(0, 100 - features.activityScore);
    // Directly use hesitation and confusion as they imply higher risk
    const hesitationRisk = features.hesitationScore;
    const confusionRisk = features.navigationConfusionScore;

    // Default Risk Calculation
    let riskScore = 
        (hesitationRisk * 0.30) +
        (inactivityRisk * 0.20) +
        (confusionRisk * 0.20) +
        (lowEngagementRisk * 0.20) +
        (lowActivityRisk * 0.10);

    // If no events or short session
    const hasFewEvents = events.length < 5;
    const isVeryShortSession = features.sessionDuration < 10;

    // Confidence Calculation
    // Very few events or very short session -> lower confidence
    let confidence = 0;
    if (events.length === 0) {
        confidence = 0;
    } else {
        confidence = Math.min(100, (events.length * 2) + (features.sessionDuration / 2));
    }
    
    // Evaluate risk reasons based on criteria
    if (hesitationRisk > 70) {
        reasons.push("User is showing strong hesitation.");
    }
    if (features.totalIdleTime > 60) {
        reasons.push("User has spent a significant amount of time inactive.");
    }
    if (confusionRisk > 70) {
        reasons.push("User appears to be having difficulty navigating.");
    }
    if (features.engagementScore < 30) {
        reasons.push("User engagement is currently low.");
    }
    if (features.activityScore < 30) {
        reasons.push("User interaction activity is low.");
    }
    if (features.backNavigationCount >= 3) {
        reasons.push("User navigated backward multiple times.");
    }

    // Checking if user is on product page long without cart action
    const timeOnProductWithoutCart = features.productsViewed > 0 && features.cartActions === 0 && features.sessionDuration > 60;
    if (timeOnProductWithoutCart) {
        reasons.push("User is spending significant time on a product without adding it to the cart.");
    }

    // Reduce risk on positive actions
    const positiveActions = events.filter(e => 
        ['add_to_cart', 'buy_now', 'checkout_started', 'payment_method_selected'].includes(e.event_type)
    ).length;

    if (positiveActions > 0) {
        riskScore = Math.max(0, riskScore - (positiveActions * 15));
    }

    const hasCompletedOrder = events.some(e => e.event_type === 'order_completed');

    if (hasCompletedOrder) {
        riskScore = 0;
        reasons = ["User completed the desired action."];
    } else if (events.length === 0 || isNaN(riskScore) || !isFinite(riskScore)) {
        riskScore = 0;
    } else if (hasFewEvents && isVeryShortSession) {
        // Suppress false high risk at the very beginning of the session
        riskScore = Math.min(riskScore, 25);
    }

    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));
    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    let riskLevel: RiskLevel = "LOW";
    if (riskScore > HIGH_RISK_THRESHOLD) {
        riskLevel = "HIGH";
    } else if (riskScore > LOW_RISK_THRESHOLD) {
        riskLevel = "MEDIUM";
    }

    return {
        riskScore,
        riskLevel,
        confidence,
        reasons,
        signals: {
            hesitation: Math.round(hesitationRisk),
            inactivity: Math.round(inactivityRisk),
            navigationConfusion: Math.round(confusionRisk),
            engagement: Math.round(lowEngagementRisk),
            activity: Math.round(lowActivityRisk)
        }
    };
}
