import { useState } from 'react';
import { Globe, Plus, Code, DatabaseBackup } from 'lucide-react';
import type { AnalyzedWebsite } from '../../analytics/types';

interface ConnectWebsiteProps {
  onConnected: (website: AnalyzedWebsite) => void;
}

export function ConnectWebsite({ onConnected }: ConnectWebsiteProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('E_COMMERCE');
  const [goal, setGoal] = useState('PURCHASE');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fallbackMode, setFallbackMode] = useState(false);
  const [createdSite, setCreatedSite] = useState<AnalyzedWebsite | null>(null);

  const websiteTypes = ['E_COMMERCE', 'EDUCATION', 'COLLEGE', 'HEALTHCARE', 'BANKING', 'BOOKING', 'SAAS', 'GOVERNMENT', 'CUSTOM'];
  const primaryGoals = ['PURCHASE', 'REGISTRATION', 'FORM_SUBMISSION', 'APPOINTMENT', 'APPLICATION', 'DOWNLOAD', 'BOOKING', 'SIGNUP', 'ACTIVATION', 'CUSTOM_GOAL'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Website name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setFallbackMode(false);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/websites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_name: name, website_type: type, primary_goal: goal })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create website via backend');
      }
      
      setCreatedSite(data.website);
      onConnected(data.website);
    } catch (err: any) {
      console.warn('Backend unavailable, falling back to local mode.', err);
      // Fallback Mode logic
      setFallbackMode(true);
      const uniqueHex = Math.random().toString(36).substring(2, 8); // crypto fallback for frontend purely in demo if backend is dead
      const timestampHex = Date.now().toString(36);
      
      const localSite: AnalyzedWebsite = {
        website_id: `site_${timestampHex}_${uniqueHex}`,
        website_name: name.trim(),
        website_type: type,
        primary_goal: goal,
        created_at: new Date().toISOString()
      };
      
      // store in local storage as fallback
      const localStr = localStorage.getItem('shopsense_websites_fallback');
      const localArr: AnalyzedWebsite[] = localStr ? JSON.parse(localStr) : [];
      localArr.push(localSite);
      localStorage.setItem('shopsense_websites_fallback', JSON.stringify(localArr));
      
      setCreatedSite(localSite);
      onConnected(localSite);
    } finally {
      setLoading(false);
    }
  };

  if (createdSite) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative mb-6">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <Globe className="w-5 h-5" />
            <h3 className="font-bold">Website Connected Successfully</h3>
          </div>
          
          {fallbackMode && (
             <div className="mb-4 bg-amber-50 text-amber-800 text-xs font-bold p-3 rounded-lg border border-amber-200 flex items-center gap-2">
               <DatabaseBackup className="w-4 h-4" />
               Local Fallback Mode: PostgreSQL backend was unavailable. Configuration saved locally for demo purposes only.
             </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="block text-slate-500 font-medium mb-1">Name</span>
              <span className="font-bold text-slate-800">{createdSite.website_name}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium mb-1">Website ID</span>
              <span className="font-mono text-indigo-600 font-bold">{createdSite.website_id}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium mb-1">Type</span>
              <span className="font-medium text-slate-700">{createdSite.website_type}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium mb-1">Primary Goal</span>
              <span className="font-medium text-slate-700">{createdSite.primary_goal}</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Code className="w-4 h-4" /> SDK Integration Snippet
            </div>
            <pre className="text-emerald-400 text-sm overflow-x-auto">
              <code>
{`import { ShopSense } from 'shopsense-sdk';

ShopSense.init({
  websiteId: "${createdSite.website_id}",
  goal: "${createdSite.primary_goal}"
});`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-6 text-indigo-600">
        <Plus className="w-5 h-5" />
        <h3 className="font-bold text-slate-800">Connect New Website</h3>
      </div>
      
      {error && (
        <div className="mb-4 bg-rose-50 text-rose-700 text-sm p-3 rounded-lg border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Website Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm p-2 border border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="e.g. My SaaS App"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Website Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none bg-white"
            >
              {websiteTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Primary Goal</label>
            <select 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none bg-white"
            >
              {primaryGoals.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-bold text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Website'}
        </button>
      </form>
    </div>
  );
}
