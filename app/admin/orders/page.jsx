'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const STATUSES = [
  { label: 'قيد التنفيذ 🟡', value: 'قيد التنفيذ', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  { label: 'تم التأكيد 🔵', value: 'تم التأكيد', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { label: 'تم الشحن 🚚', value: 'تم الشحن', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { label: 'تم الاستلام ✅', value: 'تم الاستلام', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  { label: 'إلغاء الطلبية ❌', value: 'إلغاء الطلبية', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  const handleStatusChange = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('هل تريد حذف هذا الطلب نهائياً؟')) return;
    await supabase.from('orders').delete().eq('id', id);
    setOrders(orders.filter((o) => o.id !== id));
  };

  const openWhatsApp = (order) => {
    let num = (order.whatsapp || order.phone).replace(/[^0-9]/g, '');
    if (num.startsWith('0')) num = '2' + num;

    const itemsList = order.items
      ? order.items.map((i) => `• ${i.title} (اللون: ${i.color || 'افتراضي'} | المقاس: ${i.size || 'M'}) × ${i.quantity}`).join('\n')
      : '';

    const text = `أهلاً بك ${order.customer_name} 👋\nمعك متجر LYNX 🐆\n\nتفاصيل طلبك:\n${itemsList}\n\nالإجمالي: ${order.total_price} ج.م\nالعنوان: ${order.governorate} - ${order.address}`;
    window.open(`https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        لوحة متابعة الطلبات 📦
      </h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const currentStatus = order.status || 'قيد التنفيذ';
          const statusObj = STATUSES.find((s) => s.value === currentStatus) || STATUSES[0];

          return (
            <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-wrap justify-between items-center border-b border-gray-800 pb-4 gap-4">
                <div>
                  <h2 className="text-lg font-black text-white">{order.customer_name}</h2>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('ar-EG')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none bg-gray-950 ${statusObj.color}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-gray-900 text-white">
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => openWhatsApp(order)}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                  >
                    💬 واتساب
                  </button>

                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-3 py-2 rounded-xl text-xs"
                  >
                    🗑️ حذف الطلب
                  </button>
                </div>
              </div>

              {/* التفاصيل العميل */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-gray-950 p-4 rounded-2xl border border-gray-850">
                <p><span className="text-gray-500 font-bold">الهاتف:</span> {order.phone}</p>
                <p><span className="text-gray-500 font-bold">الواتساب:</span> {order.whatsapp || order.phone}</p>
                <p><span className="text-gray-500 font-bold">العنوان:</span> {order.governorate} - {order.address}</p>
              </div>

              {/* عناصر الطلب بألوانها ومقاساتها */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-400">المنتجات المطلوبة:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {order.items &&
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-gray-400">
                            اللون: <span className="text-amber-400">{item.color || 'افتراضي'}</span> | المقاس: <span className="text-amber-400">{item.size || 'M'}</span>
                          </p>
                        </div>
                        <span className="font-bold text-gray-300">{item.price * item.quantity} ج.م</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-800 pt-3 text-sm">
                <span className="text-gray-400 font-bold">الإجمالي الشامل:</span>
                <span className="text-amber-400 font-black text-lg">{order.total_price} ج.م</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
