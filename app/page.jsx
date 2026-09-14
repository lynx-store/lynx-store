'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const { cart, addToCart } = useStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['الكل', ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-widest text-white">
            LYNX
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-xl text-sm font-medium hover:border-white transition">
              السلة 🛒
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center px-4 bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">اكتشف أسلوبك الراقي مع LYNX</h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-lg">أحدث تصاميم الملابس الرجالية الفاخرة المصممة خصيصاً لتناسب تميزك.</p>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories Filter */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-8 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === cat 
                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-lg">جاري تحميل المنتجات الفاخرة...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-lg">لا توجد منتجات متاحة حالياً في هذا القسم.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group flex flex-col justify-between hover:border-neutral-700 transition">
                <div>
                  <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {product.is_offer && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                        عرض خاص
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-lg font-bold mt-1 text-white line-clamp-1">{product.title}</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-lg font-extrabold text-white">{product.price} ج.م</span>
                      {product.sale_price && (
                        <span className="text-sm text-neutral-500 line-through">{product.sale_price} ج.م</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition active:scale-95"
                  >
                    إضافة إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
