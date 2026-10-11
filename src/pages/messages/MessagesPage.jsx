import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  Check,
  CheckCheck,
  User,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../../components/common/Avatar';
import api from '../../api/client';

export default function MessagesPage() {
  const { user } = useAuth();
  const socket = useSocket();
  const [searchParams] = useSearchParams();
  const targetConvId = searchParams.get('conversationId');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.conversations && res.conversations.length > 0) {
        setConversations(res.conversations);
        if (targetConvId) {
          const matched = res.conversations.find(c => c._id === targetConvId || c.id === targetConvId);
          setActiveConv(matched || res.conversations[0]);
          setShowMobileChat(true);
        } else {
          setActiveConv(res.conversations[0]);
        }
      } else {
        const mentorRes = await api.get('/mentorship/mentors');
        if (mentorRes.mentors && mentorRes.mentors[0]) {
          const starter = await api.post('/messages/conversations/start', {
            recipientId: mentorRes.mentors[0].id
          });
          if (starter.conversation) {
            setConversations([starter.conversation]);
            setActiveConv(starter.conversation);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConv) {
      const convId = activeConv._id || activeConv.id;
      fetchMessages(convId);
      if (socket) {
        socket.emit('join_conversation', convId);
      }
    }
  }, [activeConv]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const activeId = activeConv?._id || activeConv?.id;
      if (msg.conversationId === activeId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/messages/conversations/${convId}`);
      if (res.messages) setMessages(res.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    const convId = activeConv._id || activeConv.id;
    const otherParticipant = activeConv.participants?.find(p => (p._id || p.id || p) !== user?.id);
    const receiverId = otherParticipant?._id || otherParticipant?.id || otherParticipant;

    const content = inputMessage.trim();
    setInputMessage('');

    try {
      const res = await api.post('/messages', {
        conversationId: convId,
        receiverId,
        content
      });

      if (res.message) {
        setMessages(prev => [...prev, res.message]);
        if (socket) {
          socket.emit('send_message', res.message);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    }
  };

  const getOtherUser = (conv) => {
    if (!conv?.participants) return { name: 'Alumni Mentor' };
    const other = conv.participants.find(p => (p._id || p.id || p) !== user?.id);
    return other || { name: 'Priya Sharma' };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden h-[calc(100vh-170px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Left Sidebar: Conversations List (Hidden on mobile when chat is active) */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col shrink-0 ${
        showMobileChat ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Messages & Network</h2>
            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              Live Real-Time
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No conversations yet. Connect with a mentor to start chatting!
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              const isSelected = (activeConv?._id || activeConv?.id) === (conv._id || conv.id);

              return (
                <div
                  key={conv._id || conv.id}
                  onClick={() => {
                    setActiveConv(conv);
                    setShowMobileChat(true);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected ? 'bg-blue-50/80 border border-blue-100 shadow-xs' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar name={other.name} size="md" />
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white absolute -bottom-0.5 -right-0.5"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{other.name}</h4>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage || 'Say hello...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Window: Active Chat (Visible on desktop or when mobile chat is toggled) */}
      <div className={`flex-1 flex-col min-w-0 h-full bg-slate-50/40 ${
        showMobileChat ? 'flex' : 'hidden md:flex'
      }`}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Back to list button for mobile */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 md:hidden"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <Avatar name={getOtherUser(activeConv).name} size="md" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{getOtherUser(activeConv).name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Online &bull; Verified Alumni</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <NavLink
                  to="/sessions"
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Schedule Call
                </NavLink>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {messages.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  This is the start of your mentorship conversation with {getOtherUser(activeConv).name}.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = (m.sender?._id || m.sender?.id || m.sender) === user?.id;

                  return (
                    <div
                      key={m._id || m.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        <p>{m.content}</p>
                        <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                          <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message to alumni mentor..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
