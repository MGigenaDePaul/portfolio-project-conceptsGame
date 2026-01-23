export const STARTING_CONCEPT_IDS = ['fire', 'water', 'earth', 'air']

export const CONCEPTS = {
  fire: { id: 'fire', name: 'Fire', emoji: '🔥' },
  water: { id: 'water', name: 'Water', emoji: '💧' },
  earth: { id: 'earth', name: 'Earth', emoji: '🌍' },
  air: { id: 'air', name: 'Air', emoji: '🌬️' },

  steam: { id: 'steam', name: 'Steam', emoji: '💨' },
  mud: { id: 'mud', name: 'Mud', emoji: '🟤' },
  rain: { id: 'rain', name: 'Rain', emoji: '🌧️' },
  dust: { id: 'dust', name: 'Dust', emoji: '🌫️' },
  smoke: { id: 'smoke', name: 'Smoke', emoji: '🚬' },
  lava: { id: 'lava', name: 'Lava', emoji: '🌋' },
}

// Helper: get concept by id safely
export const getConcept = (id) => {
  return CONCEPTS[id] || null
}
