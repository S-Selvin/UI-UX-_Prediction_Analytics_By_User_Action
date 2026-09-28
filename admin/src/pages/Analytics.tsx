import { useState, useEffect } from 'react';

import { RiskDistribution } from '../components/analytics/RiskDistribution';
import { BehaviorOverview } from '../components/analytics/BehaviorOverview';
import { SessionTable } from '../components/analytics/SessionTable';
import { SessionDetail } from '../components/analytics/SessionDetail';
import { AbandonmentFunnel } from '../components/analytics/AbandonmentFunnel';
import { PagePerformance } from '../components/analytics/PagePerformance';
import { CommonUXIssues } from '../components/analytics/CommonUXIssues';
import { UXProblemCenter } from '../components/analytics/UXProblemCenter';
import { OwnerActionCenter } from '../components/analytics/OwnerActionCenter';
import { UXImprovementSimulator } from '../components/analytics/UXImprovementSimulator';
import { BeforeAfterMeasurement } from '../components/analytics/BeforeAfterMeasurement';
import { ConnectWebsite } from '../components/analytics/ConnectWebsite';

import { Activity, Globe, RefreshCw } from 'lucide-react';
import { getDashboardData } from '../analytics/dashboardUtils';
import type { SessionData } from '../analytics/dashboardUtils';
import type { AnalyzedWebsite } from '../analytics/types';

export function Analytics() {
  const [activeWebsiteId, setActiveWebsiteId] = useState('demo-site');
  const [websites, setWebsites] = useState<AnalyzedWebsite[]>([]);
  const [data, setData] = useState<any>(null); // Start with null for async load
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);

  useEffect(() => {
    // Fetch websites from backend, with local fallback
    const fetchWebsites = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/websites`);
        const json = await response.json();
        if (response.ok && json.success) {
          setWebsites(json.websites);
        } else {
          throw new Error('Failed to fetch from backend');
        }
      } catch (err) {
        // Fallback to local
        const localStr = localStorage.getItem('shopsense_websites_fallback');
        if (localStr) {
          setWebsites(JSON.parse(localStr));
        }
      }
    };
    fetchWebsites();
    
    const handleEventsChange = async () => {
      const dashboardData = await getDashboardData(activeWebsiteId);
      setData(dashboardData);
    };
    
    // Set up polling interval for hackathon
    const pollInterval = setInterval(handleEventsChange, 3000);
    
    window.addEventListener('shopsense_event_tracked', handleEventsChange);
    window.addEventListener('shopsense_events_cleared', handleEventsChange);
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('shopsense_event_tracked', handleEventsChange);
      window.removeEventListener('shopsense_events_cleared', handleEventsChange);
    };
  }, [activeWebsiteId]);

  useEffect(() => {
    // Immediate refresh on website change
    getDashboardData(activeWebsiteId).then(dashboardData => {
      setData(dashboardData);
      setSelectedSession(null); // Clear selected session when switching sites
    });
  }, [activeWebsiteId]);

  const activeWebsite = websites.find(w => w.website_id === activeWebsiteId) || {
    website_id: 'demo-site',
    website_name: 'ShopSense Demo Store',
    website_type: 'E_COMMERCE',
    primary_goal: 'PURCHASE'
  };

  // If selected session updates in the background, we should reflect its new state.
  // We can find the latest version of the selected session from data.sessions.
  const activeSession = selectedSession 
    ? data.sessions.find((s: any) => s.sessionId === selectedSession.sessionId) || selectedSession
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            ShopSense Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Understand user behavior and predict abandonment in real time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Globe className="w-4 h-4 text-slate-500" />
            <select
              value={activeWebsiteId}
              onChange={(e) => setActiveWebsiteId(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 outline-none pr-4 appearance-none"
            >
              <option value="demo-site">Demo Store</option>
              {websites.map(w => (
                <option key={w.website_id} value={w.website_id}>{w.website_name}</option>
              ))}
            </select>
          </div>
          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 uppercase">
            Goal: <span className="text-indigo-600">{activeWebsite.primary_goal}</span>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('shopsense_event_tracked'))}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Force Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1600px] mx-auto">
        <ConnectWebsite onConnected={(site) => {
          setWebsites(prev => [...prev, site]);
          setActiveWebsiteId(site.website_id);
        }} />

        {!data ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Analytics...</h2>
          </div>
        ) : data.sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm border border-slate-100 mb-6">
              <Activity className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No analytics data yet</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Start browsing the connected website to generate user behavior data. The dashboard will update automatically.
            </p>
            <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
              Go to Shop
            </a>
          </div>
        ) : (() => {
          const currentSessions = data.sessions.filter((s: any) => s.sessionStatus === 'ACTIVE');
          const historicalSessions = data.sessions.filter((s: any) => s.sessionStatus === 'ENDED' || s.sessionStatus === 'ABANDONED');
          
          return (
          <main className="space-y-8">


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Current Sessions */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800">CURRENT SESSIONS</h2>
                  <p className="text-sm text-slate-500">Live and active user sessions.</p>
                </div>
                <SessionTable 
                  sessions={currentSessions} 
                  onSelectSession={setSelectedSession} 
                  selectedSessionId={activeSession?.sessionId}
                  isHistory={false}
                />
              </div>

              {/* Session History */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-800">SESSION HISTORY</h2>
                  <p className="text-sm text-slate-500">Completed and abandoned historical sessions.</p>
                </div>
                <SessionTable 
                  sessions={historicalSessions} 
                  onSelectSession={setSelectedSession} 
                  selectedSessionId={activeSession?.sessionId}
                  isHistory={true}
                />
              </div>

              {/* UX Problem Center */}
              <UXProblemCenter sessions={data.sessions} />

              {/* Website Owner Action Center */}
              <OwnerActionCenter sessions={data.sessions} />

              {/* What-if Simulator */}
              <UXImprovementSimulator sessions={data.sessions} />

              {/* Before/After Measurement */}
              <BeforeAfterMeasurement sessions={data.sessions} />

              {/* Page Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800">Page Performance</h2>
                </div>
                <PagePerformance data={data.pagePerformance} />
              </div>
            </div>

            <div className="space-y-8">
              {/* Risk Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 mb-6">Risk Distribution</h2>
                <RiskDistribution distribution={data.riskDistribution} total={data.sessions.length} />
              </div>

              {/* Behavior Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 mb-6">Behavior Overview (Avg)</h2>
                <BehaviorOverview sessions={data.sessions} />
              </div>

              {/* Funnel */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="font-bold text-slate-800 mb-6">Abandonment Funnel</h2>
                <AbandonmentFunnel stats={data.funnel} />
              </div>

              {/* Common UX Issues */}
              <CommonUXIssues sessions={data.sessions} />
            </div>
          </div>
        </main>
        );
      })()}
      </div>

      {/* Session Detail Drawer */}
      <SessionDetail 
        session={activeSession} 
        onClose={() => setSelectedSession(null)} 
      />

    </div>
  );
}
