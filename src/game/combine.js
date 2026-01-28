import { RECIPES, pairKey } from './recipes'

export function combine(aId, bId) {
  if (!aId || !bId) return null

  const key = pairKey(aId, bId)
  return RECIPES[key] || null // si existe la combinacion, devuelve id nuevo
}
