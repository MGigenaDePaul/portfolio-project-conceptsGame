// Generar IDs únicos para instancias
let instanceCounter = 0
export const generateInstanceId = () => `instance-${instanceCounter++}`

export const STARTING_CONCEPT_IDS = ['fire', 'water', 'earth', 'air']

export const createStartingInstances = () => {
  const instances = {}

  STARTING_CONCEPT_IDS.forEach((conceptId) => {
    // Crear 2 instancias de cada elemento
    for (let i = 0; i < 2; i++) {
      const instanceId = generateInstanceId()
      instances[instanceId] = {
        instanceId,
        conceptId, // referencia al concepto original
      }
    }
  })

  return instances
}

export const CONCEPTS = {
  fire: { id: 'fire', name: 'Fire', emoji: '🔥' },
  water: { id: 'water', name: 'Water', emoji: '💧' },
  earth: { id: 'earth', name: 'Earth', emoji: '🌍' },
  air: { id: 'air', name: 'Air', emoji: '🌬️' },

  steam: { id: 'steam', name: 'Steam', emoji: '☁️💧' },
  mud: { id: 'mud', name: 'Mud', emoji: '🟤' },
  cloud: { id: 'cloud', name: 'Cloud', emoji: '☁️' },
  atmosphere: { id: 'atmosphere', name: 'Atmosphere', emoji: '🌍' },
  smoke: { id: 'smoke', name: 'Smoke', emoji: '💨' },
  volcano: { id: 'volcano', name: 'Volcano', emoji: '🌋' },

  ocean: { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  oxygen: { id: 'oxygen', name: 'Oxygen', emoji: '🧪' },
  inferno: { id: 'inferno', name: 'Inferno', emoji: '💥' },
  mountain: { id: 'mountain', name: 'Mountain', emoji: '⛰️' },

  plasma: { id: 'plasma', name: 'Plasma', emoji: '⚡' },
  smog: { id: 'smog', name: 'Smog', emoji: '🌫️' },
  dust: { id: 'dust', name: 'Dust', emoji: '💨' },

  sky: { id: 'sky', name: 'Sky', emoji: '☁️' },
  dragon: { id: 'dragon', name: 'Dragon', emoji: '🐉' },
  sea: { id: 'sea', name: 'Sea', emoji: '🌊' },
  vapor: { id: 'vapor', name: 'Vapor', emoji: '💨' },
}

// Helper: get concept by id safely
export const getConcept = (id) => {
  return CONCEPTS[id] || null
}
