'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [phone, setPhone] = useState('');
  const [isPhoneSubmitted, setIsPhoneSubmitted] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('lynx_chat_phone');
    if (savedPhone) {
      setPhone(savedPhone);
      setIsPhoneSubmitted(true);
      fetchMessages(savedPhone);
    }
  }, []);

  const fetchMessages = async (userPhone) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_phone', userPhone)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const handleStartChat = (e) => {
    e.preventDefault();
    if (!phone) return;
    localStorage.setItem('lynx_chat_phone', phone);
    setIsPhoneSubmitted(true);
    fetchMessages(phone);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');

    // 1. حفظ رسالة العميل
    const newMsg = { sender: 'user', user_phone: phone, message: userText };
    setMessages((prev) => [...prev, newMsg]);

    await supabase.from('chat_messages').insert([newMsg]);

    // 2. فحص إذا كانت هذه أول رسالة لإرسال الرد الآلي
    if (messages.length === 0) {
      setTimeout(async () => {
        const autoReply = {
          sender: 'admin',
          user_phone: phone,
          message: 'أهلاً بك في LYNX 🐆! تم استلام رسالتك وسنرد عليك في أسرع وقت ممكن.',
        };
        setMessages((prev) => [...prev, autoReply]);
        await supabase.from('chat_messages').insert([autoReply]);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 dir-rtl">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>💬</span> تواصل معنا
        </button>
      ) : (
        <div className="bg-gray-900 border border-gray-800 w-80 sm:w-96 rounded-3xl shadow-2xl flex flex-col overflow-hidden h-[450px]">
          {/* Header */}
          <div className="bg-gray-950 p-4 border-b border-gray-800 flex justify-between items-center">
            <span className="font-bold text-amber-400 text-sm">دعم LYNX المباشر 🐆</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
          </div>

          {/* Body */}
          {!isPhoneSubmitted ? (
            <form onSubmit={handleStartChat} className="p-6 space-y-4 my-auto">
              <p className="text-xs text-gray-300 font-bold text-center">أدخل رقم هاتفك لبدء المحادثة معنا:</p>
              <input
                type="tel"
                required
                placeholder="010XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl text-xs">
                بدء المحادثة 🚀
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-black font-semibold mr-auto rounded-br-none'
                        : 'bg-gray-800 text-white ml-auto rounded-bl-none border border-gray-700'
                    }`}
                  >
                    {m.message}
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-3 bg-gray-950 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالتك..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button type="submit" className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs">
                  إرسال
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
