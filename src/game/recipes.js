export const pairKey = (aId, bId) => {
  return [aId, bId].sort().join(':')
}

export const RECIPES = {
  [pairKey('fire', 'water')]: 'steam',
  [pairKey('water', 'earth')]: 'mud',
  [pairKey('air', 'water')]: 'rain',
  [pairKey('air', 'earth')]: 'atmosphere',
  [pairKey('air', 'fire')]: 'smoke',
  [pairKey('earth', 'fire')]: 'volcano',
}
