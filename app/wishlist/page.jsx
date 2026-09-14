'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../context/StoreContext';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', wishlist);

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-amber-400 font-bold animate-pulse text-lg">جاري تحميل المفضلة...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8" dir="rtl">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <span>❤️</span> قائمة المنتجات المفضلة
        </h1>
        <span className="text-xs text-gray-500 font-semibold">{products.length} منتجات</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl space-y-4">
          <p className="text-4xl">💔</p>
          <p className="text-gray-400 font-semibold">لم تقم بإضافة أي منتجات للمفضلة بعد.</p>
          <Link
            href="/"
            className="inline-block bg-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl text-sm"
          >
            تصفح المنتجات الآن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-gray-900 border border-gray-800 hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg relative"
            >
              {/* زر الحذف من المفضلة */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 left-4 z-10 bg-gray-950/80 hover:bg-gray-950 p-2.5 rounded-full border border-gray-800 transition-all text-lg cursor-pointer shadow-md"
                title="إزالة من المفضلة"
              >
                ❤️
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
          ))}
        </div>
      )}
    </main>
  );
}
