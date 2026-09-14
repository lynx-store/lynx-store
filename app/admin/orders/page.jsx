'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const STATUS_OPTIONS = [
  { label: 'قيد الانتظار 🟡', value: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  { label: 'تم التأكيد 🔵', value: 'تم التأكيد', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { label: 'جاري الشحن 🚚', value: 'جاري الشحن', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { label: 'تم التسليم ✅', value: 'تم التسليم', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  { label: 'ملغي ❌', value: 'ملغي', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      alert('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }

  // 1. تحديث حالة الطلب
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert('فشل تحديث حالة الطلب');
    }
  };

  // 2. حذف الطلب
  const handleDeleteOrder = async (orderId) => {
    if (!confirm('هل أنت تأكد من حذف هذا الطلب نهائياً؟')) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error(err);
      alert('فشل حذف الطلب');
    }
  };

  // 3. فتح محادثة الواتساب
  const handleSendWhatsApp = (order) => {
    let phoneNum = order.whatsapp || order.phone;
    phoneNum = phoneNum.trim().replace(/[^0-9]/g, '');
    if (phoneNum.startsWith('0')) {
      phoneNum = '2' + phoneNum;
    }

    let itemsText = order.items
      ? order.items.map((i) => `• ${i.title} (مقاس: ${i.size || 'M'}) × ${i.quantity}`).join('\n')
      : 'لا تفاصيل';

    const msg = `أهلاً ${order.customer_name} 👋\nمعاك متجر LYNX 🐆\n\nبنأكد معاك طلبك:\n${itemsText}\n\nإجمالي المبلغ: ${order.total_price} ج.م (شامل الشحن)\nالعنوان: ${order.governorate} - ${order.address}\n\nيرجى الرد لتأكيد الشحن 🚀`;

    window.open(`https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  // الإحصائيات
  const totalSales = orders
    .filter((o) => o.status !== 'ملغي')
    .reduce((acc, o) => acc + (Number(o.total_price) || 0), 0);

  const pendingCount = orders.filter((o) => o.status === 'قيد الانتظار' || !o.status).length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-amber-400 font-bold animate-pulse">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-6 border-b border-gray-800 pb-4">
        إدارة الطلبات والعمليات 📊
      </h1>

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold mb-1">إجمالي المبيعات المقبولة</p>
          <p className="text-2xl font-black text-amber-400">{totalSales} ج.م</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold mb-1">إجمالي الطلبات</p>
          <p className="text-2xl font-black text-white">{orders.length} طلبات</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-bold mb-1">طلبات بانتظار التأكيد</p>
          <p className="text-2xl font-black text-yellow-400">{pendingCount} طلبات</p>
        </div>
      </div>

      {/* قائمة الطلبات */}
      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-12 font-bold">لا توجد طلبات مسجلة حتى الآن.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStatus = order.status || 'قيد الانتظار';
            const statusObj = STATUS_OPTIONS.find((s) => s.value === currentStatus) || STATUS_OPTIONS[0];

            return (
              <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl relative">
                
                {/* الجزء العلوي: بيانات العملاء والحالة */}
                <div className="flex flex-wrap justify-between items-center border-b border-gray-850 pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-black text-white">{order.customer_name}</h2>
                    <p className="text-xs text-gray-500">
                      تاريخ الطلب: {new Date(order.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* تغيير حالة الطلب */}
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none bg-gray-950 ${statusObj.color}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {/* زر التأكيد على الواتساب */}
                    <button
                      onClick={() => handleSendWhatsApp(order)}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>💬</span> واتساب
                    </button>

                    {/* زر حذف الطلب */}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>

                {/* التفاصيل والعنوان */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-gray-950 p-4 rounded-2xl border border-gray-850">
                  <div>
                    <span className="text-gray-500 block font-bold mb-1">رقم الهاتف:</span>
                    <span className="text-gray-200 font-mono text-sm">{order.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-bold mb-1">رقم الواتساب:</span>
                    <span className="text-green-400 font-mono text-sm">{order.whatsapp || order.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-bold mb-1">العنوان والمحافظة:</span>
                    <span className="text-gray-200">{order.governorate} - {order.address}</span>
                  </div>
                </div>

                {/* قائمة المنتجات */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-400">المنتجات المطلوبة:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items &&
                      order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                          <div>
                            <span className="font-bold text-white block">{item.title}</span>
                            <span className="text-amber-400 font-bold">المقاس: {item.size || 'M'}</span>
                            <span className="text-gray-500 mr-3">الكمية: {item.quantity}</span>
                          </div>
                          <span className="font-bold text-gray-300">{item.price * item.quantity} ج.م</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* الإجمالي الكلي */}
                <div className="flex justify-between items-center border-t border-gray-850 pt-3 text-sm">
                  <span className="text-gray-400 font-bold">الإجمالي الكلي (شامل الشحن):</span>
                  <span className="text-amber-400 font-black text-lg">{order.total_price} ج.م</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
