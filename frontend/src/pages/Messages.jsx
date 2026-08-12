import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messageApi } from '../api/messageApi';
import { initializeSocket, disconnectSocket } from '../utils/socket';
import PageLoader from '../components/PageLoader/PageLoader';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket and fetch conversations
  useEffect(() => {
    const s = initializeSocket();
    setSocket(s);

    const fetchInitialData = async () => {
      try {
        const res = await messageApi.getConversations();
        if (res.success) {
          setConversations(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();

    // Setup socket listeners
    s.on('new_message', (message) => {
      // If the message is for the currently active conversation, append it
      if (conversationId && message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
        // Also mark as read if we're actively looking at it
        if (message.sender !== user._id) {
          messageApi.markAsRead(conversationId);
        }
      }

      // Update the conversations list to show latest message and unread count
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c._id === message.conversation) {
            return {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              unreadCount: (message.conversation !== conversationId && message.sender !== user._id) ? (c.unreadCount || 0) + 1 : c.unreadCount
            };
          }
          return c;
        });
        // Re-sort by lastMessageAt desc
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    });

    s.on('typing_start', ({ userId, name }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: name }));
    });

    s.on('typing_stop', ({ userId }) => {
      setTypingUsers(prev => {
        const newObj = { ...prev };
        delete newObj[userId];
        return newObj;
      });
    });

    return () => {
      s.off('new_message');
      s.off('typing_start');
      s.off('typing_stop');
      // Do not fully disconnect socket here if used elsewhere, or do if Messages is the only consumer.
      // We'll leave it connected so it works globally if needed, but remove listeners.
    };
  }, [conversationId, user._id]);

  // Load active conversation details
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    const loadActiveChat = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          messageApi.getConversation(conversationId),
          messageApi.getMessages(conversationId)
        ]);

        if (convRes.success) {
          setActiveConversation(convRes.data);
        }
        if (msgRes.success) {
          setMessages(msgRes.data);
        }

        // Mark as read
        await messageApi.markAsRead(conversationId);
        
        // Update unread count in sidebar
        setConversations(prev => prev.map(c => 
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        ));

        // Join socket room
        if (socket) {
          socket.emit('join_conversation', { conversationId });
        }
      } catch (err) {
        console.error('Failed to load chat', err);
      }
    };

    loadActiveChat();
  }, [conversationId, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !conversationId) return;

    // Emit via socket
    socket.emit('send_message', { conversationId, content: newMessage });
    
    // Clear input
    setNewMessage('');
    socket.emit('typing_stop', { conversationId });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && conversationId) {
      socket.emit('typing_start', { conversationId });
      
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId });
      }, 2000);
    }
  };

  if (loading) return <PageLoader />;

  const isHost = user.role === 'host';

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex bg-white border-x border-gray-100">
      
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-1/3 flex flex-col border-r border-gray-200 ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = isHost ? conv.guest : conv.host;
              const isActive = conv._id === conversationId;
              
              return (
                <div 
                  key={conv._id}
                  onClick={() => navigate(isHost ? `/host/messages/${conv._id}` : `/messages/${conv._id}`)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex gap-4 ${isActive ? 'bg-brand-50 hover:bg-brand-50' : ''}`}
                >
                  <img 
                    src={otherUser.profileImage || `https://ui-avatars.com/api/?name=${otherUser.name}&background=random`} 
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {otherUser.name}
                      </h4>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(conv.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-brand-600 mb-1 truncate">{conv.listing?.title}</p>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage || 'Started a conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={`w-full md:w-2/3 flex flex-col ${!conversationId ? 'hidden md:flex bg-gray-50 items-center justify-center' : 'flex'}`}>
        {!conversationId ? (
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-lg font-medium">Select a conversation to start messaging</p>
          </div>
        ) : !activeConversation ? (
          <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b border-gray-200 flex items-center gap-4 bg-white shrink-0">
              <button 
                onClick={() => navigate(isHost ? '/host/messages' : '/messages')}
                className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <img 
                  src={activeConversation.listing?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'} 
                  alt="Property" 
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{activeConversation.listing?.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {activeConversation.listing?.location?.city}</span>
                    {activeConversation.booking && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(activeConversation.booking.checkIn).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => {
                const isMe = msg.sender === user._id;
                // Grouping logic could be added here
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <button type="button" className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-full px-5 py-3 outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-3 bg-brand-500 text-white rounded-full hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition-colors shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
