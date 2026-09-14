'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('id', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  }

  // تحديث حالة الطلب والخصم من المخزن تلقائياً عند اختيار "تم الشحن"
  const handleStatusChange = async (order, newStatus) => {
    try {
      // 1. تحديث حالة الطلب في قاعدة البيانات
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;

      // 2. إذا كانت الحالة الجديدة "تم الشحن" والشحن لم يسبق تأكيده
      if (newStatus === 'تم الشحن' && order.status !== 'تم الشحن' && order.items) {
        for (const item of order.items) {
          const invId = item.inventoryId || item.productId;
          if (!invId) continue;

          // جلب بيانات القطعة في المخزن
          const { data: invItem } = await supabase.from('inventory').select('*').eq('id', invId).single();

          if (invItem) {
            const deductQty = Number(item.quantity) || 1;

            // خصم الكمية من المقاس واللون المحددين
            const updatedColors = (invItem.colors || []).map((c) => {
              if (c.color_name === item.color) {
                const currentSizeQty = c.size_quantities?.[item.size] || 0;
                const newSizeQty = Math.max(0, currentSizeQty - deductQty);
                return {
                  ...c,
                  size_quantities: {
                    ...c.size_quantities,
                    [item.size]: newSizeQty,
                  },
                };
              }
              return c;
            });

            // خصم الإجمالي العام للمخزن
            const newTotalQty = Math.max(0, (invItem.total_quantity || 0) - deductQty);

            // حفظ البيانات المحدثة في المخزن
            await supabase
              .from('inventory')
              .update({
                colors: updatedColors,
                total_quantity: newTotalQty,
              })
              .eq('id', invItem.id);
          }
        }
        alert('تم تغيير الحالة إلى (تم الشحن) وخصم الكميات المطلوبة من المخزن بنجاح! 🚚📦');
      }

      setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert('حدث خطأ أثناء تحديث الطلب: ' + err.message);
    }
  };

  const openWhatsApp = (phone, order) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('2') ? cleanPhone : `2${cleanPhone}`;
    const text = `أهلاً بك من براند LYNX 👕\nبخصوص طلبك رقم (#${order.id}):\nإجمالي المبلغ: ${order.total_price} ج.م.\nحالة الطلب الحالية: ${order.status}.`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري تحميل الطلبات...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إدارة الطلبات المباشرة 🛒
      </h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا توجد طلبات واردة حتى الآن.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-800 pb-3">
                <div>
                  <span className="text-amber-400 font-bold text-sm">طلب رقم #{order.id}</span>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('ar-EG')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={order.status || 'قيد الانتظار'}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-white text-xs font-bold p-2 rounded-xl"
                  >
                    <option value="قيد الانتظار">🟡 قيد الانتظار</option>
                    <option value="تم التأكيد">🟢 تم التأكيد</option>
                    <option value="تم الشحن">🚚 تم الشحن (خصم من المخزن)</option>
                    <option value="ملغي">🔴 ملغي</option>
                  </select>

                  <button
                    onClick={() => openWhatsApp(order.phone, order)}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-3 py-2 rounded-xl"
                  >
                    💬 واتساب
                  </button>
                </div>
              </div>

              {/* تفاصيل العميل والمنتجات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-gray-300">الاسم: <span className="text-white font-bold">{order.customer_name}</span></p>
                  <p className="text-gray-300">الهاتف: <span className="text-white font-bold">{order.phone}</span></p>
                  <p className="text-gray-300">المحافظة والعنوان: <span className="text-white font-bold">{order.governorate} - {order.address}</span></p>
                </div>

                <div className="space-y-1 bg-gray-950 p-3 rounded-2xl border border-gray-800">
                  <p className="text-amber-400 font-bold mb-1">المنتجات المطلوبة:</p>
                  {order.items?.map((item, i) => (
                    <p key={i} className="text-gray-300">
                      • {item.title} ({item.color} / مقاس: {item.size}) - العدد: <span className="text-amber-400 font-bold">{item.quantity}</span>
                    </p>
                  ))}
                  <p className="text-white font-black pt-2 border-t border-gray-800 text-sm">
                    الإجمالي: {order.total_price} ج.م
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
