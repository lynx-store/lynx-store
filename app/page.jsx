'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // تتبع الاختيارات لكل منتج (اللون والمقاس)
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data || []);
        
        const initialColors = {};
        const initialSizes = {};
        data?.forEach(p => {
          if (p.colors && p.colors.length > 0) {
            initialColors[p.id] = p.colors[0].name;
            if (p.colors[0].sizes && p.colors[0].sizes.length > 0) {
              initialSizes[p.id] = p.colors[0].sizes[0];
            }
          }
        });
        setSelectedColors(initialColors);
        setSelectedSizes(initialSizes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleColorSelect = (productId, colorObj) => {
    setSelectedColors(prev => ({ ...prev, [productId]: colorObj.name }));
    if (colorObj.sizes && colorObj.sizes.length > 0) {
      setSelectedSizes(prev => ({ ...prev, [productId]: colorObj.sizes[0] }));
    }
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const addToCart = (product) => {
    const chosenColor = selectedColors[product.id] || (product.colors?.[0]?.name ?? 'افتراضي');
    const chosenSize = selectedSizes[product.id] || 'M';
    
    const colorObj = product.colors?.find(c => c.name === chosenColor);
    const stock = colorObj ? colorObj.stock : 10;

    if (stock <= 0) {
      alert('عذراً، هذا اللون غير متوفر حالياً في المخزن.');
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
      );
      if (existingItem) {
        if (existingItem.quantity >= stock) {
          alert('لقد وصلت للحد الأقصى المتوفر من هذا المنتج.');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...product,
          selectedColor: chosenColor,
          selectedSize: chosenSize,
          quantity: 1,
          image_url: colorObj?.image || product.image_url
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, selectedColor, selectedSize, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id && item.selectedColor === selectedColor && item.selectedSize === selectedSize) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !phoneNumber || !address) {
      alert('يرجى ملء جميع البيانات المطلوبة');
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
        },
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
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-amber-400 tracking-wider">LYNX</h1>
          <span className="text-xs text-green-400 font-bold">✔ ONLINE STORE</span>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-amber-500 text-black font-extrabold px-5 py-2 rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 cursor-pointer">
          <span>🛒 السلة</span>
          <span className="bg-black text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">{totalItems}</span>
        </button>
      </header>

      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-gray-200">تشكيلة المنتجات</h2>

        {loading && <div className="text-center py-12 text-gray-400">جاري التحميل...</div>}
        {error && <p className="text-red-400">خطأ: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => {
              const activeColorName = selectedColors[product.id] || product.colors?.[0]?.name;
              const activeColorObj = product.colors?.find(c => c.name === activeColorName) || product.colors?.[0];
              
              // الصورة: لو اللون ليه صورة خاصة بتظهر، لو ملوش بتظهر صورة المنتج الأساسية
              const displayImage = activeColorObj?.image && activeColorObj.image.trim() !== '' 
                ? activeColorObj.image 
                : product.image_url;

              const currentStock = activeColorObj ? activeColorObj.stock : 10;
              const availableSizes = activeColorObj?.sizes || ['M', 'L', 'XL', '2XL'];
              const activeSize = selectedSizes[product.id] || availableSizes[0];

              return (
                <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                  {displayImage && (
                    <img src={displayImage} alt={product.title} className="w-full h-64 object-cover transition-all duration-300" />
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-semibold uppercase">{product.category}</span>
                      <h3 className="text-xl font-bold mt-1 mb-2 text-white">{product.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                      {/* اختيار الألوان */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-gray-300 mb-1.5">اللون:</label>
                          <div className="flex flex-wrap gap-2">
                            {product.colors.map((col, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleColorSelect(product.id, col)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                                  activeColorName === col.name
                                    ? 'bg-amber-500 text-black border-amber-400'
                                    : 'bg-gray-950 text-gray-300 border-gray-800 hover:border-gray-600'
                                }`}
                              >
                                {col.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* اختيار المقاسات */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">المقاس:</label>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => handleSizeSelect(product.id, size)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                                activeSize === size
                                  ? 'bg-amber-500 text-black border-amber-400'
                                  : 'bg-gray-950 text-gray-300 border-gray-800 hover:border-gray-600'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* حالة التوفر (بدون إظهار عدد القطع) */}
                      <div className="mb-2 text-xs">
                        {currentStock > 0 ? (
                          <span className="text-green-400 font-semibold">✔ متوفر</span>
                        ) : (
                          <span className="text-red-400 font-bold">❌ غير متوفر حالياً</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                      <span className="text-2xl font-extrabold text-amber-400">{product.price} ج.م</span>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={currentStock <= 0}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        {currentStock > 0 ? 'إضافة للسلة' : 'نفذت الكمية'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Drawer */}
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
                  <button onClick={closeDrawer} className="mt-6 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-xl">متابعة التسوق</button>
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
                            <button onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, -1)} className="text-gray-400 px-1 font-bold">-</button>
                            <span className="text-white font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, 1)} className="text-gray-400 px-1 font-bold">+</button>
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
