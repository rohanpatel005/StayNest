import api from './axios';

export const listingApi = {
  getListings: async (params) => {
    const response = await api.get('/host/listings', { params });
    return response.data;
  },

  getListing: async (id) => {
    const response = await api.get(`/host/listings/${id}`);
    return response.data;
  },

  createListing: async (data) => {
    const response = await api.post('/host/listings', data);
    return response.data;
  },

  updateListing: async (id, data) => {
    const response = await api.put(`/host/listings/${id}`, data);
    return response.data;
  },

  updateListingStatus: async (id, status) => {
    const response = await api.patch(`/host/listings/${id}/status`, { status });
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/host/listings/${id}`);
    return response.data;
  },

  uploadImages: async (formData) => {
    const response = await api.post('/host/listings/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteListingImage: async (id, imageId) => {
    const response = await api.delete(`/host/listings/${id}/images/${imageId}`);
    return response.data;
  },

  blockDates: async (id, data) => {
    const response = await api.post(`/host/listings/${id}/block-dates`, data);
    return response.data;
  },

  unblockDates: async (id, blockId) => {
    const response = await api.delete(`/host/listings/${id}/block-dates/${blockId}`);
    return response.data;
  },

  // Shared / Public Endpoints
  searchListings: async (params) => {
    const response = await api.get('/listings/search', { params });
    return response.data;
  },

  getPublicListing: async (id) => {
    const response = await api.get(`/listings/public/${id}`);
    return response.data;
  }
};
