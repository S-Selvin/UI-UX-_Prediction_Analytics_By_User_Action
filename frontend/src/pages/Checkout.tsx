import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { trackEvent } from '../analytics/core';

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      trackEvent('checkout_started', window.location.pathname, undefined, { total_items: items.length, subtotal });
    }
  }, [items.length, subtotal]);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    trackEvent('order_completed', window.location.pathname, undefined, { order_total: total });
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      const orderId = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      navigate('/order-success', { state: { orderId, total } });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="text-slate-500 mt-2 flex items-center">
          <Lock className="h-4 w-4 mr-1" /> Secure Encrypted Checkout
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-8"
            onFocus={() => {
              if (!window.sessionStorage.getItem('form_interacted')) {
                trackEvent('checkout_form_interaction', window.location.pathname);
                window.sessionStorage.setItem('form_interacted', 'true');
              }
            }}
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" required placeholder="John" />
                <Input label="Last Name" required placeholder="Doe" />
                <div className="md:col-span-2">
                  <Input type="email" label="Email Address" required placeholder="john@example.com" />
                </div>
                <div className="md:col-span-2">
                  <Input type="tel" label="Phone Number" required placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Address Line 1" required placeholder="123 Main St" />
                </div>
                <div className="md:col-span-2">
                  <Input label="Address Line 2 (Optional)" placeholder="Apt, Suite, Unit, etc." />
                </div>
                <Input label="City" required placeholder="New York" />
                <Input label="State / Province" required placeholder="NY" />
                <Input label="Zip / Postal Code" required placeholder="10001" />
                <Input label="Country" required placeholder="United States" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                Payment Method
              </h2>
              <div className="space-y-4">
                <div className="border border-indigo-600 bg-indigo-50/50 rounded-xl p-4 flex items-start">
                  <input 
                    type="radio" 
                    id="card" 
                    name="payment" 
                    className="mt-1 text-indigo-600 focus:ring-indigo-500" 
                    defaultChecked 
                    onChange={() => trackEvent('payment_method_selected', window.location.pathname, undefined, { method: 'credit_card' })}
                  />
                  <label htmlFor="card" className="ml-3 flex-1 cursor-pointer">
                    <span className="block font-medium text-slate-900">Credit or Debit Card</span>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input placeholder="Card Number" required />
                      </div>
                      <Input placeholder="MM/YY" required />
                      <Input placeholder="CVC" required />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={isProcessing}>
              {isProcessing ? 'Processing Order...' : `Place Order • $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-slate-900 line-clamp-2">{item.product.name}</p>
                    <p className="text-slate-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium text-slate-900">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Estimated Tax</span>
                <span className="font-medium text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-200">
                <span className="text-slate-900">Total</span>
                <span className="text-indigo-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center text-sm text-slate-600">
                <ShieldCheck className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0" />
                100% Secure Checkout
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Truck className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                Free Shipping on this order
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
