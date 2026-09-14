import './globals.css';
import dynamic from 'next/dynamic';
import { StoreProvider } from '../context/StoreContext';

// تحميل الشات ديناميكياً على متصفح العميل فقط
const ChatWidget = dynamic(() => import('../components/ChatWidget'), {
  ssr: false,
});

export const metadata = {
  title: 'LYNX Streetwear | المتجر الرسمي',
  description: 'تشكيلة ملابس LYNX الجديدة - أزياء رجالية عصرية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050811] text-white min-h-screen antialiased">
        <StoreProvider>
          {children}
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
