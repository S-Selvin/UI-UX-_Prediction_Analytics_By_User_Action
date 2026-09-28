import { useState, useEffect } from 'react';
import { getEvents } from './core';
import { analyzeSession } from './behaviorAnalyzer';
import type { BehavioralFeatures } from './types';

const defaultFeatures: BehavioralFeatures = {
  sessionId: 'unknown',
  sessionDuration: 0,
  pagesViewed: 0,
  totalClicks: 0,
  totalScrolls: 0,
  totalIdleTime: 0,
  backNavigationCount: 0,
  productsViewed: 0,
  cartActions: 0,
  clickFrequency: 0,
  scrollDepth: 0,
  averageTimePerPage: 0,
  engagementScore: 0,
  activityScore: 0,
  hesitationScore: 0,
  navigationConfusionScore: 0,
  behaviorStatus: "ACTIVE",
  reasons: ["Session just started"]
};

export const useBehaviorAnalysis = () => {
  const [features, setFeatures] = useState<BehavioralFeatures>(defaultFeatures);

  useEffect(() => {
    const updateAnalysis = () => {
      const events = getEvents();
      if (events.length > 0) {
        setFeatures(analyzeSession(events));
      } else {
        setFeatures(defaultFeatures);
      }
    };

    // Initial analysis
    updateAnalysis();

    // Listen to custom tracking events
    window.addEventListener('shopsense_event_tracked', updateAnalysis);
    window.addEventListener('shopsense_events_cleared', updateAnalysis);

    return () => {
      window.removeEventListener('shopsense_event_tracked', updateAnalysis);
      window.removeEventListener('shopsense_events_cleared', updateAnalysis);
    };
  }, []);

  return features;
};
