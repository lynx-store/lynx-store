import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';

export const metadata = {
  title: 'LYNX | Streetwear & Fashion Store',
  description: 'المتجر الرسمي لعلامة LYNX للملابس العصرية والستريت وير عالية الجودة.',
  keywords: ['LYNX', 'ملابس', 'هوديز', 'تيشيرتات', 'كابات', 'ستريت وير', 'مصر'],
  openGraph: {
    title: 'LYNX | Streetwear & Fashion',
    description: 'تسوق أحدث تشكيلة من الهوديز والتيشيرتات العصرية من LYNX.',
    url: 'https://lynx-store-lynx-store.vercel.app',
    siteName: 'LYNX Store',
    images: [
      {
        url: 'https://lynx-store-lynx-store.vercel.app/og-image.png', // صورة المعاينة الافتراضية
        width: 1200,
        height: 630,
        alt: 'LYNX Streetwear Store',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LYNX | Streetwear & Fashion',
    description: 'تسوق أحدث تشكيلة من الهوديز والتيشيرتات العصرية من LYNX.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-950 text-white font-sans antialiased selection:bg-amber-500 selection:text-black">
        <StoreProvider>
          <Navbar />
          <CartDrawer />
          <div className="pt-20">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
