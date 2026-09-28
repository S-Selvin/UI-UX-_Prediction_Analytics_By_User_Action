import { useState } from 'react';
import { Activity, X, BrainCircuit, List, AlertTriangle } from 'lucide-react';
import type { SessionData } from '../analytics/dashboardUtils';

interface EventMonitorProps {
  session: SessionData | null;
  totalEventCount: number;
}

export function EventMonitor({ session, totalEventCount }: EventMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'behavior' | 'prediction'>('prediction');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-full shadow-xl hover:bg-slate-800 transition-all hover:scale-105"
      >
        <Activity className="h-5 w-5 text-emerald-400" />
        <span className="font-semibold text-sm">Live Events</span>
        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
          {totalEventCount}
        </span>
      </button>
    );
  }

  if (!session) return null;

  const { events, features: behavior, prediction } = session;

  const summary = {
    sessionId: session.sessionId,
    totalEvents: events.length,
    pagesViewed: behavior.pagesViewed,
    totalIdleTimeSec: behavior.totalIdleTime
  };

  const getScoreIndicator = (score: number, type: 'good-is-high' | 'bad-is-high') => {
    if (type === 'good-is-high') {
      if (score >= 70) return '🟢';
      if (score >= 40) return '🟡';
      return '🔴';
    } else {
      if (score >= 70) return '🔴';
      if (score >= 40) return '🟡';
      return '🟢';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-slate-900 text-slate-300 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col" style={{ maxHeight: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-white tracking-wide">Event Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('prediction')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'prediction' ? 'bg-slate-800 text-white border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
        >
          <AlertTriangle className="h-4 w-4" />
          Predict
        </button>
        <button 
          onClick={() => setActiveTab('behavior')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'behavior' ? 'bg-slate-800 text-white border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
        >
          <BrainCircuit className="h-4 w-4" />
          Behavior
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'events' ? 'bg-slate-800 text-white border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
        >
          <List className="h-4 w-4" />
          Raw
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[500px]">
        {activeTab === 'prediction' ? (
          <div className="p-5 font-mono text-xs space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
              <div className="text-slate-400 uppercase tracking-wider mb-1">Abandonment Risk</div>
              <div className="text-3xl font-bold text-white mb-1">{prediction.riskScore}%</div>
              <div className={`font-bold ${prediction.riskLevel === 'HIGH' ? 'text-red-400' : prediction.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {prediction.riskLevel} {prediction.riskLevel === 'HIGH' ? '🔴' : prediction.riskLevel === 'MEDIUM' ? '🟡' : '🟢'}
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
              <span className="text-slate-400">Prediction Confidence</span>
              <span className="font-bold text-white">{prediction.confidence}%</span>
            </div>

            {prediction.reasons.length > 0 && (
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-2">Why?</div>
                <ul className="space-y-2 text-slate-300">
                  {prediction.reasons.map((reason, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 mt-4">
              <div className="text-slate-500 uppercase tracking-wider mb-3">Behavior Signals</div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Hesitation</span><span>{prediction.signals.hesitation}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Inactivity</span><span>{prediction.signals.inactivity}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Confusion</span><span>{prediction.signals.navigationConfusion}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Engagement</span><span>{prediction.signals.engagement}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Activity</span><span>{prediction.signals.activity}</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'behavior' ? (
          <div className="p-5 font-mono text-xs space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Engagement</span>
                <span className="font-bold text-white flex items-center gap-2">
                  {behavior.engagementScore}% {getScoreIndicator(behavior.engagementScore, 'good-is-high')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Activity</span>
                <span className="font-bold text-white flex items-center gap-2">
                  {behavior.activityScore}% {getScoreIndicator(behavior.activityScore, 'good-is-high')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hesitation</span>
                <span className="font-bold text-white flex items-center gap-2">
                  {behavior.hesitationScore}% {getScoreIndicator(behavior.hesitationScore, 'bad-is-high')}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Navigation</span>
                <span className="font-bold text-white flex items-center gap-2">
                  {behavior.navigationConfusionScore}% {getScoreIndicator(behavior.navigationConfusionScore, 'bad-is-high')}
                </span>
              </div>
            </div>

            <div>
              <div className="text-slate-500 uppercase tracking-wider mb-2">Status:</div>
              <div className="text-base font-bold text-emerald-400">
                {behavior.behaviorStatus}
              </div>
            </div>

            <div>
              <div className="text-slate-500 uppercase tracking-wider mb-2">Reasons:</div>
              <ul className="space-y-1.5 text-slate-300">
                {behavior.reasons.map((reason, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-600">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3 font-mono text-xs">
            {summary && (
              <div className="bg-slate-900 border border-slate-800 rounded p-3 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Session ID:</span>
                  <span className="font-mono text-emerald-400">{summary.sessionId}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-slate-800 p-2 rounded text-center">
                    <div className="text-slate-500 mb-1 text-[10px] uppercase">Events</div>
                    <div className="text-white font-bold">{summary.totalEvents}</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded text-center">
                    <div className="text-slate-500 mb-1 text-[10px] uppercase">Pages</div>
                    <div className="text-white font-bold">{summary.pagesViewed}</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded text-center">
                    <div className="text-slate-500 mb-1 text-[10px] uppercase">Idle Time</div>
                    <div className="text-white font-bold">{summary.totalIdleTimeSec}s</div>
                  </div>
                </div>
              </div>
            )}
            
            {events.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">No events tracked yet</div>
            ) : (
              events.map(event => (
                <div key={event.event_id} className="bg-slate-800 rounded p-3 border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-emerald-400 font-bold">{event.event_type}</span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                  </div>
                  <div className="text-slate-400 truncate" title={event.page}>{event.page}</div>
                  {event.element && (
                    <div className="text-slate-300 mt-1 truncate">
                      <span className="text-slate-500">elem:</span> {event.element}
                    </div>
                  )}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500 break-all">
                      {JSON.stringify(event.metadata)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
