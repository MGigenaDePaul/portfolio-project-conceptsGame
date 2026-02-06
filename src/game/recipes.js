export const pairKey = (aId, bId) => {
  return [aId, bId].sort().join(':')
}

export const RECIPES = {
  [pairKey('fire', 'water')]: 'steam',
  [pairKey('water', 'earth')]: 'mud',
  [pairKey('air', 'water')]: 'cloud',
  [pairKey('air', 'earth')]: 'atmosphere',
  [pairKey('air', 'fire')]: 'smoke',
  [pairKey('earth', 'fire')]: 'volcano',

  [pairKey('water', 'water')]: 'ocean',
  [pairKey('air', 'air')]: 'oxygen',
  [pairKey('fire', 'fire')]: 'inferno',
  [pairKey('earth', 'earth')]: 'mountain',

  [pairKey('atmosphere', 'fire')]: 'plasma',
  [pairKey('smoke', 'earth')]: 'smog',
  [pairKey('mud', 'air')]: 'dust',
  [pairKey('cloud', 'earth')]: 'atmosphere',
  [pairKey('smoke', 'atmosphere')]: 'smog',

  [pairKey('inferno', 'earth')]: 'volcano',

  [pairKey('atmosphere', 'air')]: 'sky',
  [pairKey('steam', 'fire')]: 'dragon',
  [pairKey('oxygen', 'ocean')]: 'sea',
  [pairKey('steam', 'air')]: 'vapor',
  [pairKey('mud', 'earth')]: 'clay',
  [pairKey('mud', 'fire')]: 'lava',
  [pairKey('fire', 'volcano')]: 'lava',
  [pairKey('atmosphere', 'water')]: 'humidity',

  [pairKey('sky', 'fire')]: 'sun',
  [pairKey('fire', 'plasma')]: 'sun',
  [pairKey('humidity', 'plasma')]: 'steam',
  [pairKey('mud', 'atmosphere')]: 'smog',
  [pairKey('air', 'inferno')]: 'wildfire',
  [pairKey('air', 'volcano')]: 'ash cloud',
  [pairKey('lava', 'air')]: 'magma',
  [pairKey('lava', 'plasma')]: 'magma',
  [pairKey('steam', 'vapor')]: 'mist',
  [pairKey('smoke', 'lava')]: 'volcano',
  [pairKey('ocean', 'plasma')]: 'Bioluminscense',
  [pairKey('oxygen', 'plasma')]: 'fire',
  [pairKey('earth', 'smog')]: 'Dystopia',
  [pairKey('fire', 'mountain')]: 'volcano',
  [pairKey('clay', 'humidity')]: 'mud',
}
