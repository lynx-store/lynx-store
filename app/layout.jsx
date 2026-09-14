import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'LYNX Streetwear | المتجر الرسمي',
  description: 'تشكيلة ملابس LYNX الجديدة - أزياء رجالية عصرية',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#050811] text-white min-h-screen antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
