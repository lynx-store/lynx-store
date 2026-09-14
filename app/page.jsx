'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import Link from 'next/link';

export default function StoreHomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wishlist, toggleWishlist, addToCart } = useStore();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-amber-400 font-bold animate-pulse text-lg">جاري تحميل تشكيلة LYNX...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
      {/* البانر الرئيسي */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-900 to-amber-950/30 border border-gray-800 p-8 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="max-w-xl space-y-4">
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
            مجموعة الشتاء الجديدة ⚡
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            تصاميم جريئة تعكس <span className="text-amber-400">شخصيتك</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            اكتشف أحدث تشكيلة من التيشيرتات والهوديز المصنوعة بأعلى معايير الجودة وخامات الستريت وير العصرية.
          </p>
        </div>
      </section>

      {/* شبكة المنتجات */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-extrabold text-white">القطع المتاحة</h3>
          <span className="text-xs text-gray-500 font-semibold">{products.length} منتجات</span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 border border-gray-800 rounded-3xl">
            <p className="text-gray-400">لا توجد منتجات مضافة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => {
              const isFavorite = wishlist.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="group bg-gray-900 border border-gray-800 hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg relative"
                >
                  {/* زر المفضلة */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 left-4 z-10 bg-gray-950/80 hover:bg-gray-950 p-2.5 rounded-full border border-gray-800 transition-all text-lg cursor-pointer shadow-md"
                  >
                    {isFavorite ? '❤️' : '🤍'}
                  </button>

                  <Link href={`/product/${product.id}`} className="h-72 overflow-hidden bg-gray-950 relative block">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">لا توجد صورة</div>
                    )}
                  </Link>

                  <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                    <div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
                        {product.category || 'LYNX'}
                      </span>
                      <Link href={`/product/${product.id}`}>
                        <h4 className="text-lg font-bold text-white mt-2 group-hover:text-amber-400 transition-colors">
                          {product.title}
                        </h4>
                      </Link>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-800/80">
                      <span className="text-xl font-black text-amber-400">{product.price} ج.م</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                      >
                        <span>🛒</span> إضافة للسلة
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
