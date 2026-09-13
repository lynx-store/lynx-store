'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12" dir="rtl">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-black text-amber-400 tracking-wider">LYNX</h1>
        <span className="bg-amber-500/10 text-amber-400 text-sm px-4 py-1 rounded-full border border-amber-500/20 font-bold">
          المتجر الرسمي
        </span>
      </header>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-gray-200">المنتجات المتاحة</h2>

        {loading && (
          <div className="text-center py-12 text-gray-400">
            جاري تحميل المنتجات...
          </div>
        )}

        {error && (
          <p className="text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-800">
            حدث خطأ أثناء جلب المنتجات: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all flex flex-col justify-between">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-56 object-cover"
                  />
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-xl font-bold mt-1 mb-2 text-white">{product.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <span className="text-2xl font-extrabold text-amber-400">{product.price} ج.م</span>
                    <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-xl transition-all">
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
