export type EventType = 
  | 'page_view'
  | 'click'
  | 'scroll'
  | 'mouse_activity'
  | 'idle_start'
  | 'idle_end'
  | 'time_spent'
  | 'back_navigation'
  | 'search'
  | 'add_to_cart'
  | 'buy_now'
  | 'remove_from_cart'
  | 'quantity_increase'
  | 'quantity_decrease'
  | 'checkout_started'
  | 'checkout_form_interaction'
  | 'payment_method_selected'
  | 'order_completed';

export interface TrackingEvent {
  event_id: string;
  user_id: string;
  session_id: string;
  timestamp: string;
  event_type: EventType;
  page: string;
  website_id?: string;
  element?: string;
  metadata?: Record<string, any>;
}

export interface AnalyzedWebsite {
  website_id: string;
  website_name: string;
  website_type: string;
  primary_goal: string;
  created_at?: string;
}

export interface SessionSummary {
  sessionId: string;
  totalEvents: number;
  pagesViewed: number;
  totalClicks: number;
  totalScrolls: number;
  totalIdleTimeSec: number;
  backNavigationCount: number;
  productsViewed: number;
  cartActions: number;
  sessionDurationSec: number;
}

export type BehaviorStatus = "ACTIVE" | "ENGAGED" | "HESITATING" | "INACTIVE" | "CONFUSED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface AbandonmentPrediction {
    riskScore: number;
    riskLevel: RiskLevel;
    confidence: number;
    reasons: string[];
    signals: {
        hesitation: number;
        inactivity: number;
        navigationConfusion: number;
        engagement: number;
        activity: number;
    };
}

export interface BehavioralFeatures {
  sessionId: string;
  sessionDuration: number;
  pagesViewed: number;
  totalClicks: number;
  totalScrolls: number;
  totalIdleTime: number;
  backNavigationCount: number;
  productsViewed: number;
  cartActions: number;

  clickFrequency: number;
  scrollDepth: number;
  averageTimePerPage: number;

  engagementScore: number;
  activityScore: number;
  hesitationScore: number;
  navigationConfusionScore: number;

  behaviorStatus: BehaviorStatus;
  reasons: string[];
}

export type RecommendationPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type RecommendationCategory =
  | "NAVIGATION"
  | "ENGAGEMENT"
  | "PRODUCT"
  | "PERFORMANCE"
  | "CHECKOUT"
  | "CONTENT"
  | "GENERAL";

export interface UXRecommendation {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  description: string;
  reason: string;
  evidence: string[];
  suggestedAction: string;
}

export type UXHealthLevel = "EXCELLENT" | "GOOD" | "NEEDS_ATTENTION" | "POOR" | "INSUFFICIENT_DATA";
export type FrictionLevel = "LOW" | "MEDIUM" | "HIGH" | "INSUFFICIENT_DATA";

export interface UXHealthReport {
  score: number | null;
  level: UXHealthLevel;
  frictionScore: number | null;
  frictionLevel: FrictionLevel;
  reasons: string[];
  evidence: string[];
  signals: {
    engagement: number | null;
    activity: number | null;
    hesitation: number | null;
    navigationConfusion: number | null;
    friction: number | null;
    goalCompletion: number | null;
  };
}

export interface UserJourneyStep {
  timestamp: string;
  eventType: EventType;
  page: string;
  label: string;
  frictionWarning?: string;
}

export interface PredictionTimelinePoint {
  timestamp: string;
  eventType: EventType;
  page: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reason?: string;
}

export interface UXProblem {
  id: string; // The stable identifier (e.g. recommendation title since IDs in engine are randomly generated)
  category: RecommendationCategory;
  title: string;
  priority: RecommendationPriority;
  affectedSessions: number;
  affectedSessionIds: string[]; // For traceability
  percentageOfSessions: number | null;
  evidence: string[];
  reasons: string[];
  impact: string;
}

export interface OwnerAction {
  id: string; // The same stable ID inherited from Phase 6/14
  problemId: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  problem: string;
  whyItMatters: string;
  evidence: string[];
  observedImpact: string;
  recommendedAction: string;
  actionSteps: string[];
  affectedSessions: number;
  percentageOfSessions: number | null;
}

export interface UXSimulationInput {
  problemId: string;
  improvementLevel: number; // 25, 50, 75, 100
}

export interface UXSimulationResult {
  problemId: string;
  current: {
    uxHealth: number | null;
    friction: number | null;
    hesitation: number;
    navigationConfusion: number;
    engagement: number;
    activity: number;
    riskScore: number;
    riskLevel: RiskLevel;
  };
  simulated: {
    uxHealth: number | null;
    friction: number | null;
    hesitation: number;
    navigationConfusion: number;
    engagement: number;
    activity: number;
    riskScore: number;
    riskLevel: RiskLevel;
  };
  estimatedChanges: {
    uxHealthChange: number | null;
    frictionChange: number | null;
    riskScoreChange: number;
  };
  explanation: string;
}

export type BeforeAfterStatus = 'IMPROVED' | 'DECLINED' | 'MIXED' | 'INSUFFICIENT_DATA';

export interface BeforeAfterMetric {
  before: number | null;
  after: number | null;
  change: number | null;
}

export interface BeforeAfterResult {
  sessionCount: BeforeAfterMetric;
  uxHealth: BeforeAfterMetric;
  friction: BeforeAfterMetric;
  averageRisk: BeforeAfterMetric;
  goalCompletionRate: BeforeAfterMetric;
  status: BeforeAfterStatus;
  explanation: string;
}
