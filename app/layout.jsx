import './globals.css';
import ChatWidget from '../components/ChatWidget';
import { StoreProvider } from '../context/StoreContext';

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
