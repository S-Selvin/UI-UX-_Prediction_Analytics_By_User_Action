import React from 'react';
import { Lightbulb, AlertTriangle, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { UXRecommendation, RecommendationPriority } from '../../analytics/types';

interface UXRecommendationsProps {
  recommendations: UXRecommendation[];
}

export function UXRecommendations({ recommendations }: UXRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mt-8 mb-4">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        UX Recommendations
      </h3>
      <div className="space-y-4">
        {recommendations.map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: UXRecommendation }) {
  const { priority, category, title, description, reason, evidence, suggestedAction } = recommendation;

  // Determine styling based on priority
  const priorityStyles: Record<RecommendationPriority, { bg: string; border: string; text: string; icon: React.ReactNode; badgeBg: string }> = {
    HIGH: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      icon: <AlertTriangle className="h-5 w-5 text-rose-600 mt-1 flex-shrink-0" />,
      badgeBg: 'bg-rose-100 text-rose-700 border-rose-200'
    },
    MEDIUM: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <Info className="h-5 w-5 text-amber-600 mt-1 flex-shrink-0" />,
      badgeBg: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    LOW: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />,
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
  };

  const style = priorityStyles[priority];

  return (
    <div className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3 mb-3">
        {style.icon}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${style.badgeBg}`}>
              {priority}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {category}
            </span>
          </div>
          <h4 className={`font-bold ${style.text}`}>{title}</h4>
          <p className="text-sm text-slate-700 mt-1">{description}</p>
        </div>
      </div>

      <div className="ml-8 space-y-3">
        <div className="text-sm text-slate-600 bg-white/60 p-3 rounded border border-white/40">
          <p className="font-semibold text-slate-700 mb-1">Reason:</p>
          <p>{reason}</p>
        </div>
        
        {evidence.length > 0 && (
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">Evidence:</p>
            <ul className="list-disc pl-4 space-y-1">
              {evidence.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-200/50">
          <ArrowRight className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">Recommended Action:</p>
            <p className="text-sm text-indigo-900 font-medium">{suggestedAction}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
