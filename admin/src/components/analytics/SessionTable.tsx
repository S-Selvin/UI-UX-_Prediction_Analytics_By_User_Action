import { useState } from 'react';
import type { SessionData } from '../../analytics/dashboardUtils';

interface SessionTableProps {
  sessions: SessionData[];
  onSelectSession: (session: SessionData) => void;
  selectedSessionId?: string;
  isHistory?: boolean;
}

export function SessionTable({ sessions, onSelectSession, selectedSessionId, isHistory = false }: SessionTableProps) {
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [behaviorFilter, setBehaviorFilter] = useState<string>('All');
  const [pageFilter, setPageFilter] = useState<string>('All');

  const filtered = sessions.filter(s => {
    if (riskFilter !== 'All' && s.prediction.riskLevel !== riskFilter) return false;
    if (behaviorFilter !== 'All' && s.features.behaviorStatus !== behaviorFilter) return false;
    if (pageFilter !== 'All') {
        const pageClean = s.latestPage || '/';
        if (pageFilter === 'Home' && pageClean !== '/') return false;
        if (pageFilter === 'Products' && pageClean !== '/products') return false;
        if (pageFilter === 'Product Details' && !pageClean.startsWith('/products/')) return false;
        if (pageFilter === 'Cart' && pageClean !== '/cart') return false;
        if (pageFilter === 'Checkout' && pageClean !== '/checkout') return false;
    }
    return true;
  });

  const getRiskBadge = (level: string, score: number) => {
    switch (level) {
      case 'HIGH': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">{score}% HIGH</span>;
      case 'MEDIUM': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">{score}% MEDIUM</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">{score}% LOW</span>;
    }
  };

  const getBehaviorBadge = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-blue-50 text-blue-700 border-blue-200',
      'ENGAGED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'HESITATING': 'bg-orange-50 text-orange-700 border-orange-200',
      'INACTIVE': 'bg-slate-100 text-slate-700 border-slate-300',
      'CONFUSED': 'bg-red-50 text-red-700 border-red-200',
    };
    const css = colors[status] || colors['ACTIVE'];
    return <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${css}`}>{status}</span>;
  };

  return (
    <div>
      <div className="bg-slate-50 border-b border-slate-200 p-3 px-6 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-medium">Risk:</label>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All</option>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-medium">Behavior:</label>
          <select value={behaviorFilter} onChange={e => setBehaviorFilter(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All</option>
            <option>ACTIVE</option>
            <option>ENGAGED</option>
            <option>HESITATING</option>
            <option>INACTIVE</option>
            <option>CONFUSED</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-medium">Page:</label>
          <select value={pageFilter} onChange={e => setPageFilter(e.target.value)} className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All</option>
            <option>Home</option>
            <option>Products</option>
            <option>Product Details</option>
            <option>Cart</option>
            <option>Checkout</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr className="bg-white text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-6 font-medium">User</th>
              {isHistory && <th className="py-3 px-4 font-medium">Date</th>}
              <th className="py-3 px-4 font-medium">{isHistory ? 'Session ID' : 'Session'}</th>
              {isHistory ? (
                <>
                  <th className="py-3 px-4 font-medium">Start Time</th>
                  <th className="py-3 px-4 font-medium">End Time</th>
                </>
              ) : (
                <th className="py-3 px-4 font-medium">Current Page</th>
              )}
              <th className="py-3 px-4 font-medium">Duration</th>
              <th className="py-3 px-4 font-medium">{isHistory ? 'Status' : 'Behavior'}</th>
              <th className="py-3 px-4 font-medium">Risk</th>
              {!isHistory && <th className="py-3 px-6 font-medium text-right">Confidence</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isHistory ? 8 : 8} className="py-12 text-center text-slate-500">
                  No sessions match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const startDate = new Date(s.startTime);
                const endDate = s.endTime ? new Date(s.endTime) : null;
                const formattedDate = startDate.toLocaleDateString('en-GB').replace(/\//g, '-');
                const formattedStart = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const formattedEnd = endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown';

                return (
                  <tr 
                    key={s.sessionId} 
                    onClick={() => onSelectSession(s)}
                    className={`cursor-pointer transition-colors ${selectedSessionId === s.sessionId ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-700 flex items-center gap-2">
                        {s.userId}
                        {!isHistory && s.isLive && <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Live Session"></span>}
                      </div>
                    </td>
                    {isHistory && <td className="py-4 px-4 text-slate-600 font-mono text-xs">{formattedDate}</td>}
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs">{s.sessionId}</td>
                    
                    {isHistory ? (
                      <>
                        <td className="py-4 px-4 text-slate-600 font-mono text-xs">{formattedStart}</td>
                        <td className="py-4 px-4 text-slate-600 font-mono text-xs">{formattedEnd}</td>
                      </>
                    ) : (
                      <td className="py-4 px-4 text-slate-600 truncate max-w-[150px]" title={s.latestPage}>{s.latestPage || '/'}</td>
                    )}
                    
                    <td className="py-4 px-4 font-mono text-slate-600">
                      {Math.floor(s.features.sessionDuration / 60)}m {Math.floor(s.features.sessionDuration % 60)}s
                    </td>
                    
                    <td className="py-4 px-4">
                      {isHistory ? (
                        <span className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-slate-700 border-slate-300">
                          {s.sessionStatus}
                        </span>
                      ) : (
                        getBehaviorBadge(s.features.behaviorStatus)
                      )}
                    </td>
                    <td className="py-4 px-4">{getRiskBadge(s.prediction.riskLevel, s.prediction.riskScore)}</td>
                    {!isHistory && <td className="py-4 px-6 font-mono text-slate-600 text-right">{s.prediction.confidence}%</td>}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
