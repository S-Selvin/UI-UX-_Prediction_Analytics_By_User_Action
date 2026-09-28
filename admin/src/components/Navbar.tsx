import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                ShopSense <span className="text-indigo-600 font-normal">Predictive UX Analytics</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
