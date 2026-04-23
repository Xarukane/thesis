import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, User as UserIcon, MessageCircle, ArrowLeft, MoreVertical, Search, Zap, Clock } from 'lucide-react';
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

interface Conversation {
  other_user_id: number;
  other_username: string;
  last_message: string;
  created_at: string;
  listing_id: number | null;
}

const ChatPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeReceiverId, setActiveReceiverId] = useState<number | null>(location.state?.receiverId || null);
  const [activeListingId, setActiveListingId] = useState<number | null>(location.state?.listingId || null);
  const [activeUsername, setActiveUsername] = useState<string>(location.state?.receiverUsername || 'Seller');
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeReceiverIdRef = useRef<number | null>(activeReceiverId);

  // Keep the ref in sync with state
  useEffect(() => {
    activeReceiverIdRef.current = activeReceiverId;
  }, [activeReceiverId]);

  // 1. Fetch Conversations List
  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
      
      // If we have an active receiver from state, update their name if found in conversations
      if (activeReceiverId) {
        const activeConv = response.data.find((c: Conversation) => c.other_user_id === activeReceiverId);
        if (activeConv) setActiveUsername(activeConv.other_username);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  // 2. WebSocket Connection - Stable (Only depends on user login)
  useEffect(() => {
    if (authLoading || !user) return;

    const token = localStorage.getItem('token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:8000/api/chat/ws?token=${token}`;
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket Connected ✅');
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      
      // Use Ref to check if message belongs to CURRENTLY active chat
      const currentActiveId = activeReceiverIdRef.current;
      if (
        (msg.sender_id === currentActiveId && msg.receiver_id === user.id) ||
        (msg.sender_id === user.id && msg.receiver_id === currentActiveId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      
      fetchConversations();
    };

    socket.onerror = () => {
      // Only toast if we're not in the middle of a deliberate close/reconnect
      if (socket.readyState === WebSocket.CONNECTING) {
        toast.error('Chat connection error');
      }
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [user, authLoading]); // Removed activeReceiverId from dependencies

  // 3. Fetch History when active chat changes
  useEffect(() => {
    if (activeReceiverId && user) {
      fetchHistory();
    }
  }, [activeReceiverId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      // If we have a specific listing context, use it, otherwise just user-to-user
      const url = `/chat/history/${activeReceiverId}${activeListingId ? `?listing_id=${activeListingId}` : ''}`;
      const response = await api.get(url);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
      toast.error('Could not load chat history');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeReceiverId || !socketRef.current) return;

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Connection lost. Reconnecting...');
      return;
    }

    const payload = {
      content: newMessage,
      receiver_id: activeReceiverId,
      listing_id: activeListingId,
    };

    socketRef.current.send(JSON.stringify(payload));
    setNewMessage('');
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveReceiverId(conv.other_user_id);
    setActiveListingId(conv.listing_id);
    setActiveUsername(conv.other_username);
    setMessages([]); // Clear while loading
  };

  if (authLoading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-indigo-600 uppercase text-xs tracking-widest">Securing Connection...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-200">
        <UserIcon className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Authentication Required</h3>
        <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">
          You need to be logged in to chat with sellers and view your messages.
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="btn-primary">Login Now</Link>
        <Link to="/register" className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">Create Account</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[600px] flex gap-6">
      {/* Sidebar: Conversations List */}
      <aside className={`w-full md:w-80 flex-shrink-0 flex flex-col gap-4 ${activeReceiverId ? 'hidden md:flex' : 'flex'}`}>
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/20 border border-slate-200/60 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-indigo-600" />
              Messages
            </h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No active chats yet.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={`${conv.other_user_id}-${conv.listing_id}`}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 rounded-2xl flex items-center space-x-3 transition-all ${
                    activeReceiverId === conv.other_user_id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activeReceiverId === conv.other_user_id ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-black text-sm truncate">{conv.other_username}</div>
                    <div className={`text-xs truncate font-medium opacity-70 ${
                      activeReceiverId === conv.other_user_id ? 'text-white' : 'text-slate-500'
                    }`}>
                      {conv.last_message}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-grow bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 border border-slate-200/60 overflow-hidden flex flex-col ${!activeReceiverId ? 'hidden md:flex' : 'flex'}`}>
        {!activeReceiverId ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-10">
            <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-200">
              <MessageCircle className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a conversation</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Choose someone from the sidebar to start chatting in real-time.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setActiveReceiverId(null)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors md:hidden"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-400" />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-4 border-white"></div>
                </div>
                <div>
                  <h2 className="font-black text-slate-900 tracking-tight text-lg leading-tight">{activeUsername}</h2>
                  <div className="flex items-center text-[10px] font-black text-green-500 uppercase tracking-widest mt-0.5">
                    <Zap className="w-3 h-3 mr-1 fill-current animate-pulse" />
                    Online Now
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {activeListingId && (
                  <Link 
                    to={`/listings/${activeListingId}`}
                    className="hidden sm:flex items-center bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors"
                  >
                    View Listing
                  </Link>
                )}
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                  <MoreVertical className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-grow p-6 md:p-8 overflow-y-auto bg-slate-50/50 space-y-6">
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-slate-300">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">Start of conversation</p>
                    </div>
                    <p className="text-slate-400 font-medium italic">No messages yet. Say hello!</p>
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
                        className={`max-w-[85%] md:max-w-[70%] px-6 py-4 rounded-[2rem] shadow-sm relative transition-all duration-300 ${
                          msg.sender_id === user.id 
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_10px_30px_rgba(79,70,229,0.3)]' 
                            : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)]'
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed font-semibold">{msg.content}</p>
                        <div className={`text-[10px] font-black uppercase tracking-[0.1em] mt-3 flex items-center opacity-70 ${msg.sender_id === user.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          {msg.sender_id === user.id && <Zap className="w-3 h-3 ml-2 text-yellow-300 fill-current" />}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center space-x-3 max-w-4xl mx-auto">
                <div className="flex-grow relative group">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 text-slate-900 font-semibold"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
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
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
