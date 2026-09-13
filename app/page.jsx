'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالات السلة ونافذة الشراء
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  // بيانات نموذج المشتري
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
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

  // إرسال الطلب لقاعدة البيانات
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
      alert('حدث خطأ أثناء إرسال الطلب: ' + err.message);
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
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-amber-400 tracking-wider">LYNX</h1>
          <span className="text-xs text-green-400 font-bold">✔ ONLINE STORE</span>
        </div>
        
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-amber-500 text-black font-extrabold px-5 py-2 rounded-xl hover:bg-amber-400 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>🛒 السلة</span>
          <span className="bg-black text-amber-400 text-xs px-2 py-0.5 rounded-full font-black">
            {totalItems}
          </span>
        </button>
      </header>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-gray-200">المنتجات المتاحة</h2>

        {loading && <div className="text-center py-12 text-gray-400">جاري تحميل المنتجات...</div>}

        {error && (
          <p className="text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-800">
            حدث خطأ: {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                {product.image_url && (
                  <img src={product.image_url} alt={product.title} className="w-full h-56 object-cover" />
                )}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-amber-400 font-semibold uppercase">{product.category}</span>
                    <h3 className="text-xl font-bold mt-1 mb-2 text-white">{product.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <span className="text-2xl font-extrabold text-amber-400">{product.price} ج.م</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      إضافة للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-start">
          <div className="bg-gray-900 w-full max-w-md h-full p-6 flex flex-col justify-between border-l border-gray-800 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-amber-400">
                  {orderSuccess ? 'تم الطلب بنجاح!' : isCheckout ? 'تفاصيل شحن الطلب' : 'سلة المشتريات'}
                </h3>
                <button onClick={closeDrawer} className="text-gray-400 hover:text-white font-bold text-2xl">
                  ✕
                </button>
              </div>

              {/* نجاح إرسال الطلب */}
              {orderSuccess ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-6xl">🎉</div>
                  <h4 className="text-2xl font-bold text-white">شكراً لطلبك من LYNX!</h4>
                  <p className="text-gray-400 text-sm">تم تسجيل طلبك بنجاح وسيتواصل معك الفريق قريباً لتأكيد الشحن.</p>
                  <button
                    onClick={closeDrawer}
                    className="mt-6 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-xl transition-all"
                  >
                    متابعة التسوق
                  </button>
                </div>
              ) : isCheckout ? (
                /* نموذج بيانات العميل */
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">الاسم بالكامل</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: عبد الرحيم محمد"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="010xxxxxxxx"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">عنوان التوصيل التفصيلي</label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="المحافظة - المدينة - اسم الشارع - رقم المبنى"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2 mt-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>إجمالي المنتجات:</span>
                      <span>{totalPrice} ج.م</span>
                    </div>
                    <div className="flex justify-between font-bold text-amber-400 text-lg border-t border-gray-800 pt-2">
                      <span>المبلغ الإجمالي:</span>
                      <span>{totalPrice} ج.م</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCheckout(false)}
                      className="w-1/3 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      الرجوع
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-2/3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                      {submitting ? 'جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
                    </button>
                  </div>
                </form>
              ) : (
                /* عرض عناصر السلة */
                <>
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">السلة فارغة حالياً</p>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
                          <div>
                            <h4 className="font-bold text-white">{item.title}</h4>
                            <p className="text-amber-400 font-semibold text-sm">{item.price} ج.م</p>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
                            <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white font-bold text-lg">-</button>
                            <span className="text-white font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white font-bold text-lg">+</button>
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
                      <button
                        onClick={() => setIsCheckout(true)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl transition-all text-lg cursor-pointer"
                      >
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
