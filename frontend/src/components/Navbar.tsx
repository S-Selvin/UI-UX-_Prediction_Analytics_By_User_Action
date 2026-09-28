
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ShopSense</span>
            </Link>
            <div className="flex items-center space-x-6">
            <Link to="/products" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
              Products
            </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all w-64 outline-none"
              />
            </div>
            
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="p-2 text-slate-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
