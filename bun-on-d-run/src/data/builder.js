// 3D Burger Builder ingredients. `layer` drives the Three.js model;
// `price` feeds the live calculator and the cart.
export const BASE_PRICE = 7.99 // single smash patty, toasted bun

export const INGREDIENTS = [
  { id: 'patty', name: 'Extra Patty', price: 2.5, max: 2, kind: 'count' },
  { id: 'cheese', name: 'American Cheese', price: 0.75 },
  { id: 'bacon', name: 'Bacon', price: 1.75 },
  { id: 'lettuce', name: 'Lettuce', price: 0 },
  { id: 'tomato', name: 'Tomato', price: 0 },
  { id: 'onion', name: 'Onion', price: 0 },
  { id: 'pickles', name: 'Pickles', price: 0 },
  { id: 'jalapenos', name: 'Jalapeños', price: 0.5 },
  { id: 'ketchup', name: 'Ketchup', price: 0, group: 'Sauces' },
  { id: 'mustard', name: 'Mustard', price: 0, group: 'Sauces' },
  { id: 'drun', name: 'D-Run Sauce', price: 0.5, group: 'Sauces' },
]

export const CLASSIC = { patty: 0, cheese: true, lettuce: true, tomato: true, pickles: true, drun: true }

export function builderPrice(sel) {
  return INGREDIENTS.reduce((sum, ing) => {
    const v = sel[ing.id]
    return sum + (ing.kind === 'count' ? (v || 0) * ing.price : v ? ing.price : 0)
  }, BASE_PRICE)
}

export function builderLabel(sel) {
  const parts = []
  if (sel.patty) parts.push(sel.patty === 1 ? 'Double patty' : 'Triple patty')
  for (const ing of INGREDIENTS) if (ing.kind !== 'count' && sel[ing.id]) parts.push(ing.name)
  return parts.length ? parts : ['Plain single']
}

/** Bottom-to-top stack for the 3D model. */
export function builderLayers(sel) {
  const L = ['bunBottom']
  if (sel.ketchup) L.push('ketchup')
  if (sel.mustard) L.push('mustard')
  for (let i = 0; i <= (sel.patty || 0); i++) {
    L.push(`patty${i}`)
    if (sel.cheese) L.push(`cheese${i}`)
  }
  if (sel.bacon) L.push('bacon')
  if (sel.onion) L.push('onion')
  if (sel.pickles) L.push('pickles')
  if (sel.jalapenos) L.push('jalapenos')
  if (sel.tomato) L.push('tomato')
  if (sel.lettuce) L.push('lettuce')
  if (sel.drun) L.push('drun')
  L.push('bunTop')
  return L
}
