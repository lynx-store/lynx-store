export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" dir="rtl">
      {/* شريط التنقل العلوي */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-black tracking-wider">LYNX</span>
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">متجر إلكتروني</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-black transition">الرئيسية</a>
            <a href="#" className="hover:text-black transition">المنتجات</a>
            <a href="#" className="hover:text-black transition">الطلبات</a>
          </nav>
          <div>
            <a 
              href="#products" 
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              تصفح المنتجات
            </a>
          </div>
        </div>
      </header>

      {/* القسم الرئيسي (Hero Section) */}
      <section className="bg-black text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight">
            مرحباً بك في عالم <span className="text-gray-400">LYNX</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
            وجهتك الأولى لأحدث الموضة والملابس العصرية بجودة عالية وتصميم فريد يناسب أسلوب حياتك.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="#products" 
              className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition shadow-lg"
            >
              تسوق الآن
            </a>
          </div>
        </div>
      </section>

      {/* قسم المنتجات */}
      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">أحدث المنتجات</h2>
          <span className="text-sm text-gray-500">عرض الكل</span>
        </div>

        {/* شبكة المنتجات (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* منتج تجريبي 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              صورة المنتج
            </div>
            <div className="p-4">
              <span className="text-xs text-gray-400 font-medium">الملابس</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">تيشيرت LYNX الأساسي</h3>
              <p className="text-black font-semibold mt-2">299 ج.م</p>
              <button className="w-full mt-4 bg-black text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                إضافة للسلة
              </button>
            </div>
          </div>

          {/* منتج تجريبي 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              صورة المنتج
            </div>
            <div className="p-4">
              <span className="text-xs text-gray-400 font-medium">الملابس</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">هودي LYNX الشتوي</h3>
              <p className="text-black font-semibold mt-2">599 ج.م</p>
              <button className="w-full mt-4 bg-black text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                إضافة للسلة
              </button>
            </div>
          </div>

          {/* منتج تجريبي 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              صورة المنتج
            </div>
            <div className="p-4">
              <span className="text-xs text-gray-400 font-medium">الإكسسوارات</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">كاب LYNX كلاسيك</h3>
              <p className="text-black font-semibold mt-2">199 ج.م</p>
              <button className="w-full mt-4 bg-black text-white py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                إضافة للسلة
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* التذييل (Footer) */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        <p>© 2026 LYNX Store. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
