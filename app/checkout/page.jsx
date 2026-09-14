'use client';

import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const egyptianGovernorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الفيوم', 'سوهاج', 'أسيوط', 
  'قنا', 'الأقصر', 'أسوان', 'المنيا', 'بني سويف', 'الشرقية', 
  'الغربية', 'الدقهلية', 'المنوفية', 'القليوبية', 'البحيرة', 'الإسماعيلية', 'السويس', 'بورسعيد'
];

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    whatsapp: '',
    governorate: 'الفيوم',
    address_details: '',
  });

  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 75;
  const total_price = subtotal + (cart.length > 0 ? shipping : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('السلة فارغة!');
    
    setLoading(true);
    try {
      const { error } = await supabase.from('orders').insert([
        {
          customer_name: formData.customer_name,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          governorate: formData.governorate,
          address_details: formData.address_details,
          items: cart,
          shipping_cost: shipping,
          discount_applied: 0,
          total_price: total_price,
          status: 'قيد التنفيذ'
        }
      ]);

      if (error) throw error;

      clearCart();
      alert('تم تقديم طلبك بنجاح! سنتواصل معك قريباً لتأكيد الشحن.');
      router.push('/');
    } catch (err) {
      alert('حدث خطأ أثناء إتمام الطلب: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-widest text-white">
            LYNX
          </Link>
          <Link href="/cart" className="text-sm font-medium text-neutral-400 hover:text-white transition">
            ← العودة للسلة
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold mb-8">إتمام بيانات الشحن</h1>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">الاسم الكامل</label>
            <input 
              type="text" 
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition"
              placeholder="أدخل اسمك ثلاثي"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">رقم الهاتف</label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition"
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">رقم الواتساب (اختياري)</label>
              <input 
                type="tel" 
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition"
                placeholder="01xxxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">المحافظة</label>
            <select
              value={formData.governorate}
              onChange={(e) => setFormData({...formData, governorate: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition"
            >
              {egyptianGovernorates.map((gov, idx) => (
                <option key={idx} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">تفاصيل العنوان بالتفصيل</label>
            <textarea 
              required
              rows="3"
              value={formData.address_details}
              onChange={(e) => setFormData({...formData, address_details: e.target.value})}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition"
              placeholder="المدينة، الشارع، رقم الحلة، العلامة المميزة"
            />
          </div>

          <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-lg font-bold">
            <span>المطلوب دفعه عند الاستلام:</span>
            <span className="text-white">{total_price} ج.م</span>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {loading ? 'جاري إرسال الطلب...' : 'تأكيد الطلب الآن 🚀'}
          </button>
        </form>
      </main>
    </div>
  );
}
