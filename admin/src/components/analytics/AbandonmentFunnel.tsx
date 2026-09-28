import type { FunnelStats } from '../../analytics/dashboardUtils';

interface AbandonmentFunnelProps {
  stats: FunnelStats;
}

export function AbandonmentFunnel({ stats }: AbandonmentFunnelProps) {
  const max = Math.max(stats.visitors, 1); // Avoid division by zero
  
  const FunnelRow = ({ label, count, color }: { label: string, count: number, color: string }) => {
    const percent = Math.round((count / max) * 100);
    return (
      <div className="flex flex-col mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="font-mono font-semibold text-slate-600">{count}</span>
        </div>
        <div className="h-8 w-full bg-slate-50 border border-slate-100 rounded flex justify-center overflow-hidden relative">
            <div 
              className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 ${color} transition-all duration-500 opacity-20`}
              style={{ width: `${percent}%` }}
            />
            <div 
              className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-x-2 border-${color.split('-')[1]}-400 transition-all duration-500`}
              style={{ width: `${percent}%` }}
            />
            <div className="relative z-10 flex items-center justify-center h-full text-xs font-bold text-slate-600">
               {percent}%
            </div>
        </div>
      </div>
    );
  };

  if (stats.visitors === 0) return <div className="text-sm text-slate-500">No data available</div>;

  return (
    <div>
      <FunnelRow label="Visitors" count={stats.visitors} color="bg-indigo-500" />
      <div className="w-full flex justify-center py-1"><div className="h-4 border-l border-slate-300" /></div>
      <FunnelRow label="Product Views" count={stats.productViews} color="bg-blue-500" />
      <div className="w-full flex justify-center py-1"><div className="h-4 border-l border-slate-300" /></div>
      <FunnelRow label="Add to Cart" count={stats.addToCart} color="bg-cyan-500" />
      <div className="w-full flex justify-center py-1"><div className="h-4 border-l border-slate-300" /></div>
      <FunnelRow label="Checkout Started" count={stats.checkoutStarted} color="bg-teal-500" />
      <div className="w-full flex justify-center py-1"><div className="h-4 border-l border-slate-300" /></div>
      <FunnelRow label="Payment Selected" count={stats.paymentSelected} color="bg-emerald-400" />
      <div className="w-full flex justify-center py-1"><div className="h-4 border-l border-slate-300" /></div>
      <FunnelRow label="Order Completed" count={stats.orderCompleted} color="bg-emerald-500" />
    </div>
  );
}
