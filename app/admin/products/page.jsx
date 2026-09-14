'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminProductsPage() {
  const [inventoryList, setInventoryList] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [isOffer, setIsOffer] = useState(false);
  const [salePrice, setSalePrice] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: inv } = await supabase.from('inventory').select('*').order('id', { ascending: false });
    const { data: prods } = await supabase.from('products').select('*, inventory(*)').order('id', { ascending: false });
    
    if (inv) setInventoryList(inv);
    if (prods) setStoreProducts(prods);
    setLoading(false);
  }

  const handlePublishToStore = async (e) => {
    e.preventDefault();
    if (!selectedInventoryId) {
      alert('يرجى اختيار منتج من المخزن أولاً');
      return;
    }

    const selectedItem = inventoryList.find((i) => i.id === Number(selectedInventoryId));
    if (!selectedItem) return;

    if (isOffer && (!salePrice || Number(salePrice) >= selectedItem.price)) {
      alert('يرجى كتابة سعر الخصم وأن يكون أقل من السعر الأصلي');
      return;
    }

    try {
      const payload = {
        inventory_id: selectedItem.id,
        title: selectedItem.title,
        category: selectedItem.category,
        price: selectedItem.price,
        sale_price: isOffer ? Number(salePrice) : null,
        is_offer: isOffer,
        video_url: selectedItem.video_url,
        description: selectedItem.description,
        colors: selectedItem.colors,
        in_stock: true,
      };

      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (error) throw error;

      alert('تم إدراج المنتج في المتجر بنجاح! 🚀');
      setStoreProducts([data[0], ...storeProducts]);
      setSelectedInventoryId('');
      setIsOffer(false);
      setSalePrice('');
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
  };

  const deleteFromStore = async (id) => {
    if (!confirm('هل تريد إزالة هذا المنتج من المتجر؟ (سيظل محفوظاً في المخزن)')) return;
    await supabase.from('products').delete().eq('id', id);
    setStoreProducts(storeProducts.filter((p) => p.id !== id));
  };

  if (loading) return <div className="p-12 text-center text-amber-400 font-bold">جاري التحميل...</div>;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12" dir="rtl">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-white">إضافة منتج للعرض على المتجر 🏪</h1>
        <a href="/admin/inventory" className="bg-gray-800 hover:bg-gray-700 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold border border-gray-700">
          📦 الذهاب لإدارة المخزن
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* اختيار منتج من المخزن لنشره */}
        <form onSubmit={handlePublishToStore} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-amber-400">إدراج قطعة من المخزن للمتجر</h2>

          <div>
            <label className="text-xs text-gray-400 block mb-2 font-bold">اختر المنتج من المخزن:</label>
            <select
              value={selectedInventoryId}
              onChange={(e) => setSelectedInventoryId(e.target.value)}
              required
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
            >
              <option value="">-- اختر من القائمة --</option>
              {inventoryList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.price} ج.م) - المتبقي: {item.total_quantity} قطعة
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={isOffer} onChange={(e) => setIsOffer(e.target.checked)} />
            إضافة إلى قسم العروض 🔥
          </label>

          {isOffer && (
            <div>
              <label className="text-xs text-amber-400 block mb-1 font-bold">السعر بعد الخصم (ج.م):</label>
              <input
                type="number"
                required
                placeholder="مثال: 399"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white"
              />
            </div>
          )}

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl text-xs shadow-xl">
            نشر المنتج على المتجر 🚀
          </button>
        </form>

        {/* المنتجات المعروضة حالياً بالمتجر */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">المنتجات المعروضة في المتجر حالياً ({storeProducts.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {storeProducts.map((p) => (
              <div key={p.id} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex gap-3">
                  {p.colors?.[0]?.image_url && (
                    <img src={p.colors[0].image_url} alt={p.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    {p.is_offer ? (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold text-xs">{p.sale_price} ج.م</span>
                        <span className="text-gray-600 line-through text-[10px]">{p.price} ج.م</span>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-bold text-xs">{p.price} ج.م</span>
                    )}
                    {p.is_offer && <span className="text-[10px] bg-red-600/30 text-red-400 px-2 py-0.5 rounded-md mt-1 inline-block">في العروض 🔥</span>}
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-800 pt-2">
                  <button onClick={() => deleteFromStore(p.id)} className="text-red-400 font-bold text-xs">
                    إزالة من المتجر 🗑️
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
