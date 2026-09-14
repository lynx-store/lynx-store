'use client';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-2">لوحة تحكم LYNX</h1>
        <p className="text-neutral-400 mb-8">أهلاً بك، اختر القسم الذي تريد إدارته:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/admin/products" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-white transition">
            <h2 className="text-xl font-bold mb-2">📦 إدارة المنتجات</h2>
            <p className="text-neutral-400 text-sm">إضافة منتجات جديدة، تعديل الأسعار، والتحكم في المخزون.</p>
          </Link>
          
          <Link href="/admin/orders" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-white transition">
            <h2 className="text-xl font-bold mb-2">🛒 إدارة الطلبات</h2>
            <p className="text-neutral-400 text-sm">متابعة طلبات الزبائن وعناوينهم وحالات الشحن.</p>
          </Link>

          <Link href="/admin/inventory" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-white transition">
            <h2 className="text-xl font-bold mb-2">📊 المخزن الرئيسي</h2>
            <p className="text-neutral-400 text-sm">متابعة الكميات والمخزن العام.</p>
          </Link>

          <Link href="/admin/chat" className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-white transition">
            <h2 className="text-xl font-bold mb-2">💬 محادثات الدعم</h2>
            <p className="text-neutral-400 text-sm">الرد على استفسارات العملاء المباشرة.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
