'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [inputName, setInputName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    let sid = localStorage.getItem('lynx_chat_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('lynx_chat_session_id', sid);
    }
    setSessionId(sid);

    const savedName = localStorage.getItem('lynx_chat_user_name');
    if (savedName) setUserName(savedName);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // الاستماع الفوري للرسائل الجديدة من الأدمن أو المتصفح
    const channel = supabase
      .channel(`chat_room_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    localStorage.setItem('lynx_chat_user_name', inputName.trim());
    setUserName(inputName.trim());
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const textToSend = inputText.trim();
    setInputText('');

    const newMessage = {
      id: Date.now(),
      session_id: sessionId,
      sender: 'user',
      user_name: userName || 'عميل LYNX',
      message: textToSend,
      created_at: new Date().toISOString(),
    };

    // إضافة الرسالة للواجهة فوراً
    setMessages((prev) => [...prev, newMessage]);

    // إرسالها لـ Supabase
    const { error } = await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        sender: 'user',
        user_name: userName || 'عميل LYNX',
        message: textToSend,
      },
    ]);

    if (error) {
      console.error('فشل إرسال الرسالة:', error);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#e5ad35] hover:bg-[#c9952a] text-black font-bold px-4 py-3 rounded-full shadow-lg transition-all duration-300"
        >
          <span className="text-xl">🎧</span>
          <span>الدعم المباشر</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[500px] overflow-hidden text-white">
          <div className="bg-[#1e293b] p-4 flex justify-between items-center border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <h3 className="font-bold text-sm">دعم LYNX المباشر</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-lg px-2">✕</button>
          </div>

          {!userName ? (
            <form onSubmit={handleSaveName} className="p-6 flex flex-col justify-center gap-4 flex-1">
              <p className="text-sm text-slate-300 text-center">مرحباً بك! يرجى إدخال اسمك للبدء بالتحدث مع الدعم:</p>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                className="w-full p-3 bg-[#1e293b] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#e5ad35]"
                required
              />
              <button type="submit" className="w-full bg-[#e5ad35] hover:bg-[#c9952a] text-black font-bold py-3 rounded-lg transition-colors">
                بدء المحادثة
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 mt-8">مرحباً {userName}! كيف يمكننا مساعدتك اليوم؟</p>
                ) : (
                  messages.map((msg, index) => (
                    <div key={msg.id || index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-[#e5ad35] text-black rounded-br-none font-medium' : 'bg-[#1e293b] text-white rounded-bl-none border border-slate-700'}`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.sender === 'user' ? 'أنت' : 'الدعم'}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 bg-[#1e293b] border-t border-slate-700 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 p-2 bg-[#0f172a] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e5ad35]"
                />
                <button type="submit" className="bg-[#e5ad35] hover:bg-[#c9952a] text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors">
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
