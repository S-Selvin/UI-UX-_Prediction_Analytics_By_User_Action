import { useState, useMemo } from 'react';
import { CalendarDays, GitCompare, ArrowUp, ArrowDown, Minus, Activity } from 'lucide-react';
import type { SessionData } from '../../analytics/dashboardUtils';
import { comparePeriods } from '../../analytics/beforeAfterMeasurement';

interface BeforeAfterMeasurementProps {
  sessions: SessionData[];
}

export function BeforeAfterMeasurement({ sessions }: BeforeAfterMeasurementProps) {
  const [beforeFrom, setBeforeFrom] = useState('');
  const [beforeTo, setBeforeTo] = useState('');
  const [afterFrom, setAfterFrom] = useState('');
  const [afterTo, setAfterTo] = useState('');

  const parseDate = (d: string) => d ? new Date(d).getTime() : null;

  const result = useMemo(() => {
    const bf = parseDate(beforeFrom);
    const bt = parseDate(beforeTo);
    const af = parseDate(afterFrom);
    const at = parseDate(afterTo);

    if (!bf || !bt || !af || !at) return null;

    // Inclusive bounds: to date should include the end of the day
    const btEnd = bt + (24 * 60 * 60 * 1000) - 1;
    const atEnd = at + (24 * 60 * 60 * 1000) - 1;

    const beforeSessions = sessions.filter(s => {
      const t = s.lastActivity.getTime();
      return t >= bf && t <= btEnd;
    });

    const afterSessions = sessions.filter(s => {
      const t = s.lastActivity.getTime();
      return t >= af && t <= atEnd;
    });

    return comparePeriods(beforeSessions, afterSessions);
  }, [sessions, beforeFrom, beforeTo, afterFrom, afterTo]);

  const renderMetric = (label: string, data: { before: number | null, after: number | null, change: number | null }, polarity: 'higher' | 'lower') => {
    if (data.before === null && data.after === null) return null; // Both missing

    const isPositive = data.change !== null && (polarity === 'higher' ? data.change > 0 : data.change < 0);
    const isNegative = data.change !== null && (polarity === 'higher' ? data.change < 0 : data.change > 0);
    
    return (
      <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 last:border-0 items-center">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-sm font-bold text-slate-600 text-center">{data.before !== null ? data.before : '-'}</div>
        <div className="text-sm font-bold text-slate-600 text-center">{data.after !== null ? data.after : '-'}</div>
        <div className="text-center">
          {data.change !== null ? (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
              isPositive ? 'bg-emerald-100 text-emerald-700' :
              isNegative ? 'bg-rose-100 text-rose-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : isNegative ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(data.change)}
            </span>
          ) : (
            <span className="text-xs text-slate-400">N/A</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
        <GitCompare className="w-64 h-64 text-indigo-500" />
      </div>

      <div className="flex items-center gap-2 mb-2 relative z-10">
        <GitCompare className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-bold text-slate-800">Before/After Measurement</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6 relative z-10">Measure observed changes in user behavior across two periods.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Before Period
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From</label>
              <input type="date" value={beforeFrom} onChange={e => setBeforeFrom(e.target.value)} className="w-full text-sm p-2 border rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To</label>
              <input type="date" value={beforeTo} onChange={e => setBeforeTo(e.target.value)} className="w-full text-sm p-2 border rounded" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> After Period
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From</label>
              <input type="date" value={afterFrom} onChange={e => setAfterFrom(e.target.value)} className="w-full text-sm p-2 border rounded" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To</label>
              <input type="date" value={afterTo} onChange={e => setAfterTo(e.target.value)} className="w-full text-sm p-2 border rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {!result ? (
           <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-100 text-slate-500">
             <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
             <p className="text-sm font-medium">Select both date ranges to see the comparison.</p>
           </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 gap-4 p-3 bg-slate-50 border-b border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metric</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Before</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">After</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Change</div>
            </div>

            <div className="p-3">
              {result.sessionCount.before === 0 ? (
                <div className="text-center py-4 text-sm text-slate-500 font-medium">Not enough data for the before period.</div>
              ) : result.sessionCount.after === 0 ? (
                <div className="text-center py-4 text-sm text-slate-500 font-medium">Not enough data for the after period.</div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-4 py-3 border-b border-slate-100 items-center">
                    <div className="text-sm font-medium text-slate-700">Analyzed Sessions</div>
                    <div className="text-sm font-bold text-slate-600 text-center">{result.sessionCount.before}</div>
                    <div className="text-sm font-bold text-slate-600 text-center">{result.sessionCount.after}</div>
                    <div className="text-center text-xs text-slate-400">N/A</div>
                  </div>
                  {renderMetric('UX Health', result.uxHealth, 'higher')}
                  {renderMetric('Interaction Friction', result.friction, 'lower')}
                  {renderMetric('Abandonment Risk', result.averageRisk, 'lower')}
                  {renderMetric('Goal Completion Rate (%)', result.goalCompletionRate, 'higher')}
                </>
              )}
            </div>

            {(result.sessionCount.before ?? 0) > 0 && (result.sessionCount.after ?? 0) > 0 && (
              <div className={`p-4 border-t ${
                result.status === 'IMPROVED' ? 'bg-emerald-50 border-emerald-100' :
                result.status === 'DECLINED' ? 'bg-rose-50 border-rose-100' :
                'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider rounded ${
                    result.status === 'IMPROVED' ? 'bg-emerald-200 text-emerald-800' :
                    result.status === 'DECLINED' ? 'bg-rose-200 text-rose-800' :
                    result.status === 'MIXED' ? 'bg-amber-200 text-amber-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {result.status.replace('_', ' ')}
                  </span>
                </div>
                <div className={`text-sm font-medium ${
                  result.status === 'IMPROVED' ? 'text-emerald-900' :
                  result.status === 'DECLINED' ? 'text-rose-900' :
                  'text-slate-700'
                }`}>
                  {result.explanation}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Observed comparison only — this does not prove causation.
        </div>
      </div>
    </div>
  );
}
