
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as { orderId: string, total: number } | null;

  if (!state) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Order Successful!</h1>
      <p className="text-lg text-slate-600 mb-10">
        Thank you for your purchase. We've received your order and are getting it ready for shipment.
      </p>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md mx-auto mb-10">
        <div className="flex items-center justify-center mb-6">
          <Package className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
        </div>
        
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-slate-500">Order Number</span>
            <span className="font-semibold text-slate-900">{state.orderId}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-500">Total Amount</span>
            <span className="font-bold text-indigo-600">${state.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
        <Button size="lg" onClick={() => navigate('/')}>
          Back to Home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
