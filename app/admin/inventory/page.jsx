'use client';
import Link from 'next/link';
export default function AdminInventory() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white mb-6 block">← العودة</Link>
        <h1 className="text-2xl font-black mb-4">المخزن الرئيسي</h1>
        <p className="text-neutral-400">هنا يمكنك متابعة حركة مخزون المنتجات والألوان المتاحة.</p>
      </div>
    </div>
  );
}
