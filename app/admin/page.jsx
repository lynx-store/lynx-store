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
  
  // نظام الألوان والمخزون
  const [colorsInput, setColorsInput] = useState([
    { name: 'أسود', stock: 10, image: '' },
    { name: 'أبيض', stock: 5, image: '' }
  ]);
  
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: productsData } = await supabase.from('products').select('*');
      setOrders(ordersData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleColorChange = (index, field, value) => {
    const updated = [...colorsInput];
    updated[index][field] = value;
    setColorsInput(updated);
  };

  const addColorField = () => {
    setColorsInput([...colorsInput, { name: '', stock: 0, image: '' }]);
  };

  const removeColorField = (index) => {
    setColorsInput(colorsInput.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert('يرجى كتابة اسم المنتج والسعر');
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
          colors: colorsInput,
        },
      ]);

      if (error) throw error;

      alert('تم إضافة المنتج بنجاح!');
      setTitle('');
      setPrice('');
      setCategory('');
      setDescription('');
      setImageUrl('');
      setColorsInput([{ name: 'أسود', stock: 10, image: '' }]);
      fetchData();
    } catch (err) {
      alert('خطأ: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-amber-400">لوحة تحكم LYNX</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة الألوان، المخزون، والطلبات</p>
        </div>
        <a href="/" className="bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold px-4 py-2 rounded-xl border border-gray-700">
          الذهاب للمتجر ↗
        </a>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">➕ إضافة منتج مع الألوان والمخزون</h2>
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">اسم المنتج</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تيشرت LYNX" className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">السعر (ج.م)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="299" className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">القسم</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="تيشيرتات / هوديز" className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">رابط الصورة الأساسية</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">الوصف</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
            </div>

            {/* قسم إدارة الألوان والمخزون */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-amber-400">🎨 الألوان والمخزون المرتبط بها</h3>
                <button type="button" onClick={addColorField} className="bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700">
                  + إضافة لون جديد
                </button>
              </div>

              <div className="space-y-3">
                {colorsInput.map((col, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800 items-center">
                    <div className="md:col-span-3">
                      <input type="text" placeholder="اسم اللون (أسود، أبيض...)" value={col.name} onChange={(e) => handleColorChange(idx, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <input type="number" placeholder="المخزون" value={col.stock} onChange={(e) => handleColorChange(idx, 'stock', parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white" />
                    </div>
                    <div className="md:col-span-6">
                      <input type="text" placeholder="رابط صورة هذا اللون الخاصة" value={col.image} onChange={(e) => handleColorChange(idx, 'image', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white" />
                    </div>
                    <div className="md:col-span-1 text-center">
                      <button type="button" onClick={() => removeColorField(idx)} className="text-red-400 hover:text-red-300 font-bold text-sm">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={adding} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl transition-all shadow-md">
              {adding ? 'جاري الحفظ...' : 'حفظ ونشر المنتج بالألوان'}
            </button>
          </form>
        </section>

        {/* عرض الطلبات والمنتجات الحالية */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">📦 طلبات العملاء ({orders.length})</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-950 border border-gray-800 p-5 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-white">
                  <span>{order.customer_name} ({order.phone_number})</span>
                  <span className="text-amber-400">{order.total_price} ج.م</span>
                </div>
                <p className="text-xs text-gray-400">العنوان: {order.address}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {Array.isArray(order.items) && order.items.map((item, i) => (
                    <span key={i} className="bg-gray-900 border border-gray-800 px-3 py-1 rounded-lg text-xs text-gray-200">
                      {item.title} - لون: {item.selectedColor} (العدد: {item.quantity})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
