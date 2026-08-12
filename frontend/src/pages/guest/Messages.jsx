import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const res = await messageApi.getConversations();
        if (res.success) {
          setConversations(res.data);
        }
      } catch (err) {
        console.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConvs();
  }, []);

  const handleSelectConv = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await messageApi.getConversation(conv._id);
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    // Determine receiver based on roles. Since this is guest, receiver is host.
    const receiverId = activeConv.host._id;

    try {
      const res = await messageApi.sendMessage({
        conversationId: activeConv._id,
        receiverId,
        text: newMessage
      });
      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="pb-12 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6 shrink-0">
        <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
      </motion.div>

      <div className="flex-1 flex bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No conversations yet.
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = conv.host;
                const isActive = activeConv?._id === conv._id;
                return (
                  <button 
                    key={conv._id}
                    onClick={() => handleSelectConv(conv)}
                    className={`w-full text-left p-4 border-b border-gray-100 transition-colors flex items-center gap-3 ${isActive ? 'bg-brand-50 border-brand-100' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {otherUser?.profileImage ? (
                        <img src={otherUser.profileImage} alt={otherUser.name} className="w-full h-full object-cover" />
                      ) : (
                        otherUser?.name?.charAt(0) || 'H'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{otherUser?.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{conv.listing?.title}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex md:w-2/3 flex-col bg-gray-50/50">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold overflow-hidden">
                   {activeConv.host?.profileImage ? (
                      <img src={activeConv.host.profileImage} alt="Host" className="w-full h-full object-cover" />
                   ) : (
                      activeConv.host?.name?.charAt(0) || 'H'
                   )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{activeConv.host?.name}</h4>
                  <p className="text-xs text-gray-500">Regarding: {activeConv.listing?.title}</p>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender === user._id || msg.sender._id === user._id;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-full text-sm outline-none transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4 ml-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Messages;
