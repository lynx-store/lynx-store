'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase'; // تعديل المسار حسب مكان ملف supabase عندك

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. تهيئة المتصفح ومنع مشاكل الـ Hydration في Next.js
  useEffect(() => {
    setIsMounted(true);
    let sid = localStorage.getItem('lynx_chat_id');
    if (!sid) {
      sid = 'client_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('lynx_chat_id', sid);
    }
    setSessionId(sid);
  }, []);

  // 2. تحميل الرسائل السابقة والتسمع على الرسائل الجديدة
  useEffect(() => {
    if (!sessionId) return;

    // جلب الأرشيف للعميل
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // رسالة ترحيب أولية
        setMessages([
          {
            id: 'welcome',
            session_id: sessionId,
            sender: 'admin',
            message: 'أهلاً بك في LYNX 🐆! أترك رسالتك وسيرد عليك الفريق فوراً.',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    };

    loadMessages();

    // الاشتراك في التحديثات الفورية (Realtime)
    const channel = supabase
      .channel(`chat_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            // منع التكرار لو كانت الرسالة مضافة محلياً
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // التمرير التلقائي لآخر رسالة
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // إرسال الرسالة
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const text = inputText.trim();
    setInputText('');

    // تحديث متفائل للواجهة فوري قبل انتظار السيرفر
    const tempId = Date.now();
    const tempMsg = {
      id: tempId,
      session_id: sessionId,
      sender: 'user',
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    // الإرسال لقاعدة البيانات
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionId,
          sender: 'user',
          message: text,
        },
      ])
      .select();

    if (error) {
      console.error('فشل إرسال الرسالة:', error);
      alert('تعذر إرسال الرسالة، يرجى التأكد من الاتصال بالإنترنت.');
    } else if (data && data.length > 0) {
      // استبدال المؤقت بالرسالة الحقيقية من الداتا بيز
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data[0] : m)));
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 font-sans" dir="rtl">
      {/* زر الفتح */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 text-sm transition-all transform hover:scale-105"
        >
          <span>💬</span>
          <span>دعم LYNX المباشر</span>
        </button>
      )}

      {/* نافذة الشات */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-[#0b101d] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* الترويسة */}
          <div className="bg-[#050811] p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <h3 className="text-amber-400 font-black text-sm">دعم LYNX المباشر 🐆</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white font-bold text-base p-1"
            >
              ✕
            </button>
          </div>

          {/* الرسائل */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b101d]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-amber-500 text-black font-bold rounded-tr-none shadow-md'
                        : 'bg-[#172033] text-white border border-gray-800 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* إدخال النص */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#050811] border-t border-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="اكتب رسالتك هنا..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#0b101d] border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all"
            >
              إرسال
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
