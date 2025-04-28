"use client";

import { useCart } from "@/components/CartContext";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Later: Send order to Printful API here
    console.log("Order Data:", {
      formData,
      cartItems,
      total: cartTotal
    });

    alert("Order submitted! (In real version, this would send to Printful)");
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 pt-[32px] pb-[60px] px-[32px]">
        <h1 className="text-3xl font-bold mb-6 font-[Open_Sans]">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="border p-3 rounded" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="border p-3 rounded" />
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="border p-3 rounded md:col-span-2" />
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" required className="border p-3 rounded" />
          <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" required className="border p-3 rounded" />
          <input type="text" name="zip" value={formData.zip} onChange={handleChange} placeholder="Zip Code" required className="border p-3 rounded" />
          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" required className="border p-3 rounded" />
        </form>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 font-[Open_Sans]">Your Items</h2>
          {cartItems.map((item, index) => (
            <div key={index} className="border-b py-4 flex justify-between">
              <div>
                <p className="font-[Open_Sans]">{item.name} ({item.variantName})</p>
                <p className="text-sm text-gray-600">{item.quantity} × ${parseFloat(item.retailPrice).toFixed(2)}</p>
              </div>
              <p className="font-[Open_Sans] font-bold">${(parseFloat(item.retailPrice) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="text-right font-bold text-xl mt-4 font-[Open_Sans]">
            Total: ${cartTotal}
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
          Place Order
        </button>
      </main>
    </div>
  );
}
