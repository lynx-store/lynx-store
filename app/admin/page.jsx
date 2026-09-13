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
  
  // حقول جديدة: صور إضافية وفيديو الإعلان
  const [extraImagesInput, setExtraImagesInput] = useState(''); // روابط مفصولة بفواصل أو سطر جديد
  const [videoUrl, setVideoUrl] = useState('');

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
    setExtraImagesInput('');
    setVideoUrl('');
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
      // تحويل الصور الإضافية لمصفوفة (عن طريق تقسيم النص بـ فاصلة أو سطر جديد)
      const extraImagesArray = extraImagesInput
        ? extraImagesInput.split(/[\n,]+/).map(img => img.trim()).filter(Boolean)
        : [];

      const productData = {
        title,
        price: parseFloat(price),
        category,
        description,
        image_url: imageUrl,
        extra_images: extraImagesArray,
        video_url: videoUrl,
        colors: colorsInput,
      };

      if (editingId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
        alert('تم تعديل المنتج بنجاح!');
      } else {
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
    setPrice(prod.price);
    setCategory(prod.category || '');
    setDescription(prod.description || '');
    setImageUrl(prod.image_url || '');
    setExtraImagesInput(prod.extra_images ? prod.extra_images.join('\n') : '');
    setVideoUrl(prod.video_url || '');
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
          <p className="text-gray-400 text-sm mt-1">إدارة المنتجات، المقاسات، المعرض، والفيديو الإعلاني</p>
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
                <label className="block text-sm text-gray-300 mb-1">رابط الصورة الرئيسية</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">روابط الصور الإضافية بزوايا مختلفة (كل رابط في سطر أو يفصل بينهم فاصلة)</label>
                <textarea rows={3} value={extraImagesInput} onChange={(e) => setExtraImagesInput(e.target.value)} placeholder="https://image1.com&#10;https://image2.com" className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-xs" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">رابط فيديو إعلان المنتج (يوتيوب أو رابط مباشر)</label>
                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">الوصف التفصيلي</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
              </div>
            </div>

            {/* الألوان والمقاسات */}
            <div className="border-t border-gray-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-amber-400">🎨 تفاصيل الألوان والمخزون والمقاسات</h3>
                <button type="button" onClick={addColorField} className="bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-700">
                  + إضافة لون جديد
                </button>
              </div>

              <div className="space-y-4">
                {colorsInput.map((col, idx) => (
                  <div key={idx} className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-3">
                        <input type="text" placeholder="اسم اللون" value={col.name} onChange={(e) => handleColorChange(idx, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white" />
                      </div>
                      <div className="md:col-span-2">
                        <input type="number" placeholder="المخزون" value={col.stock} onChange={(e) => handleColorChange(idx, 'stock', parseInt(e.target.value) || 0)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white" />
                      </div>
                      <div className="md:col-span-6">
                        <input type="text" placeholder="صورة هذا اللون الخاصة (إن وجدت)" value={col.image} onChange={(e) => handleColorChange(idx, 'image', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white" />
                      </div>
                      <div className="md:col-span-1 text-center">
                        <button type="button" onClick={() => removeColorField(idx)} className="text-red-400 font-bold text-sm">✕</button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-900">
                      <span className="text-xs text-gray-400 font-semibold">المقاسات:</span>
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
              {submitting ? 'جاري الحفظ...' : editingId ? 'تحديث المنتج' : 'حفظ ونشر المنتج'}
            </button>
          </form>
        </section>

        {/* إدارة المنتجات */}
        <section className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-amber-400">🛍️ المنتجات الحالية ({products.length})</h2>
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
                  <button onClick={() => handleEditClick(prod)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-800/50 text-xs font-bold">تعديل</button>
                  <button onClick={() => handleDeleteProduct(prod.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-800/50 text-xs font-bold">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
