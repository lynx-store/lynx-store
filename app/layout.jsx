import './globals.css';

export const metadata = {
  title: 'LYNX Store',
  description: 'LYNX E-Commerce Store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
