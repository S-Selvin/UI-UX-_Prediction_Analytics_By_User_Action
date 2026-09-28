
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-indigo-200">
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium">{product.rating}</span>
          <span className="text-slate-400">({product.reviewsCount})</span>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-slate-500">{product.category}</p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
          <Button 
            size="sm" 
            onClick={() => addToCart(product)}
            className="rounded-full px-4"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
