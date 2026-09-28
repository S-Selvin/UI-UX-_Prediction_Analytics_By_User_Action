import { useState, useMemo } from 'react';
import { Target, TrendingUp, HelpCircle, Activity } from 'lucide-react';
import type { SessionData } from '../../analytics/dashboardUtils';
import { aggregateUXProblems } from '../../analytics/uxProblemCenter';
import { transformProblemsToActions } from '../../analytics/ownerActionCenter';
import { aggregateSimulations } from '../../analytics/uxSimulationEngine';

interface UXImprovementSimulatorProps {
  sessions: SessionData[];
}

export function UXImprovementSimulator({ sessions }: UXImprovementSimulatorProps) {
  const problems = useMemo(() => aggregateUXProblems(sessions), [sessions]);
  const actions = useMemo(() => transformProblemsToActions(problems), [problems]);

  const [selectedProblemId, setSelectedProblemId] = useState<string>(actions.length > 0 ? actions[0].id : '');
  const [improvementLevel, setImprovementLevel] = useState<number>(50);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm mt-6">
        <Activity className="h-8 w-8 mx-auto mb-3 text-slate-300" />
        <h3 className="font-bold text-slate-700">What-if UX Improvement Simulator</h3>
        <p className="text-sm mt-1">Not enough behavioral data for simulation.</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm mt-6">
        <HelpCircle className="h-8 w-8 mx-auto mb-3 text-slate-300" />
        <h3 className="font-bold text-slate-700">What-if UX Improvement Simulator</h3>
        <p className="text-sm mt-1">No UX problems available for simulation.</p>
        <p className="text-xs text-slate-400 mt-1">Continue collecting user interaction data to explore improvement scenarios.</p>
      </div>
    );
  }

  // Fallback to first problem if the selected one is gone
  const currentProblemId = actions.find(a => a.id === selectedProblemId) ? selectedProblemId : actions[0].id;

  const simulation = aggregateSimulations(sessions, currentProblemId, improvementLevel);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden relative">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
        <TrendingUp className="w-64 h-64 text-indigo-500" />
      </div>

      <div className="flex items-center gap-2 mb-2 relative z-10">
        <TrendingUp className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800">What-if UX Improvement Simulator</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6 relative z-10">Explore how improving a detected UX problem could affect current behavioral signals.</p>

      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {/* Controls */}
        <div className="space-y-6 md:col-span-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select UX Problem</label>
            <select
              value={currentProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {actions.map(a => (
                <option key={a.id} value={a.id}>{a.problem}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulated improvement strength</label>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{improvementLevel}</span>
            </div>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map(level => (
                <button
                  key={level}
                  onClick={() => setImprovementLevel(level)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    improvementLevel === level
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {simulation ? (
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Estimated Impact Simulation</div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div></div>
                <div className="text-xs font-bold text-slate-500 uppercase text-center">Current</div>
                <div className="text-xs font-bold text-indigo-600 uppercase text-center">Simulated</div>

                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400"/> UX Health</div>
                <div className="text-lg font-bold text-slate-800 text-center">{simulation.current.uxHealth ?? 'N/A'}</div>
                <div className="text-lg font-bold text-indigo-600 text-center">{simulation.simulated.uxHealth ?? 'N/A'}</div>

                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Target className="w-4 h-4 text-slate-400"/> Friction</div>
                <div className="text-lg font-bold text-slate-800 text-center">{simulation.current.friction ?? 'N/A'}</div>
                <div className="text-lg font-bold text-indigo-600 text-center">{simulation.simulated.friction ?? 'N/A'}</div>

                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-slate-400"/> Risk</div>
                <div className="text-sm font-bold text-slate-800 text-center mt-1">{simulation.current.riskLevel}</div>
                <div className="text-sm font-bold text-indigo-600 text-center mt-1">{simulation.simulated.riskLevel}</div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Estimated Changes</div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">UX Health</div>
                    <div className={`text-lg font-bold ${simulation.estimatedChanges.uxHealthChange && simulation.estimatedChanges.uxHealthChange > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {simulation.estimatedChanges.uxHealthChange !== null ? `${simulation.estimatedChanges.uxHealthChange > 0 ? '+' : ''}${simulation.estimatedChanges.uxHealthChange}` : 'N/A'}
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Friction</div>
                    <div className={`text-lg font-bold ${simulation.estimatedChanges.frictionChange && simulation.estimatedChanges.frictionChange < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {simulation.estimatedChanges.frictionChange !== null ? `${simulation.estimatedChanges.frictionChange > 0 ? '+' : ''}${simulation.estimatedChanges.frictionChange}` : 'N/A'}
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 text-center shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Risk Score</div>
                    <div className={`text-lg font-bold ${simulation.estimatedChanges.riskScoreChange < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {simulation.estimatedChanges.riskScoreChange > 0 ? '+' : ''}{simulation.estimatedChanges.riskScoreChange}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Why this changes</div>
                <div className="text-sm text-indigo-900 font-medium">{simulation.explanation}</div>
              </div>
            </div>

            <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Simulation only — estimated from current behavioral signals. Actual results may differ.
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center h-full text-slate-400 text-sm font-medium">
            Simulation could not be completed for this configuration.
          </div>
        )}
      </div>
    </div>
  );
}
