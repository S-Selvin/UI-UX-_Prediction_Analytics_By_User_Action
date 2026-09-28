import type { UXProblem, RecommendationPriority } from './types';
import type { SessionData } from './dashboardUtils';
import { generateUXRecommendations } from './uxRecommendationEngine';

const PRIORITY_RANK: Record<RecommendationPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export const aggregateUXProblems = (sessions: SessionData[]): UXProblem[] => {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const problemMap = new Map<string, UXProblem>();

  // Aggregate problems from sessions
  for (const session of sessions) {
    // Generate recommendations dynamically from session data using Phase 6 logic
    const recommendations = generateUXRecommendations(session.features, session.prediction, session.events);

    for (const rec of recommendations) {
      // Explicitly ignore healthy recommendations
      if (rec.id === 'healthy-experience') {
        continue;
      }

      if (!problemMap.has(rec.id)) {
        problemMap.set(rec.id, {
          id: rec.id,
          category: rec.category,
          title: rec.title,
          priority: rec.priority,
          affectedSessions: 0,
          affectedSessionIds: [],
          percentageOfSessions: null,
          evidence: [],
          reasons: [],
          impact: ''
        });
      }

      const problem = problemMap.get(rec.id)!;

      // Unique session tracking
      if (!problem.affectedSessionIds.includes(session.sessionId)) {
        problem.affectedSessionIds.push(session.sessionId);
        problem.affectedSessions++;

        // Deterministic Priority Aggregation
        if (PRIORITY_RANK[rec.priority] > PRIORITY_RANK[problem.priority]) {
          problem.priority = rec.priority;
        }

        // Aggregate unique evidence and reasons to avoid massive arrays
        rec.evidence.forEach(ev => {
          if (!problem.evidence.includes(ev)) {
            problem.evidence.push(ev);
          }
        });

        if (!problem.reasons.includes(rec.reason)) {
          problem.reasons.push(rec.reason);
        }
      }
    }
  }

  // Calculate percentages, impacts, and finalize array
  const totalAnalyzedSessions = sessions.length;
  const problems = Array.from(problemMap.values());

  for (const p of problems) {
    p.percentageOfSessions = totalAnalyzedSessions > 0 
      ? Math.round((p.affectedSessions / totalAnalyzedSessions) * 100) 
      : null;

    // Determine impact deterministically
    if (p.priority === 'HIGH' && p.affectedSessions > 1) {
      p.impact = `High priority issue affecting multiple sessions.`;
    } else if (p.priority === 'HIGH') {
      p.impact = `High priority issue associated with abandonment risk.`;
    } else if (p.category === 'CHECKOUT') {
      p.impact = `Observed during checkout sessions.`;
    } else if (p.affectedSessions > 0) {
      p.impact = `Observed across ${p.affectedSessions} analyzed session${p.affectedSessions === 1 ? '' : 's'}.`;
    }
  }

  // Sorting: High -> Medium -> Low, then affectedSessions descending, then by id ascending
  problems.sort((a, b) => {
    if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
      return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    }
    if (a.affectedSessions !== b.affectedSessions) {
      return b.affectedSessions - a.affectedSessions;
    }
    return a.id.localeCompare(b.id);
  });

  return problems;
};
