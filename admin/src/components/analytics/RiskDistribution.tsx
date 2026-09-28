interface RiskDistributionProps {
  distribution: { low: number; medium: number; high: number };
  total: number;
}

export function RiskDistribution({ distribution, total }: RiskDistributionProps) {
  if (total === 0) return <div className="text-sm text-slate-500">No data available</div>;

  const getPercent = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;

  const lowPercent = getPercent(distribution.low);
  const medPercent = getPercent(distribution.medium);
  const highPercent = getPercent(distribution.high);

  return (
    <div className="space-y-4">
      <div className="flex h-4 rounded-full overflow-hidden">
        <div style={{ width: `${lowPercent}%` }} className="bg-emerald-400 transition-all duration-500" title={`LOW: ${lowPercent}%`} />
        <div style={{ width: `${medPercent}%` }} className="bg-yellow-400 transition-all duration-500" title={`MEDIUM: ${medPercent}%`} />
        <div style={{ width: `${highPercent}%` }} className="bg-red-400 transition-all duration-500" title={`HIGH: ${highPercent}%`} />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="font-medium text-slate-700">LOW</span>
          </div>
          <div className="font-mono text-slate-600">{lowPercent}% <span className="text-slate-400 ml-2">({distribution.low})</span></div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="font-medium text-slate-700">MEDIUM</span>
          </div>
          <div className="font-mono text-slate-600">{medPercent}% <span className="text-slate-400 ml-2">({distribution.medium})</span></div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="font-medium text-slate-700">HIGH</span>
          </div>
          <div className="font-mono text-slate-600">{highPercent}% <span className="text-slate-400 ml-2">({distribution.high})</span></div>
        </div>
      </div>
    </div>
  );
}
