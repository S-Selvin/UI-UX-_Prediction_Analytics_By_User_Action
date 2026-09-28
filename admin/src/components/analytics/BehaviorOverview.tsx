import type { SessionData } from '../../analytics/dashboardUtils';

interface BehaviorOverviewProps {
  sessions: SessionData[];
}

export function BehaviorOverview({ sessions }: BehaviorOverviewProps) {
  if (sessions.length === 0) return <div className="text-sm text-slate-500">No data available</div>;

  const avg = (key: 'engagementScore' | 'activityScore' | 'hesitationScore' | 'navigationConfusionScore') => {
    const sum = sessions.reduce((acc, s) => acc + s.features[key], 0);
    return Math.round(sum / sessions.length);
  };

  const engagement = avg('engagementScore');
  const activity = avg('activityScore');
  const hesitation = avg('hesitationScore');
  const confusion = avg('navigationConfusionScore');

  const MetricBar = ({ label, score, type }: { label: string, score: number, type: 'good' | 'bad' }) => {
    const isHigh = score >= 60;
    const isMedium = score >= 30 && score < 60;
    
    let colorClass = 'bg-slate-400';
    let textClass = 'text-slate-500';
    let labelLevel = 'Low';

    if (type === 'good') {
      if (isHigh) { colorClass = 'bg-emerald-500'; textClass = 'text-emerald-600'; labelLevel = 'High'; }
      else if (isMedium) { colorClass = 'bg-emerald-300'; textClass = 'text-emerald-500'; labelLevel = 'Moderate'; }
    } else {
      if (isHigh) { colorClass = 'bg-red-400'; textClass = 'text-red-500'; labelLevel = 'High'; }
      else if (isMedium) { colorClass = 'bg-orange-300'; textClass = 'text-orange-500'; labelLevel = 'Moderate'; }
    }

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-600">{label}</span>
          <span className={`font-semibold ${textClass}`}>{score} / 100 <span className="text-xs text-slate-400 font-normal ml-1">({labelLevel})</span></span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <MetricBar label="Engagement" score={engagement} type="good" />
      <MetricBar label="Activity" score={activity} type="good" />
      <MetricBar label="Hesitation" score={hesitation} type="bad" />
      <MetricBar label="Navigation Confusion" score={confusion} type="bad" />
    </div>
  );
}
