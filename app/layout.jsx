import './globals.css';
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
        </StoreProvider>
      </body>
    </html>
  );
}
