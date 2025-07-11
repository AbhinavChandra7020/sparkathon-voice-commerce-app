// app/_components/ProductList.tsx
"use client"
import React, { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
  category: string;
}

const ProductList: React.FC = () => {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      rating: 4.5,
      description: "Premium sound quality with active noise cancellation",
      category: "Electronics"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      rating: 4.3,
      description: "Track your health and fitness goals with style",
      category: "Wearables"
    },
    {
      id: 3,
      name: "Portable Power Bank",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1609592806285-9f3c6a7f21c1?w=300&h=300&fit=crop",
      rating: 4.7,
      description: "20000mAh capacity with fast charging technology",
      category: "Accessories"
    },
    {
      id: 4,
      name: "Wireless Charging Pad",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1586953268550-5d2d4ac2f0c3?w=300&h=300&fit=crop",
      rating: 4.2,
      description: "Fast wireless charging for all compatible devices",
      category: "Accessories"
    },
    {
      id: 5,
      name: "Smart Home Speaker",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      rating: 4.6,
      description: "Voice-controlled smart speaker with premium audio",
      category: "Smart Home"
    },
    {
      id: 6,
      name: "USB-C Hub",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300&h=300&fit=crop",
      rating: 4.4,
      description: "7-in-1 hub with HDMI, USB ports, and SD card reader",
      category: "Accessories"
    }
  ]);

  const addToCart = (product: Product) => {
    console.log('Adding to cart:', product);
    // This would typically dispatch to a cart state management system
  };

  const toggleWishlist = (productId: number) => {
    console.log('Toggle wishlist:', productId);
    // This would typically update wishlist state
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/10 to-black border border-purple-800/20 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-purple-300">Recommended Products</h2>
        <span className="text-sm text-purple-200 bg-purple-900/30 px-3 py-1 rounded-full">
          {products.length} items
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-900/50 border border-purple-700/20 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20 group"
          >
            <div className="relative mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-purple-600/80 transition-colors"
              >
                <Heart size={16} className="text-purple-300" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                {product.name}
              </h3>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-xs text-purple-200">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-purple-300">{product.category}</span>
              </div>
              
              <p className="text-xs text-gray-400 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-purple-300">
                  ${product.price}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-lg shadow-purple-600/30"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;