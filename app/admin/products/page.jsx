'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'تيشرتات',
    image_url: '',
    description: '',
    in_stock: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // إضافة منتج جديد
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.from('products').insert([
        {
          title: formData.title,
          price: Number(formData.price),
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description,
          in_stock: formData.in_stock,
        },
      ]).select();

      if (error) throw error;

      alert('تم إضافة المنتج بنجاح! 🎉');
      setProducts([data[0], ...products]);
      setFormData({
        title: '',
        price: '',
        category: 'تيشرتات',
        image_url: '',
        description: '',
        in_stock: true,
      });
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة المنتج: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // تغيير حالة التوفر
  const toggleStock = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setProducts(products.map((p) => (p.id === id ? { ...p, in_stock: !currentStatus } : p)));
    } catch (err) {
      console.error(err);
      alert('فشل تعديل حالة التوفر');
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت تأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('فشل حذف المنتج');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-amber-400 font-bold animate-pulse">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <h1 className="text-3xl font-black text-white mb-8 border-b border-gray-800 pb-4">
        إدارة منتجات LYNX 👕
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نموذج إضافة منتج جديد */}
        <form onSubmit={handleAddProduct} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl h-fit">
          <h2 className="text-lg font-bold text-amber-400">إضافة منتج جديد</h2>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">اسم المنتج</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: هودي LYNX أسود"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">السعر (ج.م)</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="350"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">الفئة</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="تيشرتات">تيشرتات</option>
              <option value="هوديز">هوديز</option>
              <option value="بنطلونات">بنطلونات</option>
              <option value="كابات">كابات</option>
              <option value="إكسسوارات">إكسسوارات</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">رابط الصورة (Image URL)</label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">وصف المنتج</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="خامة ميلتون قطن 100%..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-xl cursor-pointer disabled:opacity-50 text-xs"
          >
            {submitting ? 'جاري الإضافة...' : 'إضافة المنتج للمتجر ➕'}
          </button>
        </form>

        {/* قائمة المنتجات المضافة */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">المنتجات الحالية ({products.length})</h2>
          
          {products.length === 0 ? (
            <p className="text-gray-400 text-xs">لا توجد منتجات مضافة حتى الآن.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between shadow-lg">
                  <div className="flex gap-3">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-800"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{product.title}</h3>
                      <p className="text-xs text-amber-400 font-bold">{product.price} ج.م</p>
                      <span className="inline-block mt-1 text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-850 pt-2 text-xs">
                    <button
                      onClick={() => toggleStock(product.id, product.in_stock)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        product.in_stock
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {product.in_stock ? 'متوفر ✅' : 'نفذت الكمية ❌'}
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-400 hover:text-red-300 font-bold text-xs"
                    >
                      حذف 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
