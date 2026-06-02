import { api } from './client';

export const leaderboardsApi = {
  getGlobal: () => api.get('/leaderboards/global'),
};
