import type { PagePerformance as PagePerformanceType } from '../../analytics/dashboardUtils';

interface PagePerformanceProps {
  data: PagePerformanceType[];
}

export function PagePerformance({ data }: PagePerformanceProps) {
  if (data.length === 0) {
    return <div className="p-6 text-center text-sm text-slate-500">No page data available</div>;
  }

  // Sort by views descending
  const sorted = [...data].sort((a, b) => b.views - a.views);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            <th className="py-3 px-6 font-medium">Page</th>
            <th className="py-3 px-6 font-medium">Views</th>
            <th className="py-3 px-6 font-medium">Avg. Time</th>
            <th className="py-3 px-6 font-medium">Interactions</th>
            <th className="py-3 px-6 font-medium">Back Navigations</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {sorted.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-6 font-medium text-slate-700">{row.page || '/'}</td>
              <td className="py-3 px-6 font-mono text-slate-600">{row.views}</td>
              <td className="py-3 px-6 font-mono text-slate-600">
                {row.avgTimeSec > 0 ? `${Math.floor(row.avgTimeSec / 60)}m ${Math.floor(row.avgTimeSec % 60)}s` : '--'}
              </td>
              <td className="py-3 px-6 font-mono text-slate-600">{row.interactions}</td>
              <td className="py-3 px-6 font-mono text-slate-600">{row.backNavigations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
