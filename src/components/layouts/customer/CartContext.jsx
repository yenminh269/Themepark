import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Add ride (increment quantity if exists)
  const addToCart = (ride) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === ride.id);
      if (existing) {
        return prev.map((item) =>
          item.id === ride.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...ride, quantity: 1 }];
      }
    });
  };

  // Remove one ticket (decrement or remove entirely)
  const removeFromCart = (rideId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === rideId
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Calculate total dynamically
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
