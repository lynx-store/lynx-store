import './globals.css';
import { StoreProvider } from '../context/StoreContext';

export const metadata = {
  title: 'LYNX | البراند الفاخر',
  description: 'متجر LYNX للأزياء والموضة',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-black text-white antialiased">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
