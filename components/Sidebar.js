"use client";

import { useCart } from "@/components/CartContext";
import Link from 'next/link';



// components/PrintfulConnect.js
export default function PrintfulConnect() {
  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_PRINTFUL_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_PRINTFUL_REDIRECT_URI;
    const authUrl = `https://www.printful.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    window.location.href = authUrl;
  };

  return (
    <button 
      onClick={handleConnect}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Connect to Printful
    </button>
  );
}

export default function Sidebar() {
  const { cartItems, cartTotal } = useCart();
  

  return (
    <aside className="w-[180px] bg-white flex flex-col items-center pt-[60px] pr-[32px] pl-[32px]">
      {/* Store Logo */}
      <div className="w-[150px] h-[150px] overflow-hidden rounded-full mb-4">
        <img src="/images/PH-logo.png" alt="Store Logo" className="h-auto w-full" />
      </div>

      {/* Cart Summary */}
      <div className="text-center mt-6 font-[Open_Sans]">
        <p className="text-[14px] text-gray-600 mb-1">🛒 {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}</p>
        <p className="text-[16px] font-bold text-gray-800">${cartTotal}</p>
      </div>

      {/* Optional: Add cart button link */}
      <Link href="/cart" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center text-sm">
        View Cart
      </Link>


      
    </aside>
  );
}
