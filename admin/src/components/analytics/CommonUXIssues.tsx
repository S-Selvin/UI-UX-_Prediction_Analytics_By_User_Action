import { Lightbulb } from 'lucide-react';
import type { SessionData } from '../../analytics/dashboardUtils';
import { generateUXRecommendations } from '../../analytics/uxRecommendationEngine';

interface CommonUXIssuesProps {
  sessions: SessionData[];
}

export function CommonUXIssues({ sessions }: CommonUXIssuesProps) {
  if (!sessions || sessions.length === 0) return null;

  // Generate recommendations for all sessions
  const categoryCounts: Record<string, number> = {};

  sessions.forEach(session => {
    const recs = generateUXRecommendations(session.features, session.prediction, session.events);
    // Count each category once per session maximum
    const uniqueCategories = new Set(recs.map(r => r.category));
    uniqueCategories.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0);

  if (sortedCategories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col justify-center items-center text-center text-slate-500">
        <Lightbulb className="h-8 w-8 text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">No Common Issues Found</p>
        <p className="text-sm">User experiences appear healthy across all sessions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        Common UX Issues
      </h2>
      <div className="space-y-4">
        {sortedCategories.map(([category, count]) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 capitalize">
              {category.toLowerCase()}
            </span>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${(count / sessions.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 font-mono w-20 text-right">
                {count} session{count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
