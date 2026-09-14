'use client';

import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

// قائمة جميع محافظات مصر
const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الفيوم', 'سوهاج', 'الشرقية', 'الدقهلية',
  'القليوبية', 'المنوفية', 'الغربية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'بني سويف', 'المنيا',
  'أسيوط', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح'
];

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    governorate: 'القاهرة',
    address: '',
  });

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      // إرسال البيانات مع تجربة اسمي الحقليين (phone و phone_number) لضمان التوافق مع الجدول
      const payload = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        phone_number: formData.phone,
        governorate: formData.governorate,
        address: formData.address,
        items: cart,
        total_price: totalPrice,
      };

      const { error } = await supabase.from('orders').insert([payload]);

      if (error) {
        // محاولة إرسال بدون phone_number في حال كان الجدول يحتوي على phone فقط
        delete payload.phone_number;
        const { error: retryError } = await supabase.from('orders').insert([payload]);
        if (retryError) throw retryError;
      }

      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Checkout Error:', err);
      alert('خطأ من السيرفر: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-2xl mx-auto p-6 md:p-12 text-center space-y-6" dir="rtl">
        <div className="bg-gray-900 border border-amber-500/30 p-10 rounded-3xl space-y-4 shadow-2xl">
          <span className="text-6xl">🎉</span>
          <h2 className="text-3xl font-black text-amber-400">تم تسجيل طلبك بنجاح!</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            شكراً لثقتك بـ <strong className="text-amber-400">LYNX</strong>. تواصلنا معاك هيكون قريب جداً لتأكيد الشحن والتسليم.
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-8 py-3.5 rounded-xl transition-all mt-4"
          >
            العودة للمتجر 🛍️
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-8" dir="rtl">
      <h1 className="text-3xl font-black text-white border-b border-gray-800 pb-4">
        إتمام الطلب 🚀
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-3xl space-y-4">
          <p className="text-gray-400 font-semibold">السلة فارغة، أضف بعض المنتجات أولاً!</p>
          <Link
            href="/"
            className="inline-block bg-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* بيانات الشحن */}
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-amber-400 mb-2">بيانات التوصيل</h2>

            <div>
              <label className="block text-xs text-gray-400 mb-1">الاسم بالكامل</label>
              <input
                type="text"
                name="customer_name"
                required
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="أدخل اسمك"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="01xxxxxxxx"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">المحافظة</label>
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {EGYPT_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">العنوان بالتفصيل</label>
              <textarea
                name="address"
                required
                rows="3"
                value={formData.address}
                onChange={handleChange}
                placeholder="اسم الشارع / رقم العمارة / المنطقة"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? 'جاري تأكيد الطلب...' : `تأكيد الطلب (${totalPrice} ج.م)`}
            </button>
          </form>

          {/* ملخص السلة */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl h-fit space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3">ملخص الطلب</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-bold text-gray-200">{item.title}</p>
                    <p className="text-xs text-gray-500">المقاس: {item.size} × {item.quantity}</p>
                  </div>
                  <span className="font-bold text-amber-400">{item.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-4 flex justify-between items-center text-lg font-black">
              <span className="text-gray-300">الإجمالي النهائي:</span>
              <span className="text-amber-400">{totalPrice} ج.م</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
