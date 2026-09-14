'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; // ضبط المسار حسب ملف السوبابيس عندك

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. توليد أو جلب معرف ثانٍ ومستمر لمتصفح العميل (Session ID)
    let sid = localStorage.getItem('lynx_chat_session');
    if (!sid) {
      sid = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('lynx_chat_session', sid);
    }
    setSessionId(sid);

    // 2. جلب المحادثات القديمة للعميل
    fetchMessages(sid);

    // 3. الاستماع في الوقت الفعلي للردود القادمة من الأدمن
    const channel = supabase
      .channel(`chat_realtime_${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sid}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            // منع تكرار الرسالة لو كانت مضافة بالفعل
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  async function fetchMessages(sid) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setMessages(data);
    } else {
      // رسالة الترحيب التلقائية الأولى
      setMessages([
        {
          id: 'welcome',
          sender: 'admin',
          message: 'أهلاً بك في LYNX 🐆 ! تم استلام رسالتك وسنرد عليك في أسرع وقت ممكن.',
        },
      ]);
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const textToSend = inputText;
    setInputText('');

    // إرسال الرسالة إلى جدول Supabase
    const { error } = await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        sender: 'user',
        message: textToSend,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
      alert('حدث خطأ أثناء إرسال الرسالة، حاول مرة أخرى.');
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 font-sans" dir="rtl">
      {/* زر فتح/إغلاق الشات */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm transition-all transform hover:scale-105"
        >
          💬 دعم LYNX المباشر
        </button>
      )}

      {/* نافذة الشات */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-[#0b101d] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* ترويسة النافذة */}
          <div className="bg-[#050811] p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-amber-400 font-black text-sm flex items-center gap-2">
              دعم LYNX المباشر 🐆
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>
          </div>

          {/* منطقة عرض الرسائل */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-black font-bold rounded-tr-none'
                      : 'bg-[#172033] text-white border border-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* نموذج إرسال الرسالة */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#050811] border-t border-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#0b101d] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2 rounded-xl text-xs transition-all"
            >
              إرسال
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
