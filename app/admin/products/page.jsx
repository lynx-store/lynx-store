'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة نموذج اللون والمقاسات الخاص به
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL'], // المقاسات المحددة افتراضياً
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'تيشرتات',
    price: '',
    sale_price: '',
    is_offer: false,
    video_url: '',
    description: '',
    in_stock: true,
    colors: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // تحديد/إلغاء تحديد مقاس معين للون الحالي
  const toggleSizeForColor = (size) => {
    setColorInput((prev) => {
      const exists = prev.sizes.includes(size);
      const updatedSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  // إضافة اللون بقائمته ومقاساته
  const addColorToProduct = () => {
    if (!colorInput.color_name || !colorInput.image_url) {
      alert('يرجى كتابة اسم اللون وإضافة رابط الصورة الخاص به');
      return;
    }
    if (colorInput.sizes.length === 0) {
      alert('يرجى تحديد مقاس واحد على الأقل لهذا اللون');
      return;
    }

    setFormData({ ...formData, colors: [...formData.colors, colorInput] });
    // إعادة تعيين نموذج اللون
    setColorInput({
      color_name: '',
      color_hex: '#000000',
      image_url: '',
      sizes: ['S', 'M', 'L', 'XL'],
    });
  };

  // حذف لون من القائمة المؤقتة
  const removeColorFromProduct = (indexToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع صورته ومقاساته');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        is_offer: formData.is_offer,
        video_url: formData.video_url,
        description: formData.description,
        in_stock: formData.in_stock,
        colors: formData.colors,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) throw error;

      alert('تم إضافة المنتج بنجاح! 🎉');
      setProducts([data[0], ...products]);
      setFormData({
        title: '',
        category: 'تيشرتات',
        price: '',
        sale_price: '',
        is_offer: false,
        video_url: '',
        description: '',
        in_stock: true,
        colors: [],
      });
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const toggleStock = async (id, currentStatus) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    setProducts(products.map((p) => (p.id === id ? { ...p, in_stock: !currentStatus } : p)));
  };

  const deleteProduct = async (id) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إدارة وتفاصيل المنتجات 👕
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج إضافة المنتجات */}
        <form onSubmit={handleAddProduct} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">إضافة منتج جديد</h2>

          <input
            type="text"
            required
            placeholder="اسم المنتج"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
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

            <label className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_offer}
                onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
              />
              إضافة لقسم العروض 🔥
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              placeholder="السعر الأساسي"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
            <input
              type="number"
              placeholder="سعر العرض (اختياري)"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="url"
            placeholder="رابط فيديو المنتج (YouTube / MP4)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* إضافة الألوان والمقاسات والصور */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-950/50">
            <p className="text-xs font-bold text-amber-400">خيارات اللون والمقاس والصورة:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (مثل: أسود)"
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

            {/* تحديد المقاسات المتاحة لهذا اللون */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5">المقاسات المتاحة لهذا اللون:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeForColor(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
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
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2 border border-gray-700"
            >
              + اعتماد هذا اللون ومقاساته
            </button>

            {/* الألوان المضافة للمنتج الحالي */}
            {formData.colors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <p className="text-[11px] text-gray-400 font-bold">الألوان المعتمدة:</p>
                <div className="space-y-1.5">
                  {formData.colors.map((c, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-2 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-600" style={{ backgroundColor: c.color_hex }}></span>
                        <span className="font-bold text-white">{c.color_name}</span>
                        <span className="text-[10px] text-amber-400">({c.sizes.join(', ')})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorFromProduct(i)}
                        className="text-red-400 font-bold hover:text-red-300 text-xs px-2"
                      >
                        حذف ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            placeholder="وصف المنتج..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          ></textarea>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl text-xs shadow-xl">
            حفظ وإضافة المنتج 🚀
          </button>
        </form>

        {/* عرض المنتجات الحالية */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">المنتجات الحالية ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {p.colors && p.colors[0] && (
                    <img src={p.colors[0].image_url} alt={p.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-amber-400 font-bold">{p.sale_price || p.price} ج.م</p>
                    <p className="text-[10px] text-gray-400">عدد الألوان: {p.colors?.length || 0}</p>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2 text-xs">
                  <button
                    onClick={() => toggleStock(p.id, p.in_stock)}
                    className={`px-3 py-1 rounded-lg font-bold ${p.in_stock ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {p.in_stock ? 'متوفر ✅' : 'نفذت الكمية ❌'}
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-400 font-bold">حذف 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة نموذج اللون والمقاسات الخاص به
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL'], // المقاسات المحددة افتراضياً
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'تيشرتات',
    price: '',
    sale_price: '',
    is_offer: false,
    video_url: '',
    description: '',
    in_stock: true,
    colors: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // تحديد/إلغاء تحديد مقاس معين للون الحالي
  const toggleSizeForColor = (size) => {
    setColorInput((prev) => {
      const exists = prev.sizes.includes(size);
      const updatedSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  // إضافة اللون بقائمته ومقاساته
  const addColorToProduct = () => {
    if (!colorInput.color_name || !colorInput.image_url) {
      alert('يرجى كتابة اسم اللون وإضافة رابط الصورة الخاص به');
      return;
    }
    if (colorInput.sizes.length === 0) {
      alert('يرجى تحديد مقاس واحد على الأقل لهذا اللون');
      return;
    }

    setFormData({ ...formData, colors: [...formData.colors, colorInput] });
    // إعادة تعيين نموذج اللون
    setColorInput({
      color_name: '',
      color_hex: '#000000',
      image_url: '',
      sizes: ['S', 'M', 'L', 'XL'],
    });
  };

  // حذف لون من القائمة المؤقتة
  const removeColorFromProduct = (indexToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع صورته ومقاساته');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        is_offer: formData.is_offer,
        video_url: formData.video_url,
        description: formData.description,
        in_stock: formData.in_stock,
        colors: formData.colors,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) throw error;

      alert('تم إضافة المنتج بنجاح! 🎉');
      setProducts([data[0], ...products]);
      setFormData({
        title: '',
        category: 'تيشرتات',
        price: '',
        sale_price: '',
        is_offer: false,
        video_url: '',
        description: '',
        in_stock: true,
        colors: [],
      });
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const toggleStock = async (id, currentStatus) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    setProducts(products.map((p) => (p.id === id ? { ...p, in_stock: !currentStatus } : p)));
  };

  const deleteProduct = async (id) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إدارة وتفاصيل المنتجات 👕
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج إضافة المنتجات */}
        <form onSubmit={handleAddProduct} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">إضافة منتج جديد</h2>

          <input
            type="text"
            required
            placeholder="اسم المنتج"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
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

            <label className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_offer}
                onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
              />
              إضافة لقسم العروض 🔥
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              placeholder="السعر الأساسي"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
            <input
              type="number"
              placeholder="سعر العرض (اختياري)"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="url"
            placeholder="رابط فيديو المنتج (YouTube / MP4)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* إضافة الألوان والمقاسات والصور */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-950/50">
            <p className="text-xs font-bold text-amber-400">خيارات اللون والمقاس والصورة:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (مثل: أسود)"
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

            {/* تحديد المقاسات المتاحة لهذا اللون */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5">المقاسات المتاحة لهذا اللون:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeForColor(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
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
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2 border border-gray-700"
            >
              + اعتماد هذا اللون ومقاساته
            </button>

            {/* الألوان المضافة للمنتج الحالي */}
            {formData.colors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <p className="text-[11px] text-gray-400 font-bold">الألوان المعتمدة:</p>
                <div className="space-y-1.5">
                  {formData.colors.map((c, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-2 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-600" style={{ backgroundColor: c.color_hex }}></span>
                        <span className="font-bold text-white">{c.color_name}</span>
                        <span className="text-[10px] text-amber-400">({c.sizes.join(', ')})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorFromProduct(i)}
                        className="text-red-400 font-bold hover:text-red-300 text-xs px-2"
                      >
                        حذف ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            placeholder="وصف المنتج..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          ></textarea>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl text-xs shadow-xl">
            حفظ وإضافة المنتج 🚀
          </button>
        </form>

        {/* عرض المنتجات الحالية */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">المنتجات الحالية ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {p.colors && p.colors[0] && (
                    <img src={p.colors[0].image_url} alt={p.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-amber-400 font-bold">{p.sale_price || p.price} ج.م</p>
                    <p className="text-[10px] text-gray-400">عدد الألوان: {p.colors?.length || 0}</p>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2 text-xs">
                  <button
                    onClick={() => toggleStock(p.id, p.in_stock)}
                    className={`px-3 py-1 rounded-lg font-bold ${p.in_stock ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {p.in_stock ? 'متوفر ✅' : 'نفذت الكمية ❌'}
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-400 font-bold">حذف 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة نموذج اللون والمقاسات الخاص به
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL'], // المقاسات المحددة افتراضياً
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'تيشرتات',
    price: '',
    sale_price: '',
    is_offer: false,
    video_url: '',
    description: '',
    in_stock: true,
    colors: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // تحديد/إلغاء تحديد مقاس معين للون الحالي
  const toggleSizeForColor = (size) => {
    setColorInput((prev) => {
      const exists = prev.sizes.includes(size);
      const updatedSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  // إضافة اللون بقائمته ومقاساته
  const addColorToProduct = () => {
    if (!colorInput.color_name || !colorInput.image_url) {
      alert('يرجى كتابة اسم اللون وإضافة رابط الصورة الخاص به');
      return;
    }
    if (colorInput.sizes.length === 0) {
      alert('يرجى تحديد مقاس واحد على الأقل لهذا اللون');
      return;
    }

    setFormData({ ...formData, colors: [...formData.colors, colorInput] });
    // إعادة تعيين نموذج اللون
    setColorInput({
      color_name: '',
      color_hex: '#000000',
      image_url: '',
      sizes: ['S', 'M', 'L', 'XL'],
    });
  };

  // حذف لون من القائمة المؤقتة
  const removeColorFromProduct = (indexToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع صورته ومقاساته');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        is_offer: formData.is_offer,
        video_url: formData.video_url,
        description: formData.description,
        in_stock: formData.in_stock,
        colors: formData.colors,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) throw error;

      alert('تم إضافة المنتج بنجاح! 🎉');
      setProducts([data[0], ...products]);
      setFormData({
        title: '',
        category: 'تيشرتات',
        price: '',
        sale_price: '',
        is_offer: false,
        video_url: '',
        description: '',
        in_stock: true,
        colors: [],
      });
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const toggleStock = async (id, currentStatus) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    setProducts(products.map((p) => (p.id === id ? { ...p, in_stock: !currentStatus } : p)));
  };

  const deleteProduct = async (id) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إدارة وتفاصيل المنتجات 👕
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج إضافة المنتجات */}
        <form onSubmit={handleAddProduct} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">إضافة منتج جديد</h2>

          <input
            type="text"
            required
            placeholder="اسم المنتج"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
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

            <label className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_offer}
                onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
              />
              إضافة لقسم العروض 🔥
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              placeholder="السعر الأساسي"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
            <input
              type="number"
              placeholder="سعر العرض (اختياري)"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="url"
            placeholder="رابط فيديو المنتج (YouTube / MP4)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* إضافة الألوان والمقاسات والصور */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-950/50">
            <p className="text-xs font-bold text-amber-400">خيارات اللون والمقاس والصورة:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (مثل: أسود)"
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

            {/* تحديد المقاسات المتاحة لهذا اللون */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5">المقاسات المتاحة لهذا اللون:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeForColor(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
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
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2 border border-gray-700"
            >
              + اعتماد هذا اللون ومقاساته
            </button>

            {/* الألوان المضافة للمنتج الحالي */}
            {formData.colors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <p className="text-[11px] text-gray-400 font-bold">الألوان المعتمدة:</p>
                <div className="space-y-1.5">
                  {formData.colors.map((c, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-2 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-600" style={{ backgroundColor: c.color_hex }}></span>
                        <span className="font-bold text-white">{c.color_name}</span>
                        <span className="text-[10px] text-amber-400">({c.sizes.join(', ')})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorFromProduct(i)}
                        className="text-red-400 font-bold hover:text-red-300 text-xs px-2"
                      >
                        حذف ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            placeholder="وصف المنتج..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          ></textarea>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl text-xs shadow-xl">
            حفظ وإضافة المنتج 🚀
          </button>
        </form>

        {/* عرض المنتجات الحالية */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">المنتجات الحالية ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {p.colors && p.colors[0] && (
                    <img src={p.colors[0].image_url} alt={p.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-amber-400 font-bold">{p.sale_price || p.price} ج.م</p>
                    <p className="text-[10px] text-gray-400">عدد الألوان: {p.colors?.length || 0}</p>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2 text-xs">
                  <button
                    onClick={() => toggleStock(p.id, p.in_stock)}
                    className={`px-3 py-1 rounded-lg font-bold ${p.in_stock ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {p.in_stock ? 'متوفر ✅' : 'نفذت الكمية ❌'}
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-400 font-bold">حذف 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // حالة نموذج اللون والمقاسات الخاص به
  const [colorInput, setColorInput] = useState({
    color_name: '',
    color_hex: '#000000',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL'], // المقاسات المحددة افتراضياً
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'تيشرتات',
    price: '',
    sale_price: '',
    is_offer: false,
    video_url: '',
    description: '',
    in_stock: true,
    colors: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  // تحديد/إلغاء تحديد مقاس معين للون الحالي
  const toggleSizeForColor = (size) => {
    setColorInput((prev) => {
      const exists = prev.sizes.includes(size);
      const updatedSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  // إضافة اللون بقائمته ومقاساته
  const addColorToProduct = () => {
    if (!colorInput.color_name || !colorInput.image_url) {
      alert('يرجى كتابة اسم اللون وإضافة رابط الصورة الخاص به');
      return;
    }
    if (colorInput.sizes.length === 0) {
      alert('يرجى تحديد مقاس واحد على الأقل لهذا اللون');
      return;
    }

    setFormData({ ...formData, colors: [...formData.colors, colorInput] });
    // إعادة تعيين نموذج اللون
    setColorInput({
      color_name: '',
      color_hex: '#000000',
      image_url: '',
      sizes: ['S', 'M', 'L', 'XL'],
    });
  };

  // حذف لون من القائمة المؤقتة
  const removeColorFromProduct = (indexToRemove) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert('يرجى إضافة لون واحد على الأقل مع صورته ومقاساته');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        is_offer: formData.is_offer,
        video_url: formData.video_url,
        description: formData.description,
        in_stock: formData.in_stock,
        colors: formData.colors,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) throw error;

      alert('تم إضافة المنتج بنجاح! 🎉');
      setProducts([data[0], ...products]);
      setFormData({
        title: '',
        category: 'تيشرتات',
        price: '',
        sale_price: '',
        is_offer: false,
        video_url: '',
        description: '',
        in_stock: true,
        colors: [],
      });
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const toggleStock = async (id, currentStatus) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    setProducts(products.map((p) => (p.id === id ? { ...p, in_stock: !currentStatus } : p)));
  };

  const deleteProduct = async (id) => {
    if (!confirm('هل تريد حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إدارة وتفاصيل المنتجات 👕
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج إضافة المنتجات */}
        <form onSubmit={handleAddProduct} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">إضافة منتج جديد</h2>

          <input
            type="text"
            required
            placeholder="اسم المنتج"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none"
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

            <label className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl px-3 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_offer}
                onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
              />
              إضافة لقسم العروض 🔥
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              required
              placeholder="السعر الأساسي"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
            <input
              type="number"
              placeholder="سعر العرض (اختياري)"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              className="bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <input
            type="url"
            placeholder="رابط فيديو المنتج (YouTube / MP4)"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          />

          {/* إضافة الألوان والمقاسات والصور */}
          <div className="border border-gray-800 p-4 rounded-2xl space-y-3 bg-gray-950/50">
            <p className="text-xs font-bold text-amber-400">خيارات اللون والمقاس والصورة:</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اسم اللون (مثل: أسود)"
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

            {/* تحديد المقاسات المتاحة لهذا اللون */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 mb-1.5">المقاسات المتاحة لهذا اللون:</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SIZES.map((sz) => {
                  const isSelected = colorInput.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSizeForColor(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
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
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 rounded-xl text-xs mt-2 border border-gray-700"
            >
              + اعتماد هذا اللون ومقاساته
            </button>

            {/* الألوان المضافة للمنتج الحالي */}
            {formData.colors.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <p className="text-[11px] text-gray-400 font-bold">الألوان المعتمدة:</p>
                <div className="space-y-1.5">
                  {formData.colors.map((c, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-2 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-600" style={{ backgroundColor: c.color_hex }}></span>
                        <span className="font-bold text-white">{c.color_name}</span>
                        <span className="text-[10px] text-amber-400">({c.sizes.join(', ')})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColorFromProduct(i)}
                        className="text-red-400 font-bold hover:text-red-300 text-xs px-2"
                      >
                        حذف ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <textarea
            placeholder="وصف المنتج..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
          ></textarea>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl text-xs shadow-xl">
            حفظ وإضافة المنتج 🚀
          </button>
        </form>

        {/* عرض المنتجات الحالية */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">المنتجات الحالية ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {p.colors && p.colors[0] && (
                    <img src={p.colors[0].image_url} alt={p.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-amber-400 font-bold">{p.sale_price || p.price} ج.م</p>
                    <p className="text-[10px] text-gray-400">عدد الألوان: {p.colors?.length || 0}</p>
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2 text-xs">
                  <button
                    onClick={() => toggleStock(p.id, p.in_stock)}
                    className={`px-3 py-1 rounded-lg font-bold ${p.in_stock ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {p.in_stock ? 'متوفر ✅' : 'نفذت الكمية ❌'}
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-400 font-bold">حذف 🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
