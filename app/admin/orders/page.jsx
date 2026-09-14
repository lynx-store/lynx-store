'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

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
    } finally {
      setLoading(false);
    }
  }

  // دالة فتح محادثة الواتساب مع العميل
  const handleSendWhatsApp = (order) => {
    // تجهيز رقم الواتساب بالصيغة الدولية لمصر
    let phoneNum = order.whatsapp || order.phone;
    phoneNum = phoneNum.trim().replace(/[^0-9]/g, '');
    if (phoneNum.startsWith('0')) {
      phoneNum = '2' + phoneNum;
    }

    let itemsText = order.items
      ? order.items.map((i) => `• ${i.title} (مقاس: ${i.size || 'M'}) × ${i.quantity}`).join('\n')
      : 'لا تفاصيل';

    const msg = `أهلاً ${order.customer_name} 👋\nمعاك متجر LYNX 🐆\n\nبنأكد معاك طلبك:\n${itemsText}\n\nإجمالي المبلغ: ${order.total_price} ج.م (شامل الشحن)\nالعنوان: ${order.governorate} - ${order.address}\n\nيرجى الرد لتأكيد الشحن 🚀`;

    const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-amber-400 font-bold animate-pulse">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-white">إدارة الطلبات 📦</h1>
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-1.5 rounded-xl font-bold text-xs">
          إجمالي الطلبات: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-12 font-bold">لا توجد طلبات مسجلة حتى الآن.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
              {/* رأس الكارت: الاسم والتاريخ */}
              <div className="flex flex-wrap justify-between items-center border-b border-gray-850 pb-4 gap-2">
                <div>
                  <h2 className="text-lg font-black text-white">{order.customer_name}</h2>
                  <p className="text-xs text-gray-500">
                    تاريخ الطلب: {new Date(order.created_at).toLocaleString('ar-EG')}
                  </p>
                </div>
                
                <button
                  onClick={() => handleSendWhatsApp(order)}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-green-600/20"
                >
                  <span>💬</span> تأكيد الطلب على الواتساب
                </button>
              </div>

              {/* بيانات التواصل والعنوان */}
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

              {/* تفاصيل المنتجات والمقاسات */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-amber-400">المنتجات المطلوبة:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {order.items && order.items.map((item, idx) => (
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

              {/* الإجمالي */}
              <div className="flex justify-between items-center border-t border-gray-850 pt-3 text-sm">
                <span className="text-gray-400 font-bold">الإجمالي الكلي (شامل الشحن):</span>
                <span className="text-amber-400 font-black text-lg">{order.total_price} ج.م</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
