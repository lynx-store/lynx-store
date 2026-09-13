'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة سلة المشتريات والنافذة الجانبية
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
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

  // إضافة منتج للسلة
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // تعديل الكمية
  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // إجمالي السعر والقطع
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-black text-amber-400 tracking-wider">LYNX</h1>
        
        {/* زر السلة */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-5 py-2 rounded-xl border border-amber-500/30 font-bold transition-all flex items-center gap-2"
        >
          <span>السلة</span>
          {totalItems > 0 && (
            <span className="bg-amber-400 text-black text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* المنتجات */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-gray-200">المنتجات المتاحة</h2>

        {loading && <div className="text-center py-12 text-gray-400">جاري تحميل المنتجات...</div>}

        {error && (
          <p className="text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-800">
            حدث خطأ: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all flex flex-col justify-between">
                {product.image_url && (
                  <img src={product.image_url} alt={product.title} className="w-full h-56 object-cover" />
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">{product.category}</span>
                    <h3 className="text-xl font-bold mt-1 mb-2 text-white">{product.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <span className="text-2xl font-extrabold text-amber-400">{product.price} ج.م</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* السلة الجانبية (Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-start">
          <div className="bg-gray-900 w-full max-w-md h-full p-6 flex flex-col justify-between border-l border-gray-800 shadow-2xl">
            <div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-amber-400">سلة المشتريات</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-white font-bold text-xl px-2"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-12">السلة فارغة حالياً</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                        <h4 className="font-bold text-white">{item.title}</h4>
                        <p className="text-amber-400 font-semibold text-sm">{item.price} ج.م</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white font-bold">-</button>
                        <span className="text-white font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* إجمالي السعر والأزرار */}
            {cart.length > 0 && (
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-bold">الإجمالي:</span>
                  <span className="text-2xl font-extrabold text-amber-400">{totalPrice} ج.م</span>
                </div>
                <button
                  onClick={() => alert('ميزة إتمام الطلب ستكون الخطوة التالية!')}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl transition-all shadow-lg text-lg"
                >
                  إتمام الطلب
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
