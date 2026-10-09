import { IMAGES } from './images'
import { BASE_PRICE } from './builder'

// TODO: prices and items are placeholders until Tim finalizes the menu.
// The owner dashboard's Menu Manager overrides this list (saved under bod.menu).
export const CATEGORIES = [
  { id: 'burgers', name: 'Burgers' },
  { id: 'sides', name: 'Fries & Sides' },
  { id: 'shakes', name: 'Shakes & Drinks' },
  { id: 'combos', name: 'Combos' },
]

export const DEFAULT_MENU = [
  { id: 'pole-position', category: 'burgers', name: 'The Pole Position', description: 'Double smash patty, American cheese, pickles, onion, D-Run sauce on a toasted potato bun.', price: 11.49, image: IMAGES.hero, available: true, featured: true },
  { id: 'single-smash', category: 'burgers', name: 'Single Smash', description: 'One crispy-edged smash patty, American cheese, lettuce, tomato, pickles.', price: 8.99, image: IMAGES.foodAlt, available: true },
  { id: 'burnout', category: 'burgers', name: 'The Burnout', description: 'Double smash, pepper jack, jalapeños, bacon and hot D-Run sauce. Not for the slow lane.', price: 12.49, image: IMAGES.hero, available: true },
  { id: 'build-your-own', category: 'burgers', name: 'Build Your Own Smash', description: 'Stack it your way in the 3D Burger Builder. Price updates as you build.', price: BASE_PRICE, image: '', available: true, custom: true },
  { id: 'fries', category: 'sides', name: 'Checkered Fries', description: 'Hand-cut, double-fried, seasoned salt.', price: 3.99, image: IMAGES.fries, available: true, featured: true },
  { id: 'loaded-fries', category: 'sides', name: 'Pit Stop Loaded Fries', description: 'Fries, cheese sauce, bacon, jalapeños, D-Run sauce drizzle.', price: 6.99, image: IMAGES.friesAlt, available: true },
  { id: 'onion-rings', category: 'sides', name: 'Onion Rings', description: 'Thick-cut, beer-battered, golden.', price: 4.49, image: '', available: true },
  { id: 'vanilla-shake', category: 'shakes', name: 'Victory Lap Vanilla Shake', description: 'Hand-spun vanilla with whipped cream.', price: 5.49, image: IMAGES.vibe, available: true, featured: true },
  { id: 'choc-shake', category: 'shakes', name: 'Burnt Rubber Chocolate Shake', description: 'Rich chocolate, hand-spun.', price: 5.49, image: '', available: true },
  { id: 'soda', category: 'shakes', name: 'Fountain Soda', description: 'Free refills while you wait.', price: 2.29, image: '', available: true },
  { id: 'combo-pole', category: 'combos', name: 'Pole Position Combo', description: 'The Pole Position, Checkered Fries and a fountain soda.', price: 15.99, image: IMAGES.hero, available: true },
  { id: 'combo-single', category: 'combos', name: 'Single Smash Combo', description: 'Single Smash, Checkered Fries and a fountain soda.', price: 13.49, image: IMAGES.foodAlt, available: true },
]
