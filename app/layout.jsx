import './globals.css';

export const metadata = {
  title: 'LYNX Store',
  description: 'متجر LYNX الإلكتروني',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
