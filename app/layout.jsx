import './globals.css';
import ChatWidget from '../components/ChatWidget';
import { CartProvider } from '../context/CartContext'; // تأكد من اسم ومسار ملف CartContext لديك
import { WishlistProvider } from '../context/WishlistContext'; // تأكد من اسم ومسار ملف WishlistContext لديك

export const metadata = {
  title: 'LYNX Streetwear | المتجر الرسمي',
  description: 'تشكيلة ملابس LYNX الجديدة - أزياء رجالية عصرية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050811] text-white min-h-screen antialiased">
        <CartProvider>
          <WishlistProvider>
            {/* محتوى الصفحات */}
            {children}

            {/* أيقونة الشات العائمة المباشرة */}
            <ChatWidget />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
