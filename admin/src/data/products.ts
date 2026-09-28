import type { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 398.00,
    description: 'Industry-leading noise cancellation. Exceptional sound quality. Up to 30 hours battery life with quick charging (3 min charge for 3 hours of playback).',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 1245
  },
  {
    id: '2',
    name: 'Apple Watch Series 9',
    price: 399.00,
    description: 'Smarter, brighter, mightier. The most powerful chip in Apple Watch ever. A magical new way to use your watch without touching the screen.',
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 856
  },
  {
    id: '3',
    name: 'Peak Design Everyday Backpack',
    price: 279.95,
    description: 'An iconic, award-winning pack for everyday and photo carry. Built around access, organization, expansion, and protection.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 432
  },
  {
    id: '4',
    name: 'Nike Air Zoom Pegasus 40',
    price: 130.00,
    description: 'A springy ride for every run. The Pegs familiar, just-for-you feel returns to help you accomplish your goals.',
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviewsCount: 2150
  },
  {
    id: '5',
    name: 'Bose SoundLink Revolve+ II',
    price: 329.00,
    description: 'Deep, loud, and immersive sound, with True 360-degree coverage. Built-in microphone for speakerphone to take clear conference or personal calls out loud.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 678
  },
  {
    id: '6',
    name: 'Keychron Q1 Pro Mechanical Keyboard',
    price: 199.00,
    description: 'A fully customizable 75% layout mechanical keyboard with QMK/VIA support. Features a full aluminum CNC machined body.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 342
  }
];
