'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useStore } from '../../../context/StoreContext';
import Link from 'next/link';

export default function ProductDetailClient({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  const { addToCart, wishlist, toggleWishlist } = useStore();

  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <p className="text-amber-400 font-bold animate-pulse text-lg">جاري تحميل المنتج...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-4xl">💔</p>
        <p className="text-xl font-bold text-gray-300">المنتج غير موجود أو تم حذفه</p>
        <Link href="/" className="bg-amber-500 text-black font-bold px-6 py-2.5 rounded-xl text-sm">
          العودة للمتجر
        </Link>
      </div>
    );
  }

  const isFavorite = wishlist.includes(product.id);

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-12" dir="rtl">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-amber-400 mb-8 transition-colors">
        <span>←</span> العودة للمتجر
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-900 border border-gray-800 p-6 md:p-10 rounded-3xl shadow-2xl">
        {/* صورة المنتج */}
        <div className="h-96 md:h-[450px] bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">لا توجد صورة</div>
          )}
          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute top-4 left-4 bg-gray-950/80 p-3 rounded-full border border-gray-800 text-xl cursor-pointer hover:scale-110 transition-transform"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* تفاصيل المنتج */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
              {product.category || 'LYNX Streetwear'}
            </span>
            <h1 className="text-3xl font-black text-white leading-tight">{product.title}</h1>
            <p className="text-2xl font-black text-amber-400 pt-2">{product.price} ج.م</p>
            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed pt-2 border-t border-gray-800">
                {product.description}
              </p>
            )}
          </div>

          {/* اختيار المقاس */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300">اختر المقاس:</label>
            <div className="flex gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* اختيار الكمية والإضافة للسلة */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-300">الكمية:</span>
              <div className="flex items-center border border-gray-800 rounded-xl bg-gray-950 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-400 hover:text-amber-400 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-gray-400 hover:text-amber-400 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => addToCart(product, quantity, selectedSize)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>🛒</span> إضافة إلى سلة التسوق
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
