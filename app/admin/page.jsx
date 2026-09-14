'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('lynx_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'Lynxstore22@') {
      setIsAuthenticated(true);
      localStorage.setItem('lynx_admin_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('كلمة المرور غير صحيحة!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lynx_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4" dir="rtl">
        <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-amber-400">لوحة تحكم LYNX</h1>
            <p className="text-xs text-gray-500">يرجى إدخال كلمة المرور للوصول للنظام</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="كلمة المرور..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-xs font-bold text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-4 rounded-xl text-sm transition-all shadow-lg"
            >
              دخول اللوحة 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8" dir="rtl">
      <div className="max-w-5xl mx-auto flex justify-between items-center bg-gray-950 border border-gray-900 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-amber-400">لوحة الإدارة الرئيسية</h1>
          <p className="text-xs text-gray-400 mt-1">مرحباً يا عبدالرحيم، اختر الصفحة التي تريد الانتقال إليها</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          تسجيل الخروج 🚪
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* الزر 1: الدعم المباشر */}
        <Link href="/admin/support" className="group">
          <div className="bg-gray-950 border border-gray-900 hover:border-amber-500 p-8 rounded-3xl transition-all duration-300 flex items-center gap-5 shadow-lg group-hover:scale-[1.02]">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-amber-500 group-hover:text-black transition-all">
              🎧
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">محادثات الدعم المباشر</h3>
              <p className="text-xs text-gray-500 mt-1">الرد على استفسارات ورسائل العملاء لحظياً</p>
            </div>
          </div>
        </Link>

        {/* الزر 2: المخزن */}
        <Link href="/admin/inventory" className="group">
          <div className="bg-gray-950 border border-gray-900 hover:border-amber-500 p-8 rounded-3xl transition-all duration-300 flex items-center gap-5 shadow-lg group-hover:scale-[1.02]">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-amber-500 group-hover:text-black transition-all">
              📦
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">صفحة المخزن</h3>
              <p className="text-xs text-gray-500 mt-1">متابعة الكميات، تعديل المنتجات وإدارتها</p>
            </div>
          </div>
        </Link>

        {/* الزر 3: إدارية/إضافة المنتجات (ربط بـ /admin/products) */}
        <Link href="/admin/products" className="group">
          <div className="bg-gray-950 border border-gray-900 hover:border-amber-500 p-8 rounded-3xl transition-all duration-300 flex items-center gap-5 shadow-lg group-hover:scale-[1.02]">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-amber-500 group-hover:text-black transition-all">
              ➕
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">إضافة وإدارة المنتجات</h3>
              <p className="text-xs text-gray-500 mt-1">رفع منتجات جديدة، ألوان، ومقاسات المتجر</p>
            </div>
          </div>
        </Link>

        {/* الزر 4: الطلبات (ربط بـ /admin/orders) */}
        <Link href="/admin/orders" className="group">
          <div className="bg-gray-950 border border-gray-900 hover:border-amber-500 p-8 rounded-3xl transition-all duration-300 flex items-center gap-5 shadow-lg group-hover:scale-[1.02]">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-amber-500 group-hover:text-black transition-all">
              🛍️
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">طلبات الشراء</h3>
              <p className="text-xs text-gray-500 mt-1">متابعة طلبات الزبائن الواردة وحالتها</p>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
