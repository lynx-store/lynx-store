'use client';

import './globals.css';
import ChatWidget from '../components/ChatWidget';
import { StoreProvider } from '../context/StoreContext';

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050811] text-white min-h-screen antialiased">
        <StoreProvider>
          {/* محتوى الصفحات */}
          {children}

          {/* أيقونة الشات العائمة المباشرة للعميل */}
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
