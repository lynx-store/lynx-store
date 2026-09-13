'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالات النموذج (إضافة أو تعديل)
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // الألوان والمقاسات والمخزون
  const [colorsInput, setColorsInput] = useState([
    { name: 'أسود', stock: 10, image: '', sizes: ['M', 'L', 'XL', '2XL'] }
  ]);
  
  const [submitting, setSubmitting] = useState(false);

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

  const handleSizeToggle = (colorIndex, size) => {
    const updated = [...colorsInput];
    const currentSizes = updated[colorIndex].sizes || [];
    if (currentSizes.includes(size)) {
      updated[colorIndex].sizes = currentSizes.filter(s => s !== size);
    } else {
      updated[colorIndex].sizes = [...currentSizes, size];
    }
    setColorsInput(updated);
  };

  const addColorField = () => {
    setColorsInput([...colorsInput, { name: '', stock: 10, image: '', sizes: ['M', 'L', 'XL', '2XL'] }]);
  };

  const removeColorField = (index) => {
    setColorsInput(colorsInput.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setPrice('');
    setCategory('');
    setDescription('');
    setImageUrl('');
    setColorsInput([{ name: 'أسود', stock: 10, image: '', sizes: ['M', 'L', 'XL', '2XL'] }]);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert('يرجى كتابة اسم المنتج والسعر على الأقل');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        title,
        price: parseFloat(price),
        category,
        description,
        image_url: imageUrl,
        colors: colorsInput,
      };

      if (editingId) {
        // تحديث منتج موجود
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
        alert('تم تعديل المنتج بنجاح!');
      } else {
        // إضافة منتج جديد
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        alert('تم إضافة المنتج بنجاح!');
      }

      resetForm();
      fetchData();
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (prod) => {
    setEditingId(prod.id);
    setTitle(prod.title);
    setTitle(prod.title);
    setPrice(prod.price);
    setCategory(prod.category || '');
    setDescription(prod.description || '');
    setImageUrl(prod.image_url || '');
    setColorsInput(prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: 'أسود', stock: 10, image: '', sizes: ['M', 'L', 'XL', '2XL'] }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert('خطأ في الحذف: ' + error.message);
    else fetchData();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-amber-400">لوحة تحكم LYNX</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة المنتجات، المقاسات، الألوان، والطلبات</p>
        </div>
        <a href="/" className="bg-gray-800 hover:bg-gray-700 text-amber-400 font-bold px-4 py-2 rounded-xl border border-gray-700">
          الذهاب للمتجر ↗
        </a>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* نموذج الإضافة أو التعديل */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-amber-400">
              {editingId ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-gray-400 hover:text-white underline">
                إلغاء التعديل
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">اسم المنتج</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تيشرت LYNX أساسي" className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
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

            {/* الألوان والمقاسات */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-amber-400">🎨 تفاصيل الألوان، المخزون والمقاسات</h3>
                <button type="button" onClick={addColorField} className="bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700">
                  + إضافة لون جديد
                </button>
              </div>

              <div className="space-y-4">
                {colorsInput.map((col, idx) => (
                  <div key={idx} className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
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
                        <button type="button" onClick={() => removeColorField(idx)} className="text-red-400 font-bold text-sm">✕</button>
                      </div>
                    </div>

                    {/* اختيار المقاسات المتاحة لهذا اللون */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-900">
                      <span className="text-xs text-gray-400 font-semibold">المقاسات المتاحة:</span>
                      {['M', 'L', 'XL', '2XL'].map((size) => {
                        const isSelected = col.sizes?.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeToggle(idx, size)}
                            className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                              isSelected ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl transition-all shadow-md">
              {submitting ? 'جاري الحفظ...' : editingId ? 'تحديث المنتج في المتجر' : 'حفظ ونشر المنتج الجديد'}
            </button>
          </form>
        </section>

        {/* إدارة المنتجات (تعديل وحذف) */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">🛍️ منتجات المتجر الحالية ({products.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="bg-gray-950 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {prod.image_url && <img src={prod.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                  <div>
                    <h4 className="font-bold text-white text-sm">{prod.title}</h4>
                    <p className="text-amber-400 text-xs font-semibold">{prod.price} ج.م</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(prod)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-800/50 text-xs font-bold transition-all">
                    تعديل
                  </button>
                  <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-800/50 text-xs font-bold transition-all">
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* الطلبات الواردة */}
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
                      {item.title} - لون: {item.selectedColor} | مقاس: {item.selectedSize} (العدد: {item.quantity})
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
