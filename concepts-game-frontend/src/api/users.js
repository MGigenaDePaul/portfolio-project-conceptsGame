import { api } from './client';

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: ({ username, email, passwordHash }) => 
    api.post('/users', {
      username,
      email,
      password_hash: passwordHash,
    }),
  delete: (id) => api.delete(`/users/${id}`)
};