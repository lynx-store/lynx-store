'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';// تعديل المسار حسب مكان ملف سوبابيس عندك

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. تهيئة بيانات المتصفح (الاسم والجلسة)
  useEffect(() => {
    setIsMounted(true);

    let sid = localStorage.getItem('lynx_chat_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('lynx_chat_session_id', sid);
    }
    setSessionId(sid);

    const savedName = localStorage.getItem('lynx_chat_user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // 2. تحميل المحادثة والاستماع الفوري
  useEffect(() => {
    if (!sessionId || !userName) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            id: 'welcome',
            sender: 'admin',
            message: `أهلاً بك يا ${userName} في LYNX 🐆! كيف يمكننا مساعدتك اليوم؟`,
          },
        ]);
      }
    };

    fetchHistory();

    // الاشتراك في التحديثات الفورية
    const channel = supabase
      .channel(`chat_realtime_${sessionId}`)
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
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, userName]);

  // التمرير الفوري للأسفل
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, userName]);

  // حفظ اسم العميل
  const handleSaveName = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const name = inputName.trim();
    setUserName(name);
    localStorage.setItem('lynx_chat_user_name', name);
  };

  // إرسال رسالة العميل
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId || !userName) return;

    const text = inputText.trim();
    setInputText('');

    const tempId = Date.now();
    const tempMsg = {
      id: tempId,
      session_id: sessionId,
      user_name: userName,
      sender: 'user',
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionId,
          user_name: userName,
          sender: 'user',
          message: text,
        },
      ])
      .select();

    if (error) {
      console.error('Error sending message:', error);
    } else if (data && data.length > 0) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data[0] : m)));
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans" dir="rtl">
      {/* أيقونة الدعم العائمة */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-110 active:scale-95 border-2 border-black/20"
          title="الدردشة مع الدعم"
        >
          <span className="text-2xl">🎧</span>
          <span className="font-extrabold text-xs hidden sm:inline">الدردشة مع الدعم</span>
        </button>
      )}

      {/* نافذة الشات */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-[#0b101d] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* الترويسة */}
          <div className="bg-[#050811] p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎧</span>
              <div>
                <h3 className="text-amber-400 font-black text-xs">الدعم المباشر LYNX</h3>
                {userName && <p className="text-[10px] text-gray-400">أهلاً {userName}</p>}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white font-bold text-lg p-1"
            >
              ✕
            </button>
          </div>

          {/* خطوة 1: أدخل اسمك إذا لم يسبق إدخاله */}
          {!userName ? (
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4">
              <span className="text-4xl">👋</span>
              <h4 className="text-white font-bold text-sm">مرحباً بك في خدمة العملاء</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                من فضلك ادخل اسمك للبدء في المحادثة مع فريق الدعم
              </p>

              <form onSubmit={handleSaveName} className="w-full space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="اسمك الكريم..."
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full bg-[#050811] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 text-center"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 rounded-xl text-xs transition-all shadow-lg"
                >
                  بدء المحادثة 🚀
                </button>
              </form>
            </div>
          ) : (
            /* خطوة 2: شاشة المحادثة */
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b101d]">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id || index}
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

              {/* نموذج كتابة الرسالة */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#050811] border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب مشكلتك أو استفسارك..."
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
            </>
          )}

        </div>
      )}
    </div>
  );
}
