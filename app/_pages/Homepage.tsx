// app/_pages/Homepage.tsx
import React from 'react';
import ChatBox from '@/app/_components/ChatBox';
import ProductList from '@/app/_components/ProductList';
import Cart from '@/app/_components/Cart';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
          {/* Left side - ChatBox and ProductList */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <ChatBox />
            <ProductList />
          </div>
          
          {/* Right side - Cart */}
          <div className="lg:col-span-1">
            <Cart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;