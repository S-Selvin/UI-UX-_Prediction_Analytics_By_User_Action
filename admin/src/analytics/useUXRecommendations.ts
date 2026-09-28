import { useMemo } from 'react';
import { generateUXRecommendations } from './uxRecommendationEngine';
import type { SessionData } from './dashboardUtils';
import type { UXRecommendation } from './types';

/**
 * Connects Phase 3 (BehavioralFeatures) + Phase 4 (AbandonmentPrediction) + Phase 2 (TrackingEvent)
 * to generate Phase 6 UX Recommendations.
 * Uses memoization to prevent unnecessary recalculations.
 */
export function useUXRecommendations(session: SessionData | null | undefined): UXRecommendation[] {
  return useMemo(() => {
    if (!session) return [];
    return generateUXRecommendations(session.features, session.prediction, session.events);
  }, [session]);
}
