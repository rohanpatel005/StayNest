import api from './axios';

export const messageApi = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
  
  getConversation: async (id) => {
    const response = await api.get(`/messages/conversations/${id}`);
    return response.data;
  },

  getMessages: async (id) => {
    const response = await api.get(`/messages/conversations/${id}/messages`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/messages/conversations/${id}/read`);
    return response.data;
  },

  getConversationFromBooking: async (bookingId) => {
    const response = await api.post(`/messages/conversations/from-booking/${bookingId}`);
    return response.data;
  },
};
