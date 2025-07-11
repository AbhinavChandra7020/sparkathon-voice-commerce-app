// app/_components/Cart.tsx
"use client"
import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, CreditCard } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Wireless Bluetooth Headphones",
      price: 89.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 199.99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop"
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
    } else {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="text-purple-300" size={24} />
          <h2 className="text-xl font-bold text-purple-300">Shopping Cart</h2>
        </div>
        <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full">
          {totalItems}
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">Your cart is empty</p>
          <p className="text-sm text-purple-300 mt-2">Add some products to get started!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-purple-700/20"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm text-purple-300 font-bold">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  
                  <span className="text-white w-8 text-center">{item.quantity}</span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="border-t border-purple-700/30 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-purple-300">Total:</span>
              <span className="text-2xl font-bold text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            
            <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2">
              <CreditCard size={20} />
              <span>Checkout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;