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
  clay: { id: 'clay', name: 'Clay', emoji: '🟤' },
  lava: { id: 'lava', name: 'Lava', emoji: '🌋🔥' },
  humidity: { id: 'humidity', name: 'Humidity', emoji: '💧' },

  sun: { id: 'sun', name: 'Sun', emoji: '☀️' },
  wildfire: { id: 'wildfire', name: 'Wildfire', emoji: '🔥🌲' },
  ashCloud: { id: 'ash cloud', name: 'Ash Cloud', emoji: '☁️🌫️' },
  magma: { id: 'magma', name: 'Magma', emoji: '🌋' },
  mist: { id: 'mist', name: 'Mist', emoji: '🌫️' },
  bioluminescense: {
    id: 'bioluminescense',
    name: 'Bioluminescense',
    emoji: '💧✨',
  },
  dystopia: { id: 'dystopia', name: 'Dystopia', emoji: '🔥' },
  lavaOcean: { id: 'lava ocean', name: 'Lava Ocean', emoji: '🌋🌊' },
  cumulus: { id: 'cumulus', name: 'Cumulus', emoji: '☁️' },
  pollution: { id: 'pollution', name: 'Pollution', emoji: '☣️' },
  eruption: { id: 'eruption', name: 'Eruption', emoji: '🌋' },
  waterVapor: { id: 'water vapor', name: 'Water Vapor', emoji: '💨' },
  terraCotta: { id: 'terra cotta', name: 'Terra Cotta', emoji: '🏺' },
  blaze: { id: 'blaze', name: 'Blaze', emoji: '🔥' },
  geothermal: { id: 'geothermal', name: 'Geothermal', emoji: '🔥' },
}

// Helper: get concept by id safely
export const getConcept = (id) => {
  return CONCEPTS[id] || null
}
