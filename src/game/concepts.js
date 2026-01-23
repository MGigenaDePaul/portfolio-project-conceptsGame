export const STARTING_CONCEPT_IDS = ['fire', 'water', 'earth', 'air']

export const CONCEPTS = {
  fire: { id: 'fire', name: 'Fire', emoji: '🔥' },
  water: { id: 'water', name: 'Water', emoji: '💧' },
  earth: { id: 'earth', name: 'Earth', emoji: '🌍' },
  air: { id: 'air', name: 'Air', emoji: '🌬️' },
}

// Helper: get concept by id safely
export function getConcept(id) {
  return CONCEPTS[id] || null
}