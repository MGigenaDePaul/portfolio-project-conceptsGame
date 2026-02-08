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
  [pairKey('mud', 'atmosphere')]: 'smog',
  [pairKey('mud', 'air')]: 'dust',
  [pairKey('cloud', 'earth')]: 'atmosphere',
  [pairKey('ocean', 'air')]: 'atmosphere',
  [pairKey('smoke', 'atmosphere')]: 'smog',

  [pairKey('inferno', 'earth')]: 'volcano',
  [pairKey('atmosphere', 'sea')]: 'ocean',

  [pairKey('atmosphere', 'air')]: 'sky',
  [pairKey('steam', 'fire')]: 'dragon',
  [pairKey('oxygen', 'ocean')]: 'sea',
  [pairKey('ocean', 'water')]: 'sea',
  [pairKey('steam', 'air')]: 'vapor',
  [pairKey('mud', 'earth')]: 'clay',
  [pairKey('mud', 'fire')]: 'lava',
  [pairKey('ocean', 'fire')]: 'lava',
  [pairKey('fire', 'volcano')]: 'lava',
  [pairKey('atmosphere', 'water')]: 'humidity',
  [pairKey('humidity', 'plasma')]: 'steam',

  [pairKey('sky', 'fire')]: 'sun',
  [pairKey('fire', 'plasma')]: 'sun',
  [pairKey('air', 'inferno')]: 'wildfire',
  [pairKey('air', 'volcano')]: 'ashCloud',
  [pairKey('lava', 'air')]: 'magma',
  [pairKey('lava', 'plasma')]: 'magma',
  [pairKey('steam', 'vapor')]: 'mist',
  [pairKey('smoke', 'lava')]: 'volcano',
  [pairKey('ocean', 'plasma')]: 'Bioluminescense',
  [pairKey('oxygen', 'plasma')]: 'fire',
  [pairKey('earth', 'smog')]: 'Dystopia',
  [pairKey('fire', 'mountain')]: 'volcano',
  [pairKey('clay', 'humidity')]: 'mud',
  [pairKey('sea', 'inferno')]: 'lava ocean',
  [pairKey('humidity', 'mountain')]: 'cloud',
  [pairKey('cloud', 'clay')]: 'cumulus',
  [pairKey('dust', 'air')]: 'pollution',
  [pairKey('atmosphere', 'volcano')]: 'eruption',
  [pairKey('oxygen', 'steam')]: 'water vapor',
  [pairKey('atmosphere', 'clay')]: 'terra cotta',
  [pairKey('fire', 'inferno')]: 'blaze',
  [pairKey('steam', 'earth')]: 'geothermal',

  // [pairKey('mountain', 'air')]: 'altitude',
  // [pairKey('inferno', 'oxygen')]: 'combustion',
  // [pairKey('cloud', 'fire')]: 'pyrocumulus',
  // [pairKey('atmosphere', 'mountain')]: 'stratosphere',

}
