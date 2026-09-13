'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  // تصدير البيانات إلى CSV لشركة الشحن
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,الاسم,الموبايل,المحافظة,العنوان,الاجمالي\n";
    orders.forEach(o => {
      csvContent += `${o.customer_name},${o.phone},${o.governorate},${o.full_address},${o.total_amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lynx_orders.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="bg-[#0D0D0D] text-white min-h-screen p-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-[#C0C0C0]">لوحة تحكم LYNX - الطلبات</h1>
        <button onClick={exportToCSV} className="bg-[#C0C0C0] text-black font-bold px-4 py-2 rounded hover:bg-white transition">
          تصدير إلى Excel/CSV
        </button>
      </div>

      <table className="w-full text-left border-collapse border border-gray-800">
        <thead>
          <tr className="bg-[#181818] text-[#C0C0C0]">
            <th className="p-3 border border-gray-800">الاسم</th>
            <th className="p-3 border border-gray-800">الموبايل</th>
            <th className="p-3 border border-gray-800">المحافظة والعنوان</th>
            <th className="p-3 border border-gray-800">الإجمالي</th>
            <th className="p-3 border border-gray-800">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border border-gray-800 hover:bg-[#141414]">
              <td className="p-3">{o.customer_name}</td>
              <td className="p-3">{o.phone}</td>
              <td className="p-3">{o.governorate} - {o.full_address}</td>
              <td className="p-3">{o.total_amount} EGP</td>
              <td className="p-3 font-semibold text-[#C0C0C0]">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
