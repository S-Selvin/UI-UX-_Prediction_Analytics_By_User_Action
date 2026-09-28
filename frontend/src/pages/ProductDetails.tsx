import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Product not found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-slate-100 rounded-3xl overflow-hidden aspect-square border border-slate-200">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-medium text-indigo-600 uppercase tracking-wider">
            {product.category}
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current opacity-50" />
            </div>
            <span className="text-sm font-medium text-slate-700">{product.rating} Rating</span>
            <span className="text-sm text-slate-500 underline cursor-pointer">{product.reviewsCount} Reviews</span>
          </div>

          <div className="text-3xl font-bold text-slate-900 mb-6">
            ${product.price.toFixed(2)}
          </div>

          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="border-t border-b border-slate-200 py-6 mb-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Truck className="h-5 w-5 text-indigo-600" />
              <span>Free delivery on orders over $100</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span>2-year warranty included</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border border-slate-300 rounded-lg h-12">
              <button 
                className="px-4 text-slate-500 hover:text-indigo-600 focus:outline-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium text-slate-900">{quantity}</span>
              <button 
                className="px-4 text-slate-500 hover:text-indigo-600 focus:outline-none"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-500">Only 12 items left in stock!</p>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
