'use client';

import { useStore } from '../../context/StoreContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cart.length > 0 ? 75 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-widest text-white">
            LYNX
          </Link>
          <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-white transition">
            ← العودة للمتجر
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-8">سلة المشتريات</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-3xl">
            <p className="text-neutral-400 text-lg mb-6">سلة المشتريات فارغة تماماً.</p>
            <Link href="/" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-neutral-200 transition">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-xl bg-neutral-950" />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-neutral-400 text-sm mt-1">{item.price} ج.م</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (item.quantity > 1) {
                          const updated = cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
                          // تحديث مباشر مبسط
                          removeFromCart(item.id);
                          updated.forEach(i => addToCart(i)); // طريقة سريعة لتحديث الكمية
                        } else {
                          removeFromCart(item.id);
                        }
                      }}
                      className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-bold hover:bg-neutral-700"
                    >
                      -
                    </button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center font-bold hover:bg-neutral-700"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-400 p-2 text-sm font-semibold"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary Box */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl h-fit">
              <h3 className="text-lg font-bold mb-4 pb-4 border-b border-neutral-800">ملخص الطلب</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-neutral-400">
                  <span>المجموع الفرعي</span>
                  <span className="text-white font-semibold">{subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>مصاريف الشحن</span>
                  <span className="text-white font-semibold">{shipping} ج.م</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-neutral-800">
                  <span>الإجمالي الكلي</span>
                  <span>{total} ج.م</span>
                </div>
              </div>
              <Link 
                href="/checkout"
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl block text-center hover:bg-neutral-200 transition"
              >
                إتمام الطلب
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
