'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'تيشرتات', price: '', image_url: '', is_offer: false });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts(data || []);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([form]);
    if (error) alert(error.message);
    else {
      setForm({ title: '', category: 'تيشرتات', price: '', image_url: '', is_offer: false });
      fetchProducts();
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-neutral-400 hover:text-white mb-6 block">← العودة للوحة التحكم</Link>
        <h1 className="text-2xl font-black mb-6">إدارة المنتجات</h1>

        <form onSubmit={addProduct} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-4 mb-8">
          <h2 className="font-bold text-lg">إضافة منتج جديد</h2>
          <input type="text" placeholder="اسم المنتج" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-white" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="السعر" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-white" />
            <input type="text" placeholder="رابط الصورة (URL)" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} required className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-white" />
          </div>
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-xl">إضافة المنتج</button>
        </form>

        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <h4 className="font-bold">{p.title}</h4>
                  <p className="text-sm text-neutral-400">{p.price} ج.م</p>
                </div>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="text-red-500 text-sm font-bold">حذف</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
