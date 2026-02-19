import { api } from './client';

export const boardsApi = {
  // Returns: { id, name, owner_id, created_at, discoveries: [...], instances: [...]}
  get: (boardId) => api.get(`/boards/${boardId}`),

  // Returns: [{ id, name, owner_id, created_at}, ...]
  getByUser: (userId) => api.get(`/boards/user/${userId}`),

  // Returns: { id, name, owner_id, created_at }
  create: (name, ownerId) => api.post('/boards', { name, owner_id: ownerId }),

  // Returns: { message: 'Board deleted successfully }
  delete: (boardId) => api.delete(`/boards/${boardId}`),

  // Returns: { success, concept, complexity, isNewDiscovery, complexityImproved, newInstance }
  combine: (boardId, {conceptAId, conceptBId, instanceAId, instanceBId }) => 
    api.post(`/boards/${boardId}/combine`, {
      concept_a_id: conceptAId,
      concept_b_id: conceptBId,
      instance_a_id: instanceAId,
      instance_b_id: instanceBId,
    }),

  // Returns: { success, instance: { ...instance, name, emoji } }
  spawn: (boardId, { conceptId, positionX, positionY }) => 
    api.post(`/boards/${boardId}/spawn`, {
      concept_id: conceptId,
      position_x: positionX,
      position_y: positionY,
    }),
};