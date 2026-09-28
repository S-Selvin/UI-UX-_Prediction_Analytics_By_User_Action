import { X, ShieldAlert, BrainCircuit, Activity, Map, Clock } from 'lucide-react';
import type { SessionData } from '../../analytics/dashboardUtils';
import { EventTimeline } from './EventTimeline';
import { useUXRecommendations } from '../../analytics/useUXRecommendations';
import { UXRecommendations } from './UXRecommendations';
import { buildUserJourney } from '../../analytics/userJourney';
import { buildPredictionTimeline } from '../../analytics/predictionTimeline';

interface SessionDetailProps {
  session: SessionData | null;
  onClose: () => void;
}

export function SessionDetail({ session, onClose }: SessionDetailProps) {
  const recommendations = useUXRecommendations(session);

  if (!session) return null;

  const journey = buildUserJourney(session.events);
  const predictionTimeline = buildPredictionTimeline(session.events);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-[500px] max-w-full bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Session Detail</h2>
            <div className="font-mono text-sm text-slate-500 mt-1 flex items-center gap-2">
              {session.sessionId}
              {session.isLive && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">LIVE</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
          
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">User ID</div>
              <div className="font-mono text-sm text-slate-700">{session.userId}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Current Page</div>
              <div className="text-sm text-slate-700 truncate" title={session.latestPage}>{session.latestPage || '/'}</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Duration</div>
              <div className="font-mono text-sm text-slate-700">{Math.floor(session.features.sessionDuration / 60)}m {Math.floor(session.features.sessionDuration % 60)}s</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">Event Count</div>
              <div className="font-mono text-sm text-slate-700">{session.events.length}</div>
            </div>
          </div>

          {/* User Journey */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Map className="h-4 w-4 text-indigo-500" />
              User Journey
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              {journey.length > 0 ? (
                <div className="space-y-4">
                  {journey.map((step, idx) => (
                    <div key={idx} className="flex flex-col relative">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 z-10" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{step.label}</span>
                          <span className="text-xs text-slate-400 font-mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      {step.frictionWarning && (
                        <div className="mt-2 ml-5 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 font-medium flex items-center gap-2">
                          <ShieldAlert className="h-3 w-3" />
                          {step.frictionWarning}
                        </div>
                      )}
                      {idx < journey.length - 1 && (
                        <div className="absolute top-2 left-[3px] w-px h-full bg-slate-200" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">Insufficient journey data</div>
              )}
            </div>
          </div>

          {/* Prediction Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Prediction Timeline
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              {predictionTimeline.length > 0 ? (
                <div className="space-y-4">
                  {predictionTimeline.map((pt, idx) => (
                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="text-xs text-slate-400 font-mono mt-0.5 whitespace-nowrap">
                        {new Date(pt.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{pt.eventType.replace(/_/g, ' ')}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            pt.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' : 
                            pt.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {pt.riskLevel} ({pt.riskScore}%)
                          </span>
                        </div>
                        {pt.reason && (
                          <div className="text-xs text-slate-500 italic mt-1">{pt.reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">Not enough events to build a prediction timeline.</div>
              )}
            </div>
          </div>

          {/* Abandonment Insights */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800 p-4 text-white">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <ShieldAlert className="h-4 w-4" />
                Current Abandonment Insights
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Risk Score</div>
                  <div className="text-2xl font-bold">{session.prediction.riskScore}%</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Level</div>
                  <div className={`text-sm font-bold mt-2 ${session.prediction.riskLevel === 'HIGH' ? 'text-red-400' : session.prediction.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {session.prediction.riskLevel}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Confidence</div>
                  <div className="text-lg font-bold mt-1">{session.prediction.confidence}%</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Why is this user at risk?</div>
              {session.prediction.reasons.length > 0 ? (
                <ul className="space-y-2">
                  {session.prediction.reasons.map((r, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500">No specific risk patterns detected.</div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Strongest Signals</div>
               <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                 <div className="flex justify-between pr-4"><span>Hesitation</span> <span className="font-mono">{session.prediction.signals.hesitation}</span></div>
                 <div className="flex justify-between pl-4"><span>Inactivity</span> <span className="font-mono">{session.prediction.signals.inactivity}</span></div>
                 <div className="flex justify-between pr-4"><span>Confusion</span> <span className="font-mono">{session.prediction.signals.navigationConfusion}</span></div>
                 <div className="flex justify-between pl-4"><span>Low Engag.</span> <span className="font-mono">{session.prediction.signals.engagement}</span></div>
                 <div className="flex justify-between pr-4"><span>Low Activity</span> <span className="font-mono">{session.prediction.signals.activity}</span></div>
               </div>
            </div>
          </div>

          {/* UX Recommendations */}
          <UXRecommendations recommendations={recommendations} />

          {/* Behavior Core */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-indigo-500" />
              Behavior Raw Scores
            </h3>
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 text-sm shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600">Status</span>
                <span className="font-bold text-indigo-600">{session.features.behaviorStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Engagement Score</span>
                <span className="font-mono text-slate-800">{session.features.engagementScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Activity Score</span>
                <span className="font-mono text-slate-800">{session.features.activityScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Hesitation Score</span>
                <span className="font-mono text-slate-800">{session.features.hesitationScore}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Navigation Confusion</span>
                <span className="font-mono text-slate-800">{session.features.navigationConfusionScore}</span>
              </div>
            </div>
          </div>

          {/* Raw Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Raw Event Timeline
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
              <EventTimeline events={session.events} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
