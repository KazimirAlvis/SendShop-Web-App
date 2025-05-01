"use client";

import { useCart } from "@/components/CartContext"; // ✅
import Sidebar from "@/components/Sidebar"; // ✅
import Link from 'next/link';

export default function CartPage() {
    const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart(); // <--- add updateQuantity here!
  
  

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen bg-white text-gray-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Empty Cart Message */}
        <main className="flex-1 p-8 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold mb-4 font-[Open_Sans]">Your Cart is Empty</h1>
          <Link href="/" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Cart Content */}
      <main className="flex-1 p-8 pt-[32px] pb-[60px] px-[32px]">
        <h1 className="text-3xl font-bold mb-8 font-[Open_Sans]">Your Cart</h1>

        <div className="space-y-6">
          {cartItems.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center border p-4 rounded-md">
            <img src={item.thumbnail_url} alt={item.name} className="w-32 h-32 object-cover rounded-md mr-6" />
            
            <div className="flex-1">
              <h2 className="text-lg font-semibold font-[Open_Sans] mb-2">{item.name}</h2>
              <p className="text-sm text-gray-600 mb-1 font-[Open_Sans]">{item.variantName}</p>
          
              {/* Quantity Controls */}
              <div className="flex items-center mt-2">
                    <button
                        onClick={() => updateQuantity(index, cartItems[index].quantity - 1)}
                        disabled={cartItems[index].quantity <= 1}
                        className="bg-gray-300 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-400"
                    >
                        -
                    </button>
                    <span className="px-4">{cartItems[index].quantity}</span>
                    <button
                        onClick={() => updateQuantity(index, cartItems[index].quantity + 1)}
                        className="bg-gray-300 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-400"
                    >
                        +
                    </button>
                    </div>

          
              <p className="text-md font-bold text-blue-600 mt-2 font-[Open_Sans]">
                    ${(parseFloat(item.retailPrice || 0) * (item.quantity || 1)).toFixed(2)}
                </p>

            </div>
          
            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(index)}
              className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Remove
            </button>
          </div>
          
          ))}
        </div>

        {/* Cart Total */}
        <div className="mt-8 text-right">
          <h2 className="text-2xl font-bold font-[Open_Sans]">
            Total: ${cartTotal}
          </h2>
          {/* Checkout Button Placeholder */}
          <Link href="/checkout">
          <button
            disabled={cartItems.length === 0}
            className={`w-full font-bold py-3 px-6 rounded 
              ${cartItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            Proceed to Checkout
          </button>
        </Link>

        </div>
      </main>
    </div>
  );
}
