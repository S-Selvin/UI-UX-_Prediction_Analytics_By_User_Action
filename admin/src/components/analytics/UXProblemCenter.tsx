import { AlertTriangle, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import type { SessionData } from '../../analytics/dashboardUtils';
import { aggregateUXProblems } from '../../analytics/uxProblemCenter';

interface UXProblemCenterProps {
  sessions: SessionData[];
}

export function UXProblemCenter({ sessions }: UXProblemCenterProps) {
  const problems = aggregateUXProblems(sessions);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm mt-6">
        <ShieldAlert className="h-8 w-8 mx-auto mb-3 text-slate-300" />
        <h3 className="font-bold text-slate-700">UX Problem Center</h3>
        <p className="text-sm mt-1">Insufficient data to identify recurring UX problems.</p>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-emerald-600 shadow-sm mt-6">
        <ShieldAlert className="h-8 w-8 mx-auto mb-3 text-emerald-400" />
        <h3 className="font-bold">UX Problem Center</h3>
        <p className="text-sm mt-1 text-emerald-500">No recurring UX problems detected.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800">UX Problem Center</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">Problems detected from real user behavior across {sessions.length} analyzed sessions.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {problems.map((problem) => (
          <div key={problem.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className={`p-4 border-b flex justify-between items-start ${
              problem.priority === 'HIGH' ? 'bg-red-50 border-red-100' : 
              problem.priority === 'MEDIUM' ? 'bg-yellow-50 border-yellow-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">{problem.category}</div>
                <h3 className={`font-bold ${
                  problem.priority === 'HIGH' ? 'text-red-700' : 
                  problem.priority === 'MEDIUM' ? 'text-yellow-700' : 'text-slate-700'
                }`}>{problem.title}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                problem.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                problem.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {problem.priority}
              </span>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs text-slate-500">Affected Sessions</div>
                  <div className="text-lg font-bold text-slate-800">{problem.affectedSessions}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">Analyzed Sessions %</div>
                  <div className="text-lg font-bold text-slate-800">{problem.percentageOfSessions !== null ? `${problem.percentageOfSessions}%` : 'N/A'}</div>
                </div>
              </div>

              {problem.impact && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Why it matters</div>
                  <div className="text-sm text-slate-700">{problem.impact}</div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Supporting Evidence
                </div>
                <ul className="space-y-1.5">
                  {problem.evidence.slice(0, 3).map((ev, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                  {problem.evidence.length > 3 && (
                    <li className="text-xs text-slate-400 italic ml-4">
                      + {problem.evidence.length - 3} more evidence points
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 transition-colors">
                See supporting evidence <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
