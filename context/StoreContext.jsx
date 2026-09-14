'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('lynx_cart') || '[]');
    const savedWishlist = JSON.parse(localStorage.getItem('lynx_wishlist') || '[]');
    setCart(savedCart);
    setWishlist(savedWishlist);
  }, []);

  const addToCart = (product, quantity = 1, selectedSize = 'M') => {
    let updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.id === product.id && item.size === selectedSize
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ ...product, quantity, size: selectedSize });
    }

    setCart(updatedCart);
    localStorage.setItem('lynx_cart', JSON.stringify(updatedCart));
    setIsCartOpen(true); // فتح السلة تلقائياً عند إضافة منتج
  };

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem('lynx_cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (index, delta) => {
    let updatedCart = [...cart];
    const newQty = updatedCart[index].quantity + delta;
    if (newQty > 0) {
      updatedCart[index].quantity = newQty;
      setCart(updatedCart);
      localStorage.setItem('lynx_cart', JSON.stringify(updatedCart));
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('lynx_cart');
  };

  const toggleWishlist = (productId) => {
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem('lynx_wishlist', JSON.stringify(updated));
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
