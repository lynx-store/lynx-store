'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../context/StoreContext';
import ChatWidget from '../components/ChatWidget';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [favorites, setFavorites] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null); // للمودال وتكبير التفاصيل

  // حالات الاختيار داخل مودال المنتج
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

  const { addToCart } = useStore();

  useEffect(() => {
    fetchProducts();
    const savedFavs = JSON.parse(localStorage.getItem('lynx_favs') || '[]');
    setFavorites(savedFavs);
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  // تبديل المفضلة
  const toggleFavorite = (product) => {
    let updated;
    if (favorites.some((f) => f.id === product.id)) {
      updated = favorites.filter((f) => f.id !== product.id);
    } else {
      updated = [...favorites, product];
    }
    setFavorites(updated);
    localStorage.setItem('lynx_favs', JSON.stringify(updated));
  };

  // تصفية المنتجات حسب الفئة أو قسم العروض
  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'قسم العروض 🔥') return p.is_offer === true;
    if (selectedCategory === 'المفضلة ❤️') return favorites.some((f) => f.id === p.id);
    if (selectedCategory === 'الكل') return true;
    return p.category === selectedCategory;
  });

  const openProductModal = (product) => {
    setActiveProduct(product);
    setSelectedColorIndex(0);
    const defaultSizes = product.colors?.[0]?.sizes || ['S', 'M', 'L', 'XL'];
    setSelectedSize(defaultSizes[0] || 'M');
  };

  const handleAddToCart = (product) => {
    const activeColor = product.colors?.[selectedColorIndex] || { color_name: 'افتراضي', image_url: product.image_url };
    const itemToAdd = {
      id: `${product.id}-${activeColor.color_name}-${selectedSize}`,
      productId: product.id,
      title: product.title,
      price: product.sale_price || product.price,
      color: activeColor.color_name,
      image: activeColor.image_url,
      size: selectedSize,
      quantity: 1,
    };
    addToCart(itemToAdd);
    setActiveProduct(null);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-amber-400 font-bold">جاري تحميل تشكيلة LYNX...</div>;

  return (
    <main className="min-h-screen bg-black text-white pb-24" dir="rtl">
      
      {/* قسم الهيدر / العروض الترويجية */}
      <section className="bg-gradient-to-r from-amber-600 to-yellow-500 text-black py-3 text-center text-xs font-black tracking-widest uppercase shadow-md">
        🚀 شحن مجاني للطلبات لأكثر من 1000 ج.م | تشكيلة LYNX الجديدة وصلت!
      </section>

      {/* شريط الفئات والتصفية */}
      <nav className="max-w-6xl mx-auto p-6 flex items-center justify-between border-b border-gray-900 overflow-x-auto">
        <div className="flex gap-2">
          {['الكل', 'قسم العروض 🔥', 'المفضلة ❤️', 'تيشرتات', 'هوديز', 'بنطلونات', 'كابات'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat ? 'bg-amber-500 text-black font-extrabold shadow-lg' : 'bg-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* شبكة المنتجات */}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center py-16 text-gray-500 font-bold">لا توجد منتجات في هذه الفئة حالياً.</p>
        ) : (
          filteredProducts.map((product) => {
            const isFav = favorites.some((f) => f.id === product.id);
            const displayImage = product.colors?.[0]?.image_url || product.image_url || '/placeholder.png';

            return (
              <div key={product.id} className="bg-gray-950 border border-gray-900 rounded-3xl overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl">
                <div className="relative aspect-square overflow-hidden bg-gray-900 cursor-pointer" onClick={() => openProductModal(product)}>
                  <img src={displayImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* شارة العرض */}
                  {product.is_offer && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-md">
                      خصم خاص 🔥
                    </span>
                  )}

                  {/* زر المفضلة */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                    className="absolute top-3 left-3 bg-black/60 backdrop-blur-md p-2 rounded-full text-sm transition-transform hover:scale-110"
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-base">{product.title}</h3>
                    <div className="text-left">
                      {product.sale_price ? (
                        <>
                          <span className="text-amber-400 font-black text-sm block">{product.sale_price} ج.م</span>
                          <span className="text-gray-600 line-through text-[11px] font-bold">{product.price} ج.م</span>
                        </>
                      ) : (
                        <span className="text-amber-400 font-black text-sm">{product.price} ج.م</span>
                      )}
                    </div>
                  </div>

                  {/* الألوان المتاحة في الكارت */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {product.colors?.map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-gray-700 shadow-inner" style={{ backgroundColor: c.color_hex }}></span>
                    ))}
                  </div>

                  <button
                    onClick={() => openProductModal(product)}
                    className="w-full bg-gray-900 hover:bg-amber-500 hover:text-black text-white font-bold py-3 rounded-xl text-xs transition-all border border-gray-800"
                  >
                    تحديد الخيارات والشراء 🛍️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* مودال التفاصيل والتخصيص قبل الإضافة للسلة */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative space-y-6">
            <button onClick={() => setActiveProduct(null)} className="absolute top-4 left-4 text-gray-400 hover:text-white text-xl font-bold">✕</button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* عرض صورة اللون المختار */}
              <div className="space-y-3">
                <img
                  src={activeProduct.colors?.[selectedColorIndex]?.image_url || activeProduct.image_url}
                  alt={activeProduct.title}
                  className="w-full aspect-square object-cover rounded-2xl border border-gray-800"
                />
                
                {/* معينة فيديو إن وجد */}
                {activeProduct.video_url && (
                  <a
                    href={activeProduct.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-red-950/40 border border-red-800/40 text-red-400 font-bold py-2 rounded-xl text-xs"
                  >
                    🎬 مشاهدة فيديو المنتج
                  </a>
                )}
              </div>

              {/* الخيارات والتفاصيل */}
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white">{activeProduct.title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{activeProduct.description || 'لا يوجد وصف مضاف.'}</p>

                {/* اختيار اللون */}
                {activeProduct.colors?.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-400">اللون:</label>
                    <div className="flex gap-2 flex-wrap">
                      {activeProduct.colors.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedColorIndex(i)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            selectedColorIndex === i ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-gray-800 bg-gray-950 text-gray-400'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color_hex }}></span>
                          {c.color_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* اختيار المقاس */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-400">المقاس:</label>
                  <div className="flex gap-2">
                    {(activeProduct.colors?.[selectedColorIndex]?.sizes || ['S', 'M', 'L', 'XL']).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs border transition-all ${
                          selectedSize === sz ? 'bg-amber-500 text-black border-amber-500' : 'bg-gray-950 border-gray-800 text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xl font-black text-amber-400">
                    {activeProduct.sale_price || activeProduct.price} ج.م
                  </span>
                  <button
                    onClick={() => handleAddToCart(activeProduct)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-lg"
                  >
                    إضافة للسلة 🛒
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مكون الشات المباشر مع الدعم */}
      <ChatWidget />
    </main>
  );
}
