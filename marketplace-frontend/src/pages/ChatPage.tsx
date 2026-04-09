import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, User as UserIcon, MessageCircle, ArrowLeft, MoreVertical, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Message {
  id?: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  listing_id?: number;
  created_at?: string;
}

const ChatPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId] = useState<number | null>(location.state?.receiverId || null);
  const [listingId] = useState<number | null>(location.state?.listingId || null);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    const socket = new WebSocket(`ws://localhost:8000/api/chat/ws?token=${token}`);

    socket.onopen = () => console.log('WebSocket Connected');
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
      if (msg.sender_id !== user.id) {
        // Optional: sound or notification if not active
      }
    };
    socket.onclose = () => console.log('WebSocket Disconnected');

    socketRef.current = socket;

    if (receiverId) {
      fetchHistory();
    }

    return () => {
      socket.close();
    };
  }, [user, authLoading, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/chat/history/${receiverId}${listingId ? `?listing_id=${listingId}` : ''}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
      toast.error('Could not load chat history');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId || !socketRef.current) return;

    const payload = {
      content: newMessage,
      receiver_id: receiverId,
      listing_id: listingId,
    };

    socketRef.current.send(JSON.stringify(payload));
    setNewMessage('');
  };

  if (authLoading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-indigo-600 uppercase text-xs tracking-widest">Securing Connection...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card !rounded-[2.5rem] !shadow-2xl !shadow-indigo-100/50 border-none flex flex-col h-[calc(100vh-180px)] min-h-[600px] overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-5 text-white flex items-center justify-between shrink-0 shadow-lg relative z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors md:hidden"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-400 w-4 h-4 rounded-full border-4 border-indigo-600"></div>
            </div>
            <div>
              <h2 className="font-black tracking-tight text-lg">
                {receiverId ? `Seller Support` : 'Select a Chat'}
              </h2>
              <div className="flex items-center text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">
                <Zap className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                Live Connection Active
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {listingId && (
              <div className="hidden sm:flex items-center bg-indigo-700/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-500/30 text-xs font-bold">
                <span className="text-indigo-300 mr-2 uppercase tracking-tighter">Listing</span>
                #{listingId}
              </div>
            )}
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-6 md:p-10 overflow-y-auto bg-slate-50 space-y-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {!receiverId ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
              >
                <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-200">
                  <MessageCircle className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Inbox</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Pick a listing to start a real-time conversation with the seller.</p>
                </div>
                <Link to="/" className="btn-primary">Browse Items</Link>
              </motion.div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-slate-400">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">End-to-end encrypted</p>
                </div>
                <p className="text-slate-400 font-medium italic">No messages yet. Break the ice!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={index} 
                  className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] md:max-w-[65%] px-5 py-3 rounded-2xl shadow-sm relative group ${
                      msg.sender_id === user.id 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100 shadow-lg' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/60'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed font-medium">{msg.content}</p>
                    <div className={`text-[9px] font-black uppercase tracking-widest mt-2 flex items-center ${msg.sender_id === user.id ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      {msg.sender_id === user.id && <Zap className="w-2.5 h-2.5 ml-1.5 text-yellow-400 fill-current" />}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {receiverId && (
          <div className="p-6 bg-white border-t border-slate-100 relative z-10">
            <form onSubmit={sendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
              <div className="flex-grow relative group">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900 font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2 text-slate-300">
                  <Search className="w-5 h-5 cursor-pointer hover:text-indigo-500 transition-colors" />
                </div>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 active:scale-90 shrink-0 group"
              >
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
