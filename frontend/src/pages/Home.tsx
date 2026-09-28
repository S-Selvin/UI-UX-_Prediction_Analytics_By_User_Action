
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-extrabold tracking-tight mb-6">
              Next Generation Tech, Curated For You
            </h1>
            <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
              Discover the latest in premium electronics, wearables, and accessories. Elevate your everyday life with our handpicked collection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-indigo-900 bg-white rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Fast & Free Delivery</h3>
              <p className="text-slate-500">Free shipping on all orders over $100. Get it delivered in 1-3 business days.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Payments</h3>
              <p className="text-slate-500">Your payment information is processed securely with industry-standard encryption.</p>
            </div>
            <div className="p-6">
              <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Returns</h3>
              <p className="text-slate-500">Not satisfied? Return your item within 30 days for a full refund, no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
              <p className="mt-2 text-slate-500">Our most popular items handpicked just for you.</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center text-indigo-600 font-medium hover:text-indigo-700">
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700">
              View all products
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
