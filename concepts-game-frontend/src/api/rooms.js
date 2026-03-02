import { api } from './client';

export const roomsApi = {
  create: () => api.post('/rooms/create'),
  join: (code) => api.post('/rooms/join', { code }),
  getInfo: (code) => api.get(`/rooms/${code}`),
};