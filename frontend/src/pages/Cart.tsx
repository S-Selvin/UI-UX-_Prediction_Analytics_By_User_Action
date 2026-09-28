
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';

export function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  const shipping: number = 0; // Free shipping for demo
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="mx-auto bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-indigo-300" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you'll love!
        </p>
        <Button onClick={() => navigate('/products')} size="lg">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-200">
              {items.map((item) => (
                <li key={item.product.id} className="p-6 flex flex-col sm:flex-row gap-6">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-slate-900">
                          <Link to={`/products/${item.product.id}`} className="hover:text-indigo-600 transition-colors">
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="ml-4 text-base font-bold text-slate-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.product.category}</p>
                    </div>

                    <div className="flex flex-1 items-end justify-between mt-4">
                      <div className="flex items-center border border-slate-300 rounded-lg h-9">
                        <button 
                          className="px-3 text-slate-500 hover:text-indigo-600 focus:outline-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                        <button 
                          className="px-3 text-slate-500 hover:text-indigo-600 focus:outline-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Subtotal</p>
                <p className="text-sm font-medium text-slate-900">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Shipping</p>
                <p className="text-sm font-medium text-slate-900">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Estimated Tax</p>
                <p className="text-sm font-medium text-slate-900">${tax.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 mb-8">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-slate-900">Total</p>
                <p className="text-xl font-bold text-indigo-600">${total.toFixed(2)}</p>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="mt-4 text-center">
              <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                or Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
