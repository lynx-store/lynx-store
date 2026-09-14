'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // حالة اللون مع مقاساته وكمياتها
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    size_quantities: {}, // مثال: { 'M': 5, 'L': 10 }
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'تيشرتات',
    price: '',
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

  // تبديل اختيار المقاس وتحديد كميته
  const toggleSize = (size) => {
    setColorInput((prev) => {
      const updated = { ...prev.size_quantities };
      if (updated[size] !== undefined) {
        delete updated[size];
      } else {
        updated[size] = 1; // كمية افتراضية 1 عند الاختيار
      }
      return { ...prev, size_quantities: updated };
    });
  };

  const handleQtyChange = (size, qty) => {
    setColorInput((prev) => ({
      ...prev,
      size_quantities: {
        ...prev.size_quantities,
        [size]: Math.max(0, Number(qty)),
      },
    }));
  };

  const addColorToProduct = () => {
    if (!colorInput.color_name || !colorInput.image_url) {
      alert('يرجى إضافة اسم اللون ورابط الصورة الخاص به');
      return;
    }
    if (Object.keys(colorInput.size_quantities).length === 0) {
      alert('يرجى تحديد مقاس واحد على الأقل مع كميته');
      return;
    }

    const colorData = {
      color_name: colorInput.color_name,
      color_hex: colorInput.color_hex,
      image_url: colorInput.image_url,
      sizes: Object.keys(colorInput.size_quantities),
      size_quantities: colorInput.size_quantities,
    };

    setFormData({ ...formData, colors: [...formData.colors, colorData] });
    setColorInput({ color_name: '', color_hex: '#000000', image_url: '', size_quantities: {} });
  };

  const removeColor = (index) => {
    setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== index) });
  };

  // حساب إجمالي الكميات المتاحة من كافة الألوان والمقاسات
  const calculateTotalQuantity = (colorsList) => {
    return colorsList.reduce((sum, c) => {
      const colSum = Object.values(c.size_quantities || {}).reduce((a, b) => Number(a) + Number(b), 0);
      return sum + colSum;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع مقاساته وكمياته');
      return;
    }

    const totalQty = calculateTotalQuantity(formData.colors);

    const payload = {
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      total_quantity: totalQty,
      video_url: formData.video_url,
      description: formData.description,
      colors: formData.colors,
    };

    if (editingId) {
      const { error } = await supabase.from('inventory').update(payload).eq('id', editingId);
      if (!error) alert('تم تعديل بيانات القطعة بالمخزن بنجاح! ✏️');
    } else {
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
      video_url: item.video_url || '',
      description: item.description || '',
      colors: item.colors || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('هل تريد حذف هذه القطعة من المخزن؟')) return;
    await supabase.from('inventory').delete().eq('id', id);
    fetchInventory();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', category: 'تيشرتات', price: '', video_url: '', description: '', colors: [] });
    setColorInput({ color_name: '', color_hex: '#000000', image_url: '', size_quantities: {} });
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
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">
            {editingId ? 'تعديل قطعة بالمخزن ✏️' : 'إضافة قطعة جديدة للمخزن ➕'}
          </h2>

          <input
            type="text"
            required
            placeholder="اسم القطعة (مثل: بنطلون LYNX كارجو)"
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
              placeholder="السعر الأساسي"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="url"
            placeholder="رابط الفيديو (اختياري)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* تخصيص المقاسات وكمياتها لكل لون */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-950/50">
            <p className="text-xs font-bold text-amber-400">اللون والمقاسات والكميات:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (أسود، أحمر...)"
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
              placeholder="رابط صورة هذا اللون"
              value={colorInput.image_url}
              onChange={(e) => setColorInput({ ...colorInput, image_url: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
            />

            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5">اختر المقاسات وحدد كميتها:</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.size_quantities[sz] !== undefined;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* مدخل الكمية لكل مقاس تم اختياره */}
              {Object.keys(colorInput.size_quantities).length > 0 && (
                <div className="space-y-2 bg-gray-900 p-3 rounded-xl border border-gray-800 mt-2">
                  <p className="text-[10px] text-amber-400 font-bold">الكميات المتاحة بكل مقاس:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(colorInput.size_quantities).map((sz) => (
                      <div key={sz} className="flex items-center gap-2">
                        <span className="text-xs text-white font-bold w-8">{sz}:</span>
                        <input
                          type="number"
                          min="1"
                          value={colorInput.size_quantities[sz]}
                          onChange={(e) => handleQtyChange(sz, e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg p-1.5 text-xs text-white text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addColorToProduct}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-xl text-xs border border-gray-700"
            >
              + اعتمد هذا اللون بمقاساته
            </button>

            {/* الألوان المعتمدة ومقاساتها */}
            {formData.colors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                {formData.colors.map((c, idx) => (
                  <div key={idx} className="bg-gray-900 p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color_hex }}></span>
                        <span className="text-white font-bold">{c.color_name}</span>
                      </div>
                      <div className="text-[10px] text-amber-400 mt-1">
                        {Object.entries(c.size_quantities || {}).map(([sz, q]) => `${sz}: (${q} قطعة)`).join(' | ')}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeColor(idx)} className="text-red-400 font-bold px-2">
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
            {editingId ? 'حفظ التعديلات' : `حفظ القطعة بالمخزن (إجمالي الكمية: ${calculateTotalQuantity(formData.colors)}) 📦`}
          </button>
        </form>

        {/* عرض قائمة قطع المخزن */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">المخزن الحالي ({inventory.length})</h2>
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
                    <p className="text-[11px] text-gray-300 font-bold mt-1">
                      إجمالي المتبقي بالمخزن: <span className="text-amber-400">{item.total_quantity}</span> قطعة
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-2 space-y-1">
                  {item.colors?.map((col, idx) => (
                    <div key={idx} className="text-[10px] text-gray-400 flex justify-between">
                      <span>🎨 {col.color_name}:</span>
                      <span>
                        {Object.entries(col.size_quantities || {}).map(([sz, q]) => `${sz}: ${q}`).join(', ')}
                      </span>
                    </div>
                  ))}
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
