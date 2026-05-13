// Generar IDs únicos para instancias
let instanceCounter = 0;
export const generateInstanceId = () => `instance-${instanceCounter++}`;

export const STARTING_CONCEPT_IDS = ['fire', 'water', 'earth', 'air'];

export const createStartingInstances = () => {
  const instances = {};

  STARTING_CONCEPT_IDS.forEach((conceptId) => {
    // Crear 2 instancias de cada elemento
    for (let i = 0; i < 2; i++) {
      const instanceId = generateInstanceId();
      instances[instanceId] = {
        instanceId,
        conceptId, // referencia al concepto original
      };
    }
  });

  return instances;
};

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

  // altitude: { id: 'altitude', name: 'Altitude', emoji: '' },
  // combustion: { id: 'combustion', name: 'Combustion', emoji: '' },
  // pyrocumulus: { id: 'pyrocumulus', name: 'Pyrocumulus', emoji: '' },
  // stratosphere: { id: 'stratosphere', name: 'Stratosphere', emoji: '' },

  // ─── WEATHER ──────────────────────────────────────
  rain: { id: 'rain', name: 'Rain', emoji: '🌧️' },
  ice: { id: 'ice', name: 'Ice', emoji: '🧊' },
  snow: { id: 'snow', name: 'Snow', emoji: '❄️' },
  storm: { id: 'storm', name: 'Storm', emoji: '⛈️' },
  lightning: { id: 'lightning', name: 'Lightning', emoji: '🌩️' },
  thunder: { id: 'thunder', name: 'Thunder', emoji: '🌩️' },
  tornado: { id: 'tornado', name: 'Tornado', emoji: '🌪️' },
  hurricane: { id: 'hurricane', name: 'Hurricane', emoji: '🌀' },
  frost: { id: 'frost', name: 'Frost', emoji: '🌨️' },
  blizzard: { id: 'blizzard', name: 'Blizzard', emoji: '❄️🌨️' },
  hail: { id: 'hail', name: 'Hail', emoji: '🌨️' },
  rainbow: { id: 'rainbow', name: 'Rainbow', emoji: '🌈' },
  fog: { id: 'fog', name: 'Fog', emoji: '🌁' },
  aurora: { id: 'aurora', name: 'Aurora', emoji: '🌌' },
  monsoon: { id: 'monsoon', name: 'Monsoon', emoji: '🌧️🌊' },

  // ─── GEOLOGY / MATERIALS ────────────────────────────────
  rock: { id: 'rock', name: 'Rock', emoji: '🪨' },
  stone: { id: 'stone', name: 'Stone', emoji: '🪨' },
  sand: { id: 'sand', name: 'Sand', emoji: '🏜️' },
  glass: { id: 'glass', name: 'Glass', emoji: '🪟' },
  obsidian: { id: 'obsidian', name: 'Obsidian', emoji: '⬛' },
  coal: { id: 'coal', name: 'Coal', emoji: '🪨' },
  mineral: { id: 'mineral', name: 'Mineral', emoji: '💠' },
  metal: { id: 'metal', name: 'Metal', emoji: '🔩' },
  iron: { id: 'iron', name: 'Iron', emoji: '⚙️' },
  copper: { id: 'copper', name: 'Copper', emoji: '🟤' },
  gold: { id: 'gold', name: 'Gold', emoji: '🥇' },
  silver: { id: 'silver', name: 'Silver', emoji: '🥈' },
  steel: { id: 'steel', name: 'Steel', emoji: '🔧' },
  rust: { id: 'rust', name: 'Rust', emoji: '🟫' },
  crystal: { id: 'crystal', name: 'Crystal', emoji: '🔮' },
  gem: { id: 'gem', name: 'Gem', emoji: '💎' },
  diamond: { id: 'diamond', name: 'Diamond', emoji: '💎✨' },
  bronze: { id: 'bronze', name: 'Bronze', emoji: '🥉' },
  marble: { id: 'marble', name: 'Marble', emoji: '⚪' },

  // ─── WATER FEATURES ────────────────────────────────
  river: { id: 'river', name: 'River', emoji: '🏞️' },
  lake: { id: 'lake', name: 'Lake', emoji: '🏞️' },
  glacier: { id: 'glacier', name: 'Glacier', emoji: '🧊⛰️' },
  wave: { id: 'wave', name: 'Wave', emoji: '🌊' },
  swamp: { id: 'swamp', name: 'Swamp', emoji: '🌿💧' },
  waterfall: { id: 'waterfall', name: 'Waterfall', emoji: '💧⛰️' },
  pond: { id: 'pond', name: 'Pond', emoji: '💧' },
  tide: { id: 'tide', name: 'Tide', emoji: '🌊🌙' },
  flood: { id: 'flood', name: 'Flood', emoji: '🌊🌊' },
  delta: { id: 'delta', name: 'Delta', emoji: '🌊🏜️' },

  // ─── LANDFORMS ────────────────────────────────
  island: { id: 'island', name: 'Island', emoji: '🏝️' },
  desert: { id: 'desert', name: 'Desert', emoji: '🏜️' },
  tundra: { id: 'tundra', name: 'Tundra', emoji: '🌨️🌍' },
  canyon: { id: 'canyon', name: 'Canyon', emoji: '🏜️⛰️' },
  beach: { id: 'beach', name: 'Beach', emoji: '🏖️' },
  oasis: { id: 'oasis', name: 'Oasis', emoji: '🌴💧' },
  cave: { id: 'cave', name: 'Cave', emoji: '🕳️' },
  marsh: { id: 'marsh', name: 'Marsh', emoji: '🌿💧' },

  // ─── LIFE / PLANTS / NATURE ────────────────────────────────
  life: { id: 'life', name: 'Life', emoji: '🧬' },
  soil: { id: 'soil', name: 'Soil', emoji: '🌱' },
  plant: { id: 'plant', name: 'Plant', emoji: '🌿' },
  grass: { id: 'grass', name: 'Grass', emoji: '🌾' },
  flower: { id: 'flower', name: 'Flower', emoji: '🌸' },
  tree: { id: 'tree', name: 'Tree', emoji: '🌳' },
  forest: { id: 'forest', name: 'Forest', emoji: '🌲' },
  jungle: { id: 'jungle', name: 'Jungle', emoji: '🌴' },
  wood: { id: 'wood', name: 'Wood', emoji: '🪵' },
  charcoal: { id: 'charcoal', name: 'Charcoal', emoji: '⬛' },
  leaf: { id: 'leaf', name: 'Leaf', emoji: '🍃' },
  moss: { id: 'moss', name: 'Moss', emoji: '🌿' },
  algae: { id: 'algae', name: 'Algae', emoji: '🌿' },
  seaweed: { id: 'seaweed', name: 'Seaweed', emoji: '🌿🌊' },
  mushroom: { id: 'mushroom', name: 'Mushroom', emoji: '🍄' },
  fruit: { id: 'fruit', name: 'Fruit', emoji: '🍎' },
  seed: { id: 'seed', name: 'Seed', emoji: '🌱' },
  pollen: { id: 'pollen', name: 'Pollen', emoji: '🌼💨' },
  vine: { id: 'vine', name: 'Vine', emoji: '🌿' },
  cactus: { id: 'cactus', name: 'Cactus', emoji: '🌵' },
  bamboo: { id: 'bamboo', name: 'Bamboo', emoji: '🎋' },
  coral: { id: 'coral', name: 'Coral', emoji: '🪸' },
  spore: { id: 'spore', name: 'Spore', emoji: '🍄💨' },
  prairie: { id: 'prairie', name: 'Prairie', emoji: '🌾🌿' },

  // ─── ANIMALS ────────────────────────────────
  fish: { id: 'fish', name: 'Fish', emoji: '🐟' },
  insect: { id: 'insect', name: 'Insect', emoji: '🐛' },
  worm: { id: 'worm', name: 'Worm', emoji: '🪱' },
  bee: { id: 'bee', name: 'Bee', emoji: '🐝' },
  butterfly: { id: 'butterfly', name: 'Butterfly', emoji: '🦋' },
  bird: { id: 'bird', name: 'Bird', emoji: '🐦' },
  eagle: { id: 'eagle', name: 'Eagle', emoji: '🦅' },
  owl: { id: 'owl', name: 'Owl', emoji: '🦉' },
  snake: { id: 'snake', name: 'Snake', emoji: '🐍' },
  lizard: { id: 'lizard', name: 'Lizard', emoji: '🦎' },
  frog: { id: 'frog', name: 'Frog', emoji: '🐸' },
  wolf: { id: 'wolf', name: 'Wolf', emoji: '🐺' },
  bear: { id: 'bear', name: 'Bear', emoji: '🐻' },
  deer: { id: 'deer', name: 'Deer', emoji: '🦌' },
  horse: { id: 'horse', name: 'Horse', emoji: '🐴' },
  whale: { id: 'whale', name: 'Whale', emoji: '🐋' },
  shark: { id: 'shark', name: 'Shark', emoji: '🦈' },
  dolphin: { id: 'dolphin', name: 'Dolphin', emoji: '🐬' },
  crab: { id: 'crab', name: 'Crab', emoji: '🦀' },
  turtle: { id: 'turtle', name: 'Turtle', emoji: '🐢' },
  dinosaur: { id: 'dinosaur', name: 'Dinosaur', emoji: '🦕' },
  mammoth: { id: 'mammoth', name: 'Mammoth', emoji: '🦣' },
  phoenix: { id: 'phoenix', name: 'Phoenix', emoji: '🦅🔥' },
  kraken: { id: 'kraken', name: 'Kraken', emoji: '🐙' },
  unicorn: { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
  griffin: { id: 'griffin', name: 'Griffin', emoji: '🦁🦅' },
  leviathan: { id: 'leviathan', name: 'Leviathan', emoji: '🐉🌊' },

  // ─── CIVILIZATION ────────────────────────────────
  human: { id: 'human', name: 'Human', emoji: '🧑' },
  tribe: { id: 'tribe', name: 'Tribe', emoji: '👥' },
  village: { id: 'village', name: 'Village', emoji: '🏘️' },
  city: { id: 'city', name: 'City', emoji: '🏙️' },
  house: { id: 'house', name: 'House', emoji: '🏠' },
  castle: { id: 'castle', name: 'Castle', emoji: '🏰' },
  tool: { id: 'tool', name: 'Tool', emoji: '🔨' },
  weapon: { id: 'weapon', name: 'Weapon', emoji: '⚔️' },
  sword: { id: 'sword', name: 'Sword', emoji: '⚔️' },
  armor: { id: 'armor', name: 'Armor', emoji: '🛡️' },
  ship: { id: 'ship', name: 'Ship', emoji: '⛵' },
  forge: { id: 'forge', name: 'Forge', emoji: '🔥⚙️' },
  mine: { id: 'mine', name: 'Mine', emoji: '⛏️' },
  wheel: { id: 'wheel', name: 'Wheel', emoji: '⚙️' },
  bridge: { id: 'bridge', name: 'Bridge', emoji: '🌉' },
  writing: { id: 'writing', name: 'Writing', emoji: '📝' },
  knowledge: { id: 'knowledge', name: 'Knowledge', emoji: '📚' },
  empire: { id: 'empire', name: 'Empire', emoji: '👑' },
  army: { id: 'army', name: 'Army', emoji: '⚔️' },
  market: { id: 'market', name: 'Market', emoji: '🏪' },
  medicine: { id: 'medicine', name: 'Medicine', emoji: '💊' },
  religion: { id: 'religion', name: 'Religion', emoji: '🛕' },
  farm: { id: 'farm', name: 'Farm', emoji: '🌾🏡' },
  harbor: { id: 'harbor', name: 'Harbor', emoji: '⚓' },
  lighthouse: { id: 'lighthouse', name: 'Lighthouse', emoji: '🔦🌊' },
  crown: { id: 'crown', name: 'Crown', emoji: '👑' },
  library: { id: 'library', name: 'Library', emoji: '📚' },
  telescope: { id: 'telescope', name: 'Telescope', emoji: '🔭' },
  science: { id: 'science', name: 'Science', emoji: '🔬' },
  war: { id: 'war', name: 'War', emoji: '⚔️💥' },
  pyramid: { id: 'pyramid', name: 'Pyramid', emoji: '🔺' },
  mill: { id: 'mill', name: 'Mill', emoji: '⚙️🌾' },
  compass: { id: 'compass', name: 'Compass', emoji: '🧭' },
  civilization: { id: 'civilization', name: 'Civilization', emoji: '🏛️' },

  // ─── FOOD / ALCHEMY ────────────────────────────────
  grain: { id: 'grain', name: 'Grain', emoji: '🌾' },
  flour: { id: 'flour', name: 'Flour', emoji: '⬜' },
  bread: { id: 'bread', name: 'Bread', emoji: '🍞' },
  salt: { id: 'salt', name: 'Salt', emoji: '🧂' },
  honey: { id: 'honey', name: 'Honey', emoji: '🍯' },
  wine: { id: 'wine', name: 'Wine', emoji: '🍷' },
  beer: { id: 'beer', name: 'Beer', emoji: '🍺' },
  soup: { id: 'soup', name: 'Soup', emoji: '🍲' },
  tea: { id: 'tea', name: 'Tea', emoji: '🍵' },
  oil: { id: 'oil', name: 'Oil', emoji: '🫙' },
  potion: { id: 'potion', name: 'Potion', emoji: '🧪' },
  acid: { id: 'acid', name: 'Acid', emoji: '🧪' },
  gunpowder: { id: 'gunpowder', name: 'Gunpowder', emoji: '💥' },
  meat: { id: 'meat', name: 'Meat', emoji: '🥩' },
  alcohol: { id: 'alcohol', name: 'Alcohol', emoji: '🥃' },

  // ─── ABSTRACT / ENERGY ────────────────────────────────
  electricity: { id: 'electricity', name: 'Electricity', emoji: '⚡' },
  explosion: { id: 'explosion', name: 'Explosion', emoji: '💥' },
  magic: { id: 'magic', name: 'Magic', emoji: '✨' },
  alchemy: { id: 'alchemy', name: 'Alchemy', emoji: '⚗️' },
  myth: { id: 'myth', name: 'Myth', emoji: '📖✨' },
  legend: { id: 'legend', name: 'Legend', emoji: '📖🌟' },
  technology: { id: 'technology', name: 'Technology', emoji: '⚙️💡' },
  steamEngine: { id: 'steam engine', name: 'Steam Engine', emoji: '⚙️💨' },
  firestorm: { id: 'firestorm', name: 'Firestorm', emoji: '🔥🌪️' },
  earthquake: { id: 'earthquake', name: 'Earthquake', emoji: '🌍💥' },
  tsunami: { id: 'tsunami', name: 'Tsunami', emoji: '🌊💥' },
  avalanche: { id: 'avalanche', name: 'Avalanche', emoji: '❄️⛰️' },

  // ─── SPACE ────────────────────────────────
  moon: { id: 'moon', name: 'Moon', emoji: '🌙' },
  star: { id: 'star', name: 'Star', emoji: '⭐' },
  planet: { id: 'planet', name: 'Planet', emoji: '🪐' },
  comet: { id: 'comet', name: 'Comet', emoji: '☄️' },
  galaxy: { id: 'galaxy', name: 'Galaxy', emoji: '🌌' },
  nebula: { id: 'nebula', name: 'Nebula', emoji: '🌌✨' },
  meteor: { id: 'meteor', name: 'Meteor', emoji: '☄️' },
  eclipse: { id: 'eclipse', name: 'Eclipse', emoji: '🌑' },
  cosmos: { id: 'cosmos', name: 'Cosmos', emoji: '✨' },
  asteroid: { id: 'asteroid', name: 'Asteroid', emoji: '🪨☄️' },
  supernova: { id: 'supernova', name: 'Supernova', emoji: '💥⭐' },
  blackHole: { id: 'black hole', name: 'Black Hole', emoji: '🕳️' },

  // ─── MYTHOLOGY ────────────────────────────────
  sunGod: { id: 'sun god', name: 'Sun God', emoji: '☀️🛕' },
  seaDragon: { id: 'sea dragon', name: 'Sea Dragon', emoji: '🐉🌊' },
  iceDragon: { id: 'ice dragon', name: 'Ice Dragon', emoji: '🐉🧊' },
  stormDragon: { id: 'storm dragon', name: 'Storm Dragon', emoji: '🐉⛈️' },
  golem: { id: 'golem', name: 'Golem', emoji: '🪨🧑' },
  spirit: { id: 'spirit', name: 'Spirit', emoji: '👻' },
  geyser: { id: 'geyser', name: 'Geyser', emoji: '💦🔥' },
  reef: { id: 'reef', name: 'Reef', emoji: '🪸🌊' },
};

// Helper: get concept by id safely
export const getConcept = (id) => {
  return CONCEPTS[id] || null;
};
