'use client';

import Link from 'next/link';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { cart, wishlist, setIsCartOpen } = useStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80 transition-all">
      <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* اللوجو */}
        <Link href="/" className="flex flex-col">
          <span className="text-3xl font-black tracking-widest text-amber-400">LYNX</span>
          <span className="text-[9px] text-gray-400 uppercase tracking-widest -mt-1">Streetwear</span>
        </Link>

        {/* الأيقونات والاختيارات */}
        <div className="flex items-center gap-5">
          {/* رابط المفضلة */}
          <Link href="/wishlist" className="relative flex items-center text-gray-300 hover:text-amber-400 transition-colors">
            <span className="text-xl">❤️</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* زر السلة */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-amber-500/50 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <span className="text-lg">🛒</span>
            <span className="text-xs font-bold text-gray-200 hidden sm:inline">السلة</span>
            {totalItems > 0 && (
              <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
