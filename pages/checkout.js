"use client";

import { useCart } from "@/components/CartContext";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { countries } from "@/utils/countries";


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟡 Submit button clicked");

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          cartItems,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Order successfully placed. Redirecting...");

        clearCart();
        router.push("/thank-you");
      } else {
        console.error("❌ Failed to place order:", result.error);
        alert("Failed to place order: " + result.error);
      }

    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Order submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("✅ Cart Items:", cartItems);
  }, [cartItems]);

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

          {/* ✅ Country Dropdown */}
          <select
  name="country"
  value={formData.country}
  onChange={handleChange}
  required
  className="border p-3 rounded"
>
  <option value="">Select Country</option>
  {countries.map((c) => (
    <option key={c.code} value={c.code}>
      {c.name}
    </option>
  ))}
</select>

<button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>

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
            Total: ${parseFloat(cartTotal).toFixed(2)}
          </div>
        </div>

       
      </main>
    </div>
  );
}
