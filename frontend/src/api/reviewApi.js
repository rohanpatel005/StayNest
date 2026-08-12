import api from './axios';

export const reviewApi = {
  getReviews: async (params) => {
    const response = await api.get('/host/reviews', { params });
    return response.data;
  },

  replyToReview: async (id, hostReply) => {
    const response = await api.patch(`/host/reviews/${id}/reply`, { hostReply });
    return response.data;
  }
};
