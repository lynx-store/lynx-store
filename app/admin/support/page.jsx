'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminSupportPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  // جلب المحادثات وتجميعها حسب العملاء
  const fetchSessions = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const uniqueSessions = [];
      const map = new Map();
      for (const item of data) {
        if (!map.has(item.session_id)) {
          map.set(item.session_id, true);
          uniqueSessions.push({
            session_id: item.session_id,
            user_name: item.user_name || 'عميل',
            last_message: item.message,
            created_at: item.created_at,
          });
        }
      }
      setSessions(uniqueSessions);
      if (!activeSessionId && uniqueSessions.length > 0) {
        setActiveSessionId(uniqueSessions[0].session_id);
      }
    }
  };

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel('admin_global_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // جلب رسائل المحادثة المحددة
  useEffect(() => {
    if (!activeSessionId) return;

    const fetchCurrentMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    };

    fetchCurrentMessages();

    const channel = supabase
      .channel(`admin_room_${activeSessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSessionId}` },
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
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // إرسال رد من الأدمن
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSessionId) return;

    const text = replyText.trim();
    setReplyText('');

    const newReply = {
      id: Date.now(),
      session_id: activeSessionId,
      sender: 'admin',
      user_name: 'الدعم الفني',
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newReply]);

    await supabase.from('chat_messages').insert([
      {
        session_id: activeSessionId,
        sender: 'admin',
        user_name: 'الدعم الفني',
        message: text,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex gap-6" dir="rtl">
      {/* قائمة العملاء */}
      <div className="w-1/3 bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
        <h2 className="font-black text-amber-400 text-lg border-b border-gray-800 pb-3">محادثات الدعم</h2>
        <div className="space-y-2 overflow-y-auto max-h-[80vh]">
          {sessions.map((s) => (
            <div
              key={s.session_id}
              onClick={() => setActiveSessionId(s.session_id)}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                activeSessionId === s.session_id ? 'bg-amber-500/10 border-amber-500' : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="font-bold text-sm text-white">{s.user_name}</div>
              <div className="text-xs text-gray-400 truncate">{s.last_message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* نافذة الشات النشطة */}
      <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col h-[85vh]">
        {activeSessionId ? (
          <>
            <div className="p-4 border-b border-gray-800 font-bold text-amber-400">
              المحادثة الحالية: {sessions.find((s) => s.session_id === activeSessionId)?.user_name}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div key={m.id || idx} className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${m.sender === 'admin' ? 'bg-amber-500 text-black font-medium' : 'bg-gray-900 text-white border border-gray-800'}`}>
                    {m.message}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 px-1">{m.sender === 'admin' ? 'أنت (الدعم)' : m.user_name}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendReply} className="p-4 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب الرد هنا..."
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl text-sm transition-all">
                إرسال الرد
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">اختر محادثة للبدء في الرد.</div>
        )}
      </div>
    </div>
  );
}
