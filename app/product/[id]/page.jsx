'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState('');

  // سلة المشتريات المصغرة
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        setProduct(data);
        
        // تعيين الصورة الرئيسية الأولية
        if (data?.image_url) {
          setActiveImage(data.image_url);
        }

        if (data?.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].name);
          if (data.colors[0].sizes && data.colors[0].sizes.length > 0) {
            setSelectedSize(data.colors[0].sizes[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-950 text-white p-12 text-center" dir="rtl">جاري تحميل تفاصيل المنتج...</div>;
  if (!product) return <div className="min-h-screen bg-gray-950 text-white p-12 text-center" dir="rtl">المنتج غير موجود.</div>;

  const activeColorObj = product.colors?.find(c => c.name === selectedColor) || product.colors?.[0];
  
  // تجميع كل الصور المتاحة (الصورة الأساسية + الصور الإضافية بزوايا مختلفة + صور الألوان الخاصة)
  const allImages = [
    product.image_url,
    ...(product.extra_images || []),
    ...(product.colors?.map(c => c.image).filter(Boolean) || [])
  ].filter(Boolean);

  const currentStock = activeColorObj ? activeColorObj.stock : 10;
  const availableSizes = activeColorObj?.sizes || ['M', 'L', 'XL', '2XL'];

  const handleColorChange = (col) => {
    setSelectedColor(col.name);
    if (col.image) {
      setActiveImage(col.image);
    }
    if (col.sizes && col.sizes.length > 0) {
      setSelectedSize(col.sizes[0]);
    }
  };

  // دالة لتحويل رابط يوتيوب العادي إلى رابط مضمن (Embed) للفيديو
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const addToCart = () => {
    if (currentStock <= 0) {
      alert('عذراً، هذا اللون غير متوفر حالياً.');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find(
        i => i.id === product.id && i.selectedColor === selectedColor && i.selectedSize === selectedSize
      );
      if (existing) {
        return prevCart.map(i => 
          i.id === product.id && i.selectedColor === selectedColor && i.selectedSize === selectedSize
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          selectedColor,
          selectedSize,
          quantity: 1,
          image_url: activeImage || product.image_url
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (selectedColor, selectedSize, delta) => {
    setCart(prev => 
      prev.map(i => {
        if (i.id === product.id && i.selectedColor === selectedColor && i.selectedSize === selectedSize) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean)
    );
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !phoneNumber || !address) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert([
        {
          customer_name: customerName,
          phone_number: phoneNumber,
          address: address,
          items: cart,
          total_price: totalPrice,
        }
      ]);
      if (error) throw error;
      setOrderSuccess(true);
      setCart([]);
    } catch (err) {
      alert('خطأ: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setIsCheckout(false);
    setOrderSuccess(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      {/* هيدر الصفحة */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <Link href="/" className="bg-gray-900 hover:bg-gray-800 text-amber-400 font-bold px-4 py-2 rounded-xl border border-gray-800 text-xs">
          ← العودة للمتجر الرئيسي
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="bg-amber-500 text-black font-extrabold px-5 py-2 rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 cursor-pointer">
          <span>🛒 السلة</span>
          <span className="bg-black text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">{totalItems}</span>
        </button>
      </header>

      {/* تفاصيل المنتج والمعرض */}
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gray-900 border border-gray-800 p-6 md:p-10 rounded-3xl shadow-2xl">
          
          {/* قسم المعرض والصور بزوايا مختلفة */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 h-96">
              {activeImage && (
                <img src={activeImage} alt={product.title} className="w-full h-full object-cover transition-all duration-300" />
              )}
            </div>

            {/* صور مصغرة للتبديل بين الزوايا */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img ? 'border-amber-400 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* معلومات المنتج والشراء */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold">
                {product.category || 'تصميم LYNX'}
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-3 mb-2">{product.title}</h1>
              <p className="text-2xl font-black text-amber-400 mb-4">{product.price} ج.م</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 border-t border-gray-800 pt-4">{product.description}</p>

              {/* الألوان */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 mb-2">اختر اللون:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((col, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleColorChange(col)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedColor === col.name
                            ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                            : 'bg-gray-950 text-gray-300 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* المقاسات */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-400 mb-2">اختر المقاس:</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === size
                          ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                          : 'bg-gray-950 text-gray-300 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs mb-2">
                {currentStock > 0 ? (
                  <span className="text-green-400 font-bold">✔ متوفر في المخزون</span>
                ) : (
                  <span className="text-red-400 font-bold">❌ نفذت الكمية لهذا اللون</span>
                )}
              </div>
            </div>

            <button
              onClick={addToCart}
              disabled={currentStock <= 0}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 text-center"
            >
              {currentStock > 0 ? 'إضافة إلى السلة' : 'نفذت الكمية'}
            </button>
          </div>
        </div>

        {/* قسم فيديو إعلان المنتج */}
        {product.video_url && (
          <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span>🎬</span> فيديو استعراض وإعلان المنتج
            </h2>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-gray-800">
              <iframe
                src={getEmbedUrl(product.video_url)}
                title="Product Ad"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>

      {/* Drawer السلة */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-start">
          <div className="bg-gray-900 w-full max-w-md h-full p-6 flex flex-col justify-between border-l border-gray-800 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-amber-400">
                  {orderSuccess ? 'تم الطلب بنجاح!' : isCheckout ? 'تفاصيل شحن الطلب' : 'سلة المشتريات'}
                </h3>
                <button onClick={closeDrawer} className="text-gray-400 hover:text-white font-bold text-2xl">✕</button>
              </div>

              {orderSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h4 className="text-2xl font-bold text-white">شكراً لطلبك من LYNX!</h4>
                  <p className="text-gray-400 text-sm">تم تسجيل طلبك بنجاح وسيتواصل معك الفريق قريباً.</p>
                  <button onClick={closeDrawer} className="mt-6 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-xl">متابعة</button>
                </div>
              ) : isCheckout ? (
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">الاسم بالكامل</label>
                    <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">رقم الهاتف</label>
                    <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">عنوان التوصيل</label>
                    <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white" />
                  </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsCheckout(false)} className="w-1/3 bg-gray-800 text-white font-bold py-3 rounded-xl">الرجوع</button>
                    <button type="submit" disabled={submitting} className="w-2/3 bg-amber-500 text-black font-extrabold py-3 rounded-xl">
                      {submitting ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">السلة فارغة حالياً</p>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                          <div className="flex items-center gap-3">
                            {item.image_url && <img src={item.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" />}
                            <div>
                              <h4 className="font-bold text-white text-sm">{item.title}</h4>
                              <p className="text-xs text-amber-400">اللون: {item.selectedColor} | المقاس: {item.selectedSize}</p>
                              <p className="text-amber-400 font-semibold text-sm">{item.price} ج.م</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-900 px-2 py-1 rounded-lg border border-gray-700">
                            <button onClick={() => updateQuantity(item.selectedColor, item.selectedSize, -1)} className="text-gray-400 px-1 font-bold">-</button>
                            <span className="text-white font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.selectedColor, item.selectedSize, 1)} className="text-gray-400 px-1 font-bold">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="border-t border-gray-800 pt-4 mt-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400 font-bold">الإجمالي:</span>
                        <span className="text-2xl font-extrabold text-amber-400">{totalPrice} ج.م</span>
                      </div>
                      <button onClick={() => setIsCheckout(true)} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl text-lg cursor-pointer">
                        إتمام الطلب
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
