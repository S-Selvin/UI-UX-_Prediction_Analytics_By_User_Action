import { getEvents } from './core';
import { analyzeSession } from './behaviorAnalyzer';
import { predictAbandonment } from './abandonmentPredictor';
import type { TrackingEvent, BehavioralFeatures, AbandonmentPrediction } from './types';

export interface SessionData {
  sessionId: string;
  userId: string;
  events: TrackingEvent[];
  features: BehavioralFeatures;
  prediction: AbandonmentPrediction;
  isLive: boolean;
  latestPage: string;
  lastActivity: Date;
}

export interface KPIStats {
  activeUsers: number;
  totalSessions: number;
  avgSessionTimeSec: number;
  highRiskUsers: number;
  abandonmentRate: number;
}

export interface FunnelStats {
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  paymentSelected: number;
  orderCompleted: number;
}

export interface PagePerformance {
  page: string;
  views: number;
  avgTimeSec: number;
  interactions: number;
  backNavigations: number;
}

export const getDashboardData = (activeWebsiteId: string = 'demo-site') => {
  const rawEvents = getEvents();
  
  // Application-level local analytics isolation
  const allEvents = rawEvents.filter(e => 
    e.website_id === activeWebsiteId || (!e.website_id && activeWebsiteId === 'demo-site')
  );

  // Group events by session
  const sessionMap = new Map<string, TrackingEvent[]>();
  for (const e of allEvents) {
    if (!sessionMap.has(e.session_id)) {
      sessionMap.set(e.session_id, []);
    }
    sessionMap.get(e.session_id)!.push(e);
  }

  const sessions: SessionData[] = [];
  const now = new Date().getTime();

  for (const [sessionId, events] of sessionMap.entries()) {
    // Sort events by timestamp
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const userId = events[0].user_id;
    const latestEvent = events[events.length - 1];
    const lastActivity = new Date(latestEvent.timestamp);
    const latestPage = latestEvent.page;
    
    // Activity within last 15 minutes is considered "Live"
    const isLive = (now - lastActivity.getTime()) < 15 * 60 * 1000;

    const features = analyzeSession(events);
    const prediction = predictAbandonment(features, events);

    sessions.push({
      sessionId,
      userId,
      events,
      features,
      prediction,
      isLive,
      latestPage,
      lastActivity
    });
  }

  // Sort sessions newest first
  sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  // Calculate KPIs
  const totalSessions = sessions.length;
  const activeUsers = new Set(sessions.filter(s => s.isLive).map(s => s.userId)).size;
  
  const sumDuration = sessions.reduce((sum, s) => sum + s.features.sessionDuration, 0);
  const avgSessionTimeSec = totalSessions > 0 ? sumDuration / totalSessions : 0;
  
  const highRiskUsers = sessions.filter(s => s.prediction.riskLevel === 'HIGH').length;

  // Abandonment Rate
  // Definition: Session ended without order completion, accumulated meaningful activity (>2 events), not live.
  const completedSessions = sessions.filter(s => s.events.some(e => e.event_type === 'order_completed')).length;
  const abandonedSessions = sessions.filter(s => !s.isLive && s.events.length > 2 && !s.events.some(e => e.event_type === 'order_completed')).length;
  const eligibleForAbandonment = completedSessions + abandonedSessions;
  const abandonmentRate = eligibleForAbandonment > 0 ? (abandonedSessions / eligibleForAbandonment) * 100 : 0;

  const kpis: KPIStats = {
    activeUsers,
    totalSessions,
    avgSessionTimeSec,
    highRiskUsers,
    abandonmentRate
  };

  // Funnel
  const funnel: FunnelStats = {
    visitors: new Set(allEvents.map(e => e.session_id)).size,
    productViews: new Set(allEvents.filter(e => e.page.includes('/products/')).map(e => e.session_id)).size,
    addToCart: new Set(allEvents.filter(e => e.event_type === 'add_to_cart').map(e => e.session_id)).size,
    checkoutStarted: new Set(allEvents.filter(e => e.event_type === 'checkout_started').map(e => e.session_id)).size,
    paymentSelected: new Set(allEvents.filter(e => e.event_type === 'payment_method_selected').map(e => e.session_id)).size,
    orderCompleted: new Set(allEvents.filter(e => e.event_type === 'order_completed').map(e => e.session_id)).size,
  };

  // Page Performance
  const pageMap = new Map<string, { views: number, interactions: number, backNavigations: number }>();
  allEvents.forEach(e => {
    if (!pageMap.has(e.page)) {
      pageMap.set(e.page, { views: 0, interactions: 0, backNavigations: 0 });
    }
    const p = pageMap.get(e.page)!;
    if (e.event_type === 'page_view') p.views++;
    if (['click', 'add_to_cart', 'checkout_started'].includes(e.event_type)) p.interactions++;
    if (e.event_type === 'back_navigation') p.backNavigations++;
  });

  const pagePerformance: PagePerformance[] = [];
  for (const [page, stats] of pageMap.entries()) {
    // calculate average time spent from time_spent events
    const timeSpentEvents = allEvents.filter(e => e.event_type === 'time_spent' && e.page === page);
    let avgTimeSec = 0;
    if (timeSpentEvents.length > 0) {
      const sum = timeSpentEvents.reduce((acc, curr) => acc + (curr.metadata?.duration_seconds || 0), 0);
      avgTimeSec = sum / timeSpentEvents.length;
    }
    
    pagePerformance.push({
      page,
      views: stats.views,
      avgTimeSec,
      interactions: stats.interactions,
      backNavigations: stats.backNavigations
    });
  }

  // Risk Distribution
  let lowRisk = 0; let medRisk = 0; let highRisk = 0;
  sessions.forEach(s => {
    if (s.prediction.riskLevel === 'LOW') lowRisk++;
    else if (s.prediction.riskLevel === 'MEDIUM') medRisk++;
    else highRisk++;
  });

  return {
    sessions,
    kpis,
    funnel,
    pagePerformance,
    riskDistribution: { low: lowRisk, medium: medRisk, high: highRisk }
  };
};
