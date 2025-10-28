import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Unified cart for both rides and online store items
  const [cart, setCart] = useState([]); // Contains both rides and store merchandise
  const [storeCart, setStoreCart] = useState([]); // Legacy: for in-park only stores

  // Unified cart functions (for rides and online-available store items)
  const addToCart = (item) => {
    setCart((prev) => {
      // For rides: match by id only
      // For store items: match by id AND storeId
      const existing = prev.find((cartItem) => {
        if (item.type === 'store' && cartItem.type === 'store') {
          return cartItem.id === item.id && cartItem.storeId === item.storeId;
        }
        return cartItem.id === item.id;
      });

      if (existing) {
        return prev.map((cartItem) =>
          (cartItem.type === 'store' && item.type === 'store')
            ? (cartItem.id === item.id && cartItem.storeId === item.storeId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem)
            : (cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem)
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId, storeId = null) => {
    setCart((prev) =>
      prev
        .map((item) => {
          // For store items, match both id and storeId
          if (storeId && item.storeId) {
            return item.id === itemId && item.storeId === storeId
              ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
              : item;
          }
          // For rides, match id only
          return item.id === itemId
            ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
            : item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  // Calculate unified cart total
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Get items by type from unified cart
  const getRideItems = () => cart.filter(item => item.type === 'ride' || !item.type);
  const getStoreItems = () => cart.filter(item => item.type === 'store');

  // Legacy store cart functions (for in-park only stores - food/beverage)
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
        // Unified cart (for rides and online store items)
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        getRideItems,
        getStoreItems,
        // Legacy store cart (for in-park only stores)
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
