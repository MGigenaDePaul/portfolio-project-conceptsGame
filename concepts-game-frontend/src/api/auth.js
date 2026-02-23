import { api } from './client';

export const authApi = {
  register: (username, email, password) => 
    api.post('/auth/register', { username, email, password }),
    
  login: (email, password) => 
    api.post('/auth/login', { email, password }),

  google: (credential) =>                   
    api.post('/auth/google', { credential }),

  me: () =>
    api.get('/auth/me'),
};