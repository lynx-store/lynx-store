import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';

export const metadata = {
  title: 'LYNX | Streetwear & Fashion',
  description: 'المتجر الرسمي لعلامة LYNX للملابس العصرية',
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
