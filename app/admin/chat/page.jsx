'use client';
import Link from 'next/link';
export default function AdminChat() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white mb-6 block">← العودة</Link>
        <h1 className="text-2xl font-black mb-4">محادثات الدعم الفوري</h1>
        <p className="text-neutral-400">الرسائل المباشرة الواردة من عملاء متجر LYNX.</p>
      </div>
    </div>
  );
}
