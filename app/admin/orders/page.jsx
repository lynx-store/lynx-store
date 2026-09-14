'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // كلمة السر الافتراضية للوحة التحكم (تقدر تغيرها)
  const ADMIN_PASS = 'lynx2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      setAuthenticated(true);
      fetchOrders();
    } else {
      alert('كلمة المرور غير صحيحة!');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert('فشل تحديث حالة الطلب');
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center p-6" dir="rtl">
        <form
          onSubmit={handleLogin}
          className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-full max-w-md space-y-4 text-center shadow-2xl"
        >
          <span className="text-5xl">🔒</span>
          <h1 className="text-2xl font-black text-white">لوحة تحكم LYNX</h1>
          <p className="text-xs text-gray-400">أدخل كلمة المرور للوصول لطلبات العملاء</p>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-center text-sm focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl transition-all cursor-pointer"
          >
            دخول اللوحة 🚀
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8" dir="rtl">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            📦 إدارة الطلبات
          </h1>
          <p className="text-xs text-gray-400 mt-1">إجمالي الطلبات: {orders.length}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-gray-900 border border-gray-800 hover:border-amber-500/50 text-amber-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          🔄 تحديث القائمة
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-amber-400 font-bold animate-pulse">
          جاري تحميل الطلبات...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl text-gray-400">
          لا توجد طلبات مسجلة حتى الآن 📭
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4 shadow-lg"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-amber-400">{order.customer_name}</h3>
                  <p className="text-xs text-gray-400">
                    📞 <a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {order.governorate} - {order.address}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    تاريخ الطلب: {new Date(order.created_at).toLocaleString('ar-EG')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">الحالة:</span>
                  <select
                    value={order.status || 'قيد الانتظار'}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-xs text-white rounded-xl p-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="قيد الانتظار">⏳ قيد الانتظار</option>
                    <option value="جاري الشحن">🚚 جاري الشحن</option>
                    <option value="تم التسليم">✅ تم التسليم</option>
                    <option value="ملغي">❌ ملغي</option>
                  </select>
                </div>
              </div>

              {/* المنتجات المطلوبة */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400">المنتجات:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.isArray(order.items) &&
                    order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-950 border border-gray-850 p-3 rounded-2xl flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-gray-500">المقاس: {item.size} × {item.quantity}</p>
                        </div>
                        <span className="font-extrabold text-amber-400">{item.price * item.quantity} ج.م</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800/60">
                <span className="text-xs font-bold text-gray-400">الإجمالي:</span>
                <span className="text-xl font-black text-amber-400">{order.total_price} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
