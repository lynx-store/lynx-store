'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // حالة اللون الجديد مع مقاساته وكميات كل مقاس
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    size_quantities: {}, // مثال: { 'L': 34, '2XL': 3 }
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'كابات',
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

  // تحديد/إلغاء اختيار المقاس
  const toggleSize = (sz) => {
    setColorInput((prev) => {
      const updated = { ...prev.size_quantities };
      if (updated[sz] !== undefined) {
        delete updated[sz]; // إلغاء تحديد المقاس
      } else {
        updated[sz] = 1; // كمية افتراضية 1 عند الضغط على المقاس
      }
      return { ...prev, size_quantities: updated };
    });
  };

  // تغيير عدد القطع لمقاس معين
  const handleQtyChange = (sz, qty) => {
    setColorInput((prev) => ({
      ...prev,
      size_quantities: {
        ...prev.size_quantities,
        [sz]: Math.max(0, Number(qty)),
      },
    }));
  };

  // إضافة اللون مع مقاساته وكمياته إلى القائمة
  const addColorToProduct = () => {
    if (!colorInput.color_name) {
      alert('يرجى كتابة اسم اللون أولاً (مثال: أحمر)');
      return;
    }
    if (Object.keys(colorInput.size_quantities).length === 0) {
      alert('يرجى اختيار مقاس واحد على الأقل وتحديد كميته');
      return;
    }

    const newColorObj = {
      color_name: colorInput.color_name,
      color_hex: colorInput.color_hex,
      image_url: colorInput.image_url,
      sizes: Object.keys(colorInput.size_quantities),
      size_quantities: colorInput.size_quantities,
    };

    setFormData({ ...formData, colors: [...formData.colors, newColorObj] });
    
    // إعادة تعيين مدخلات اللون
    setColorInput({
      color_name: '',
      color_hex: '#000000',
      image_url: '',
      size_quantities: {},
    });
  };

  const removeColor = (index) => {
    setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== index) });
  };

  // حساب إجمالي كمية القطعة تلقائياً من جميع الألوان والمقاسات
  const calculateTotalQuantity = (colorsList) => {
    return colorsList.reduce((sum, col) => {
      const colTotal = Object.values(col.size_quantities || {}).reduce((a, b) => Number(a) + Number(b), 0);
      return sum + colTotal;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع تحديد مقاساته وكمياته');
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
      if (!error) alert('تم تعديل القطعة بالمخزن بنجاح! ✏️');
    } else {
      const { error } = await supabase.from('inventory').insert([payload]);
      if (!error) alert('تم إضافة القطعة بنجاح للمخزن! 📦');
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
    if (!confirm('هل أنت تأكد من حذف هذه القطعة من المخزن؟')) return;
    await supabase.from('inventory').delete().eq('id', id);
    fetchInventory();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', category: 'كابات', price: '', video_url: '', description: '', colors: [] });
    setColorInput({ color_name: '', color_hex: '#000000', image_url: '', size_quantities: {} });
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-white">إدارة المخزن المركزي 📦</h1>
        <a href="/admin/products" className="bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-bold">
          صفحة المتجر 🏪
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج الإضافة والتعديل */}
        <form onSubmit={handleSubmit} className="bg-[#0b101d] border border-gray-800 p-6 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
              {editingId ? 'تعديل قطعة بالمخزن ✏️' : 'إضافة قطعة جديدة ➕'}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-gray-400 hover:text-white">
                إلغاء
              </button>
            )}
          </div>

          <input
            type="text"
            required
            placeholder="اسم المنتج (مثال: نظارة / بنطلون)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#050811] border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-[#050811] border border-gray-800 rounded-xl p-3 text-xs text-white"
            >
              <option value="كابات">كابات</option>
              <option value="تيشرتات">تيشرتات</option>
              <option value="هوديز">هوديز</option>
              <option value="بنطلونات">بنطلونات</option>
              <option value="إكسسوارات">إكسسوارات</option>
            </select>

            <input
              type="number"
              required
              placeholder="السعر"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-[#050811] border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="text"
            placeholder="رابط الفيديو (اختياري)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-[#050811] border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* قسم اللون والمقاسات والكميات */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-[#050811]/60">
            <p className="text-xs font-bold text-amber-400">اللون والمقاسات والكميات:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (أسود، أحمر...)"
                value={colorInput.color_name}
                onChange={(e) => setColorInput({ ...colorInput, color_name: e.target.value })}
                className="w-full bg-[#0b101d] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="color"
                value={colorInput.color_hex}
                onChange={(e) => setColorInput({ ...colorInput, color_hex: e.target.value })}
                className="w-12 h-10 bg-[#0b101d] border border-gray-800 rounded-xl cursor-pointer p-1"
              />
            </div>

            <input
              type="url"
              placeholder="رابط صورة هذا اللون"
              value={colorInput.image_url}
              onChange={(e) => setColorInput({ ...colorInput, image_url: e.target.value })}
              className="w-full bg-[#0b101d] border border-gray-800 rounded-xl p-2.5 text-xs text-white"
            />

            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-2">اختر المقاسات وحدد كميتها:</p>
              
              {/* أزرار اختيار المقاس */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.size_quantities[sz] !== undefined;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                          : 'bg-[#0b101d] text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* حقول كمية القطع المخصصة لكل مقاس تم تحديده */}
              {Object.keys(colorInput.size_quantities).length > 0 && (
                <div className="bg-[#0b101d] p-3 rounded-2xl border border-gray-800 space-y-2 mb-3">
                  <p className="text-[10px] text-amber-400 font-bold">حدد عدد القطع المتاحة لكل مقاس:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(colorInput.size_quantities).map((sz) => (
                      <div key={sz} className="flex items-center justify-between bg-[#050811] p-2 rounded-xl border border-gray-800">
                        <span className="text-xs text-white font-bold">{sz}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={colorInput.size_quantities[sz]}
                            onChange={(e) => handleQtyChange(sz, e.target.value)}
                            className="w-16 bg-[#0b101d] border border-gray-700 rounded-lg p-1 text-center text-xs text-amber-400 font-bold"
                          />
                          <span className="text-[10px] text-gray-400">قطعة</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addColorToProduct}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs border border-gray-700 transition-all"
            >
              + اعتمد هذا اللون بمقاساته
            </button>

            {/* الألوان والمقاسات المعتمدة بالأعداد */}
            {formData.colors.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-gray-800">
                <p className="text-[11px] font-bold text-gray-400">الألوان والكميات المسجلة:</p>
                {formData.colors.map((c, idx) => (
                  <div key={idx} className="bg-[#0b101d] p-2.5 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full border border-gray-700" style={{ backgroundColor: c.color_hex }}></span>
                        <span className="text-white font-bold">{c.color_name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(c.size_quantities || {}).map(([sz, qty]) => (
                          <span key={sz} className="bg-[#050811] text-amber-400 border border-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {sz}: {qty} ق
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeColor(idx)} className="text-red-400 font-bold p-1">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-xl text-xs shadow-lg">
            {editingId ? 'حفظ التعديلات' : `حفظ بالكامل للمخزن (إجمالي: ${calculateTotalQuantity(formData.colors)} قطعة) 📦`}
          </button>
        </form>

        {/* قائمة قطع المخزن */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">القطع المخزنة ({inventory.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.map((item) => (
              <div key={item.id} className="bg-[#0b101d] border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {item.colors?.[0]?.image_url && (
                    <img src={item.colors[0].image_url} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-amber-400 font-bold">{item.price} ج.م</p>
                    <p className="text-[11px] text-gray-300 mt-1">
                      إجمالي المعروض: <span className="text-amber-400 font-bold">{item.total_quantity}</span> قطعة
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-2 space-y-1">
                  {item.colors?.map((col, idx) => (
                    <div key={idx} className="text-[10px] text-gray-400">
                      <span className="text-white font-bold">{col.color_name}:</span>{' '}
                      {Object.entries(col.size_quantities || {}).map(([sz, q]) => `${sz} (${q}ق)`).join(' | ')}
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
