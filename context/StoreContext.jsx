'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lynx_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveCart = (items) => {
    setCart(items);
    localStorage.setItem('lynx_cart', JSON.stringify(items));
  };

  const addToCart = (product) => {
    const existingIndex = cart.findIndex((i) => i.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    saveCart(cart.filter((i) => i.id !== id));
  };

  const clearCart = () => saveCart([]);

  return (
    <StoreContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
