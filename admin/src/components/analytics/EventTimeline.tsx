import { Activity, Clock, MousePointer2, Eye, AlertTriangle } from 'lucide-react';
import type { TrackingEvent } from '../../analytics/types';

interface EventTimelineProps {
  events: TrackingEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) return <div className="text-sm text-slate-500">No events recorded.</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'click': return <MousePointer2 className="w-4 h-4 text-emerald-500" />;
      case 'idle_start': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'idle_end': return <Clock className="w-4 h-4 text-emerald-400" />;
      case 'add_to_cart': 
      case 'checkout_started':
      case 'order_completed':
        return <Activity className="w-4 h-4 text-indigo-500" />;
      case 'back_navigation': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour12: false });
  };

  return (
    <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-6">
      {events.map((e, i) => (
        <div key={i} className="relative">
          <div className="absolute -left-[27px] bg-white p-1 rounded-full border border-slate-200">
            {getIcon(e.event_type)}
          </div>
          <div className="flex justify-between items-start mb-1">
            <div className="font-semibold text-slate-700 text-sm">{e.event_type}</div>
            <div className="font-mono text-[10px] text-slate-400">{formatTime(e.timestamp)}</div>
          </div>
          <div className="text-xs text-slate-500 truncate" title={e.page}>{e.page}</div>
          {e.element && <div className="text-[10px] text-slate-400 mt-0.5 truncate">Element: {e.element}</div>}
          {e.metadata && Object.keys(e.metadata).length > 0 && (
            <div className="text-[10px] text-slate-400 mt-1 font-mono break-all bg-slate-50 p-1.5 rounded border border-slate-100">
              {JSON.stringify(e.metadata)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
