'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('id', { ascending: false });
    setOrders(data || []);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white mb-6 block">← العودة للوحة التحكم</Link>
        <h1 className="text-2xl font-black mb-6">طلبات الزبائن</h1>

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">طلب #{order.id} - {order.customer_name}</span>
                <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold">{order.total_price} ج.م</span>
              </div>
              <p className="text-sm text-neutral-400">الهاتف: {order.phone} | المحافظة: {order.governorate}</p>
              <p className="text-sm text-neutral-300">العنوان: {order.address_details}</p>
              <div className="border-t border-neutral-800 pt-3 text-xs text-neutral-400">
                المنتجات المطلوبة: {order.items?.map(i => `${i.title} (${i.quantity})`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
