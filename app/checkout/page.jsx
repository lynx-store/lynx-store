'use client';

import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الفيوم', 'سوهاج', 'الشرقية', 'الدقهلية',
  'القليوبية', 'المنوفية', 'الغربية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'بني سويف', 'المنيا',
  'أسيوط', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح'
];

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    governorate: 'القاهرة',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const itemsTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = 50;
  const grandTotal = itemsTotal + shippingFee;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);

    try {
      const orderData = {
        customer_name: formData.name,
        phone: formData.phone,
        governorate: formData.governorate,
        address: formData.address,
        items: cart,
        total_price: grandTotal,
        status: 'قيد الانتظار',
      };

      // إضافة رقم الواتساب إلى كائن البيانات
      if (formData.whatsapp) {
        orderData.whatsapp = formData.whatsapp;
      }

      const { error } = await supabase.from('orders').insert([orderData]);

      if (error) throw error;

      clearCart();
      setOrderSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الطلب: ' + (err.message || 'يرجى المحاولة مرة أخرى'));
    } finally {
      setLoading(false);
    }
  };

  if (orderSubmitted) {
    return (
      <main className="max-w-xl mx-auto p-6 md:p-12 text-center space-y-6" dir="rtl">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl space-y-4 shadow-2xl">
          <span className="text-6xl block">🎉</span>
          <h1 className="text-2xl font-black text-amber-400">تم إرسال طلبك بنجاح!</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            شكرًا لطلبك من LYNX. سيتم مراجعة الطلب والتواصل معك قريباً لتأكيد الشحن.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl text-xs transition-all"
            >
              العودة للمتجر 🛍️
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-12 text-center space-y-4" dir="rtl">
        <p className="text-4xl">🛒</p>
        <p className="text-gray-400 font-bold">سلة التسوق فارغة تماماً.</p>
        <Link href="/" className="inline-block bg-amber-500 text-black font-bold px-6 py-2.5 rounded-xl text-xs">
          تصفح المنتجات
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إتمام الشراء 📦
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">بيانات الشحن</h2>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">الاسم بالكامل</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="الاسم"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">رقم الهاتف الأساسي</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="010XXXXXXXX"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">رقم الواتساب (للتأكيد وإرسال الفاتورة)</label>
            <input
              type="tel"
              name="whatsapp"
              required
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="011XXXXXXXX"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">المحافظة</label>
            <select
              name="governorate"
              value={formData.governorate}
              onChange={handleChange}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {EGYPT_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">العنوان بالتفصيل</label>
            <textarea
              name="address"
              required
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="اسم الشارع - رقم المبنى - المنطقة"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-4 rounded-xl transition-all shadow-xl cursor-pointer disabled:opacity-50 text-sm"
          >
            {loading ? 'جاري إرسال الطلب...' : 'تأكيد وحفظ الطلب 📦'}
          </button>
        </form>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-amber-400">ملخص الفاتورة</h2>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-gray-950 p-3 rounded-xl border border-gray-850">
                <div>
                  <p className="font-bold text-white">{item.title}</p>
                  <p className="text-gray-500">المقاس: {item.size || 'M'} × {item.quantity}</p>
                </div>
                <span className="font-bold text-amber-400">{item.price * item.quantity} ج.م</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>المجموع الفرعي:</span>
              <span>{itemsTotal} ج.م</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>مصاريف الشحن:</span>
              <span>{shippingFee} ج.م</span>
            </div>
            <div className="flex justify-between text-base font-black text-amber-400 pt-2 border-t border-gray-800">
              <span>الإجمالي الكلي:</span>
              <span>{grandTotal} ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
