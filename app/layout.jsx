import './globals.css';
import ChatWidget from '../components/ChatWidget'; // عدّل المسار إذا كان ملف الشات في مكان آخر (مثلاً: '@/components/ChatWidget')

export const metadata = {
  title: 'LYNX Streetwear | المتجر الرسمي',
  description: 'تشكيلة ملابس LYNX الجديدة - أزياء رجالية عصرية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050811] text-white min-h-screen antialiased">
        {/* محتوى الصفحات */}
        {children}

        {/* أيقونة الشات العائمة المباشرة للعميل */}
        <ChatWidget />
      </body>
    </html>
  );
}
