'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedSize, setSelectedSize] = useState({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // استدعاء المنتجات من قاعدة البيانات
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  const addToCart = (product) => {
    const size = selectedSize[product.id] || 'M';
    setCart([...cart, { ...product, size, qty: 1 }]);
  };

  return (
    <div className="bg-[#0D0D0D] text-white min-h-screen font-sans border-t-2 border-[#C0C0C0]">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-widest text-[#C0C0C0] font-serif">LYNX</h1>
        <button 
          onClick={() => setIsCheckoutOpen(true)}
          className="bg-[#1A1A1A] border border-[#C0C0C0] px-5 py-2 rounded-md hover:bg-[#C0C0C0] hover:text-black transition"
        >
          السلة ({cart.length})
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-8 text-center tracking-wider">تشكيلة الـ OVERSAIZED الحصرية</h2>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((item) => (
            <div key={item.id} className="bg-[#141414] border border-gray-800 p-4 rounded-lg flex flex-col justify-between">
              <div>
                <img src={item.image_url || '/placeholder.jpg'} alt={item.title} className="w-full h-80 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-[#C0C0C0] text-lg font-bold mb-4">{item.price} EGP</p>
                
                {/* Size Selector */}
                <div className="flex gap-2 mb-4">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize({ ...selectedSize, [item.id]: size })}
                      className={`px-3 py-1 text-xs border rounded ${
                        (selectedSize[item.id] || 'M') === size ? 'bg-[#C0C0C0] text-black border-white' : 'border-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => addToCart(item)}
                className="w-full bg-[#1F1F1F] border border-[#C0C0C0] text-white py-2 rounded hover:bg-[#C0C0C0] hover:text-black transition uppercase font-semibold text-sm"
              >
                إضافة للسلة
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}