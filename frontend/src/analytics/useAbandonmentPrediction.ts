import { useState, useEffect } from 'react';
import { getEvents } from './core';
import { useBehaviorAnalysis } from './useBehaviorAnalysis';
import { predictAbandonment } from './abandonmentPredictor';
import type { AbandonmentPrediction } from './types';

const defaultPrediction: AbandonmentPrediction = {
    riskScore: 0,
    riskLevel: "LOW",
    confidence: 0,
    reasons: [],
    signals: {
        hesitation: 0,
        inactivity: 0,
        navigationConfusion: 0,
        engagement: 0,
        activity: 0
    }
};

export const useAbandonmentPrediction = () => {
    const features = useBehaviorAnalysis();
    const [prediction, setPrediction] = useState<AbandonmentPrediction>(defaultPrediction);

    useEffect(() => {
        const events = getEvents();
        const newPrediction = predictAbandonment(features, events);
        setPrediction(newPrediction);
    }, [features]);

    return prediction;
};
