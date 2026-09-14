'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase'; // تعديل المسار حسب مكان ملف سوبابيس عندك

export default function AdminChatPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();

    // الاستماع في الوقت الفعلي لأي رسالة جديدة من أي عميل
    const channel = supabase
      .channel('admin_global_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;

          setSelectedSessionId((activeSid) => {
            if (activeSid === newMsg.session_id) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
            return activeSid;
          });

          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // جلب الجلسات وتجميعها حسب العملاء بالاسم
  async function fetchSessions() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('خطأ في جلب البيانات:', error);
      setLoading(false);
      return;
    }

    if (data) {
      const sessionMap = new Map();
      data.forEach((item) => {
        const key = item.session_id || item.user_phone || item.user_name;
        if (key && !sessionMap.has(key)) {
          sessionMap.set(key, item);
        }
      });
      setSessions(Array.from(sessionMap.values()));
    }
    setLoading(false);
  }

  // اختيار عميل وتكبير محادثته
  async function selectClient(sess) {
    const sid = sess.session_id || sess.user_phone;
    setSelectedSessionId(sid);
    setSelectedUserName(sess.user_name || sess.user_phone || 'عميل');

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`session_id.eq.${sid},user_phone.eq.${sid}`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  }

  // إرسال الرد للعميل
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId) return;

    const text = replyText.trim();
    setReplyText('');

    const tempId = Date.now();
    const tempMsg = {
      id: tempId,
      session_id: selectedSessionId,
      user_name: selectedUserName,
      sender: 'admin',
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: selectedSessionId,
          user_name: selectedUserName,
          sender: 'admin',
          message: text,
        },
      ])
      .select();

    if (error) {
      alert('تعذر إرسال الرد: ' + error.message);
    } else if (data && data.length > 0) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data[0] : m)));
      fetchSessions();
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-white" dir="rtl">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
          🎧 محادثات الدعم المباشر (LYNX Chat)
        </h1>
        <button
          onClick={fetchSessions}
          className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-2 rounded-xl border border-gray-700"
        >
          تحديث 🔄
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh] bg-[#0b101d] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* قائمة المحادثات الجانبية */}
        <div className="border-l border-gray-800 p-4 space-y-2 overflow-y-auto bg-[#050811]">
          <h2 className="text-xs font-bold text-gray-400 mb-3">المحادثات النشطة ({sessions.length})</h2>
          
          {loading ? (
            <p className="text-xs text-amber-400 text-center py-8">جاري التحميل...</p>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">لا توجد محادثات حتى الآن</p>
          ) : (
            sessions.map((sess) => {
              const sid = sess.session_id || sess.user_phone;
              const isSelected = selectedSessionId === sid;
              const displayName = sess.user_name || sess.user_phone || 'عميل جديد';

              return (
                <button
                  key={sid}
                  onClick={() => selectClient(sess)}
                  className={`w-full text-right p-3 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-[#0b101d] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold truncate">👤 {displayName}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(sess.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {sess.sender === 'admin' ? 'أنت: ' : ''}{sess.message}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* منطقة المحادثة الردود */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 bg-[#0b101d]">
          {selectedSessionId ? (
            <>
              <div className="border-b border-gray-800 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">محادثة مع: {selectedUserName}</h3>
                  <p className="text-[10px] text-emerald-400 font-bold">متصل 🟢</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 px-2 mb-4">
                {messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                          isAdmin
                            ? 'bg-amber-500 text-black font-bold rounded-tr-none'
                            : 'bg-[#172033] text-white border border-gray-800 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[9px] text-gray-500 mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

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
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-xl text-xs transition-all"
                >
                  إرسال
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-2">🎧</span>
              <p className="text-xs">اختر عميلاً من القائمة للبدء في الرد عليه</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
