'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminChatPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatSessions();

    // الاستماع للرسائل الجديدة في الوقت الفعلي (Realtime)
    const subscription = supabase
      .channel('admin_chat_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;
          // إذا كانت الرسالة للجلسة المحددة حالياً
          if (selectedSession && newMsg.session_id === selectedSession) {
            setMessages((prev) => [...prev, newMsg]);
          }
          // تحديث قائمة المحادثات الجانبية
          fetchChatSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedSession]);

  // التمرير لأسفل عند وصول رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // جلب قائمة الجلسات/العملاء الذين تواصلوا معك
  async function fetchChatSessions() {
    const { data } = await supabase
      .from('chat_messages')
      .select('session_id, created_at, message')
      .order('created_at', { ascending: false });

    if (data) {
      // تجميع الرسائل حسب session_id للحصول على أحدث محادثة لكل عميل
      const uniqueSessions = [];
      const map = new Map();
      for (const item of data) {
        if (!map.has(item.session_id)) {
          map.set(item.session_id, true);
          uniqueSessions.push(item);
        }
      }
      setSessions(uniqueSessions);
    }
  }

  // جلب جميع رسائل العميل المحدد
  async function loadMessages(sessionId) {
    setSelectedSession(sessionId);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }

  // إرسال رد الأدمن إلى العميل
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSession) return;

    const textToSend = replyText;
    setReplyText('');

    const { error } = await supabase.from('chat_messages').insert([
      {
        session_id: selectedSession,
        sender: 'admin',
        message: textToSend,
      },
    ]);

    if (error) {
      alert('حدث خطأ أثناء إرسال الرد: ' + error.message);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 text-white font-sans" dir="rtl">
      <h1 className="text-2xl font-black mb-6 text-amber-400 border-b border-gray-800 pb-3">
        محادثات الدعم المباشر (LYNX Chat) 💬
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh] bg-[#0b101d] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* القائمة الجانبية للعملاء */}
        <div className="border-l border-gray-800 p-4 space-y-2 overflow-y-auto bg-[#050811]">
          <h2 className="text-xs font-bold text-gray-400 mb-3">المحادثات النشطة ({sessions.length})</h2>
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">لا توجد محادثات حتى الآن</p>
          ) : (
            sessions.map((sess) => (
              <button
                key={sess.session_id}
                onClick={() => loadMessages(sess.session_id)}
                className={`w-full text-right p-3 rounded-2xl transition-all border ${
                  selectedSession === sess.session_id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-[#0b101d] border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold truncate">عميل #{sess.session_id.slice(-6)}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(sess.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">{sess.message}</p>
              </button>
            ))
          )}
        </div>

        {/* منطقة المحادثة الحالية والرد */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 bg-[#0b101d]">
          {selectedSession ? (
            <>
              {/* ترويسة الشات */}
              <div className="border-b border-gray-800 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">محادثة العميل #{selectedSession.slice(-6)}</h3>
                  <p className="text-[10px] text-amber-400">متصل الآن 🟢</p>
                </div>
              </div>

              {/* قائمة الرسائل */}
              <div className="flex-1 overflow-y-auto space-y-3 px-2 mb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'admin' ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                        msg.sender === 'admin'
                          ? 'bg-amber-500 text-black rounded-tr-none font-bold'
                          : 'bg-[#172033] text-white border border-gray-800 rounded-tl-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-gray-500 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* نموذج كتابة الرد */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب ردك للعميل..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#050811] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-3 rounded-xl text-xs transition-all"
                >
                  إرسال
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-2">💬</span>
              <p className="text-xs">اختر محادثة من القائمة الجانبية للبدء في الرد على العميل</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
