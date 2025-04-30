"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export function useCart() {
  return useContext(CartContext);
}

// Provider component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on page load
  useEffect(() => {
    const savedCart = localStorage.getItem("sendshop-cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sendshop-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, variantId, variantName, retailPrice) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.variantId === variantId);

      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex].quantity += 1;
        return updatedCart;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            thumbnail_url: product.thumbnail_url,
            slug: product.slug,
            variantId,
            variantName,
            retailPrice,
            quantity: 1
          }
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update quantity
  const updateQuantity = (index, newQuantity) => {
    setCartItems(prev => {
      const updatedCart = [...prev];
      if (newQuantity < 1) return updatedCart;
      updatedCart[index].quantity = newQuantity;
      return updatedCart;
    });
  };

  // Clear cart
  const clearCart = () => setCartItems([]);

  // Calculate total
  const cartTotal = cartItems
    .reduce((total, item) => {
      const price = parseFloat(item.retailPrice) || 0;
      return total + price * (item.quantity || 1);
    }, 0)
    .toFixed(2);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
