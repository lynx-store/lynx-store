'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // بيانات إضافة منتج جديد
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [adding, setAdding] = useState(false);

  // جلب الطلبات والمنتجات
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: productsData } = await supabase
        .from('products')
        .select('*');

      setOrders(ordersData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // إضافة منتج جديد للقاعدة
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert('يرجى كتابة اسم المنتج والسعر على الأقل');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from('products').insert([
        {
          title,
          price: parseFloat(price),
          category,
          description,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      alert('تم إضافة المنتج بنجاح!');
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setImageUrl('');
      fetchData();
    } catch (err) {
      alert('حدث خطأ أثناء الإضافة: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert('خطأ في الحذف: ' + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-amber-400">لوحة تحكم LYNX</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة الطلبات والمنتجات بسهولة</p>
        </div>
        <a
          href="/"
          className="bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold px-4 py-2 rounded-xl transition-all border border-gray-700"
        >
          الذهاب للمتجر ↗
        </a>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* قسم إضافة منتج جديد */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">➕ إضافة منتج جديد للمتجر</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">اسم المنتج</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: هودي شتوي أسود"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">السعر (ج.م)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="599"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">القسم</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="هوديز / تيشيرتات / إكسسوارات"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">رابط صورة المنتج (URL)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">وصف المنتج</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل الخامات والمقاسات المتاحة..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={adding}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {adding ? 'جاري الإضافة...' : 'حفظ ونشر المنتج في المتجر'}
              </button>
            </div>
          </form>
        </section>

        {/* قسم عرض الطلبات الواردة */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">📦 طلبات العملاء الواردة ({orders.length})</h2>

          {loading ? (
            <p className="text-gray-400 text-center py-8">جاري تحميل البيانات...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد طلبات جديدة حتى الآن</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-950 border border-gray-800 p-5 rounded-xl space-y-3">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-white">{order.customer_name}</h3>
                      <p className="text-amber-400 font-semibold text-sm">📞 {order.phone_number}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-gray-400">تاريخ الطلب: </span>
                      <span className="text-xs text-gray-300">{new Date(order.created_at).toLocaleString('ar-EG')}</span>
                      <div className="text-amber-400 font-extrabold text-lg mt-1">{order.total_price} ج.م</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-2">📍 العنوان: <span className="text-gray-400">{order.address}</span></p>
                    <p className="text-sm font-semibold text-gray-300 mb-1">المنتجات المطلوبة:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(order.items) && order.items.map((item, idx) => (
                        <span key={idx} className="bg-gray-900 border border-gray-800 px-3 py-1 rounded-lg text-xs text-gray-200">
                          {item.title} (العدد: {item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* قسم إدارة المنتجات الحالية */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">🛍️ منتجات المتجر الحالية ({products.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="bg-gray-950 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">{prod.title}</h4>
                  <p className="text-amber-400 text-sm font-semibold">{prod.price} ج.م</p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-800/50 text-xs font-bold transition-all cursor-pointer"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
