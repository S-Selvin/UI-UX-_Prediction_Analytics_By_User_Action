import { Target, CheckCircle2, Search, Zap, HelpCircle } from 'lucide-react';
import type { SessionData } from '../../analytics/dashboardUtils';
import { transformProblemsToActions } from '../../analytics/ownerActionCenter';
import { aggregateUXProblems } from '../../analytics/uxProblemCenter';

interface OwnerActionCenterProps {
  sessions: SessionData[];
}

export function OwnerActionCenter({ sessions }: OwnerActionCenterProps) {
  const problems = aggregateUXProblems(sessions);
  const actions = transformProblemsToActions(problems);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm mt-6">
        <HelpCircle className="h-8 w-8 mx-auto mb-3 text-slate-300" />
        <h3 className="font-bold text-slate-700">Website Owner Action Center</h3>
        <p className="text-sm mt-1">Not enough session data</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-emerald-600 shadow-sm mt-6">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-emerald-400" />
        <h3 className="font-bold">Website Owner Action Center</h3>
        <p className="text-sm mt-1 text-emerald-500">No actionable UX problems detected.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800">Website Owner Action Center</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">Turn detected UX problems into evidence-based improvement actions.</p>

      <div className="space-y-6">
        {actions.map((action) => (
          <div key={action.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
            
            {/* Left Column: Problem Context */}
            <div className={`p-6 border-b md:border-b-0 md:border-r flex flex-col md:w-1/3 ${
              action.priority === 'HIGH' ? 'bg-red-50/30' : 
              action.priority === 'MEDIUM' ? 'bg-yellow-50/30' : 'bg-slate-50/30'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{action.category}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  action.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                  action.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {action.priority} PRIORITY
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-4">{action.problem}</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Why it matters</div>
                  <div className="text-sm text-slate-700">{action.whyItMatters}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observed Impact</div>
                  <div className="text-sm font-semibold text-slate-700">{action.observedImpact}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Evidence</div>
                  <ul className="space-y-1">
                    {action.evidence.slice(0, 3).map((ev, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                    {action.evidence.length > 3 && (
                      <li className="text-xs text-slate-400 italic ml-3">
                        + {action.evidence.length - 3} more evidence points
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Owner Action */}
            <div className="p-6 flex-1 flex flex-col justify-center bg-white">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <h4 className="font-bold text-slate-800">Recommended Action</h4>
                </div>
                <p className="text-slate-700 font-medium">{action.recommendedAction}</p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Suggested Steps</div>
                <div className="space-y-3">
                  {action.actionSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="text-sm text-slate-700 pt-0.5">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {action.affectedSessions > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5">
                    <Search className="h-3 w-3" /> View {action.affectedSessions} affected session{action.affectedSessions !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
