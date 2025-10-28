import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]); // Ride tickets cart
  const [storeCart, setStoreCart] = useState([]); // Store merchandise cart

  // Ride cart functions
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

  const clearCart = () => setCart([]);

  // Calculate ride cart total
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Store cart functions
  const addToStoreCart = (item) => {
    setStoreCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.storeId === item.storeId);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.storeId === item.storeId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromStoreCart = (itemId) => {
    setStoreCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearStoreCart = () => setStoreCart([]);

  // Calculate store cart total
  const storeTotal = storeCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        // Ride cart
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        // Store cart
        storeCart,
        addToStoreCart,
        removeFromStoreCart,
        clearStoreCart,
        storeTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
