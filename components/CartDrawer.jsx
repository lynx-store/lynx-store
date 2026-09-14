'use client';

import { useStore } from '../context/StoreContext';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useStore();

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* الخلفية المظلمة */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      ></div>

      {/* النافذة الجانبية */}
      <div className="relative w-full max-w-md bg-gray-900 border-r border-gray-800 h-full shadow-2xl flex flex-col z-10 p-6 overflow-hidden">
        {/* هيدر السلة */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🛒</span> سلة التسوق
          </h3>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-amber-400 text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* المنتجات بالسلة */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 divide-y divide-gray-800/50 pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-500 space-y-3">
              <p className="text-4xl">🛍️</p>
              <p className="text-sm font-semibold">سلتك فارغة حالياً</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="pt-4 flex gap-4 items-center justify-between">
                <img
                  src={item.image_url || '/placeholder.png'}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-xl bg-gray-950 border border-gray-800"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-amber-400 font-bold mt-1">{item.price} ج.م</p>
                  <p className="text-[10px] text-gray-400">المقاس: {item.size}</p>
                </div>

                {/* أزرار الكمية */}
                <div className="flex items-center border border-gray-800 rounded-lg overflow-hidden bg-gray-950">
                  <button
                    onClick={() => updateQuantity(index, -1)}
                    className="px-2 py-1 text-gray-400 hover:text-amber-400 text-xs"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, 1)}
                    className="px-2 py-1 text-gray-400 hover:text-amber-400 text-xs"
                  >
                    +
                  </button>
                </div>

                {/* زر الحذف */}
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-red-400 hover:text-red-300 text-xs p-1"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* الفوتر والإجمالي */}
        {cart.length > 0 && (
          <div className="border-t border-gray-800 pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-black">
              <span className="text-gray-300">الإجمالي:</span>
              <span className="text-amber-400">{totalPrice} ج.م</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block text-center w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-lg"
            >
              متابعة إتمام الطلب 🚀
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
