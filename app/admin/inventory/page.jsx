'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // حالة اللون والمقاسات
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL'],
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'تيشرتات',
    price: '',
    total_quantity: '',
    video_url: '',
    description: '',
    colors: [],
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('*').order('id', { ascending: false });
    if (data) setInventory(data);
    setLoading(false);
  }

  const toggleSizeForColor = (size) => {
    setColorInput((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      };
    });
  };

  const addColorToProduct = () => {
    if (!colorInput.color_name || !colorInput.image_url) {
      alert('يرجى إضافة اسم اللون ورابط الصورة الخاص به');
      return;
    }
    setFormData({ ...formData, colors: [...formData.colors, colorInput] });
    setColorInput({ color_name: '', color_hex: '#000000', image_url: '', sizes: ['S', 'M', 'L', 'XL'] });
  };

  const removeColor = (index) => {
    setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع صورته ومقاساته');
      return;
    }

    const payload = {
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      total_quantity: Number(formData.total_quantity || 0),
      video_url: formData.video_url,
      description: formData.description,
      colors: formData.colors,
    };

    if (editingId) {
      // تعديل منتج في المخزن
      const { error } = await supabase.from('inventory').update(payload).eq('id', editingId);
      if (!error) alert('تم تعديل بيانات المخزن بنجاح! ✏️');
    } else {
      // إضافة جديد للمخزن
      const { error } = await supabase.from('inventory').insert([payload]);
      if (!error) alert('تم إضافة القطعة للمخزن بنجاح! 📦');
    }

    resetForm();
    fetchInventory();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      price: item.price,
      total_quantity: item.total_quantity || '',
      video_url: item.video_url || '',
      description: item.description || '',
      colors: item.colors || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت تأكد من حذف هذه القطعة من المخزن؟')) return;
    await supabase.from('inventory').delete().eq('id', id);
    fetchInventory();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'تيشرتات',
      price: '',
      total_quantity: '',
      video_url: '',
      description: '',
      colors: [],
    });
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري تحميل المخزن...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-white">إدارة المخزن المركزي 📦</h1>
        <a href="/admin/products" className="bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold">
          عرض صفحة المتجر 🏪
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج الإضافة والتعديل */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-amber-400">
              {editingId ? 'تعديل قطعة في المخزن ✏️' : 'إضافة قطعة جديدة للمخزن ➕'}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-gray-400 hover:text-white">
                إلغاء التعديل
              </button>
            )}
          </div>

          <input
            type="text"
            required
            placeholder="اسم القطعة (مثال: بنطلون LYNX كارجو)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            >
              <option value="تيشرتات">تيشرتات</option>
              <option value="هوديز">هوديز</option>
              <option value="بنطلونات">بنطلونات</option>
              <option value="كابات">كابات</option>
            </select>

            <input
              type="number"
              required
              placeholder="سعر القطعة الأساسي"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="number"
            required
            placeholder="إجمالي عدد القطع المتاحة"
            value={formData.total_quantity}
            onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          <input
            type="url"
            placeholder="رابط فيديو القطعة (اختياري)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* خيارات الألوان والصور والمقاسات */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-950/50">
            <p className="text-xs font-bold text-amber-400">خيارات اللون والصورة والمقاسات:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (أسود، زيتي...)"
                value={colorInput.color_name}
                onChange={(e) => setColorInput({ ...colorInput, color_name: e.target.value })}
                className="w-1/2 bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="color"
                value={colorInput.color_hex}
                onChange={(e) => setColorInput({ ...colorInput, color_hex: e.target.value })}
                className="w-1/2 h-10 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer"
              />
            </div>

            <input
              type="url"
              placeholder="رابط صورة هذا اللون تحديداً"
              value={colorInput.image_url}
              onChange={(e) => setColorInput({ ...colorInput, image_url: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
            />

            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5">المقاسات المتوفرة للون:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeForColor(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={addColorToProduct}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-xl text-xs border border-gray-700"
            >
              + اعتماد هذا اللون
            </button>

            {formData.colors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                {formData.colors.map((c, idx) => (
                  <div key={idx} className="bg-gray-900 p-2 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color_hex }}></span>
                      <span className="text-white font-bold">{c.color_name}</span>
                      <span className="text-[10px] text-amber-400">({c.sizes.join(', ')})</span>
                    </div>
                    <button type="button" onClick={() => removeColor(idx)} className="text-red-400 font-bold">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <textarea
            placeholder="وصف القطعة..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          ></textarea>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl text-xs">
            {editingId ? 'حفظ التعديلات' : 'إضافة القطعة للمخزن 📦'}
          </button>
        </form>

        {/* عرض قائمة قطع المخزن */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">قطع المخزن المسجلة ({inventory.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map((item) => (
              <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {item.colors?.[0]?.image_url && (
                    <img src={item.colors[0].image_url} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-amber-400 font-bold">{item.price} ج.م</p>
                    <p className="text-[10px] text-gray-400">إجمالي الكمية: {item.total_quantity} قطعة</p>
                    <p className="text-[10px] text-gray-400">الألوان: {item.colors?.length || 0}</p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-gray-800 pt-2 text-xs">
                  <button onClick={() => handleEdit(item)} className="text-amber-400 font-bold">
                    تعديل ✏️
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 font-bold">
                    حذف 🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
