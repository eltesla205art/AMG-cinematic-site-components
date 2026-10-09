// Defaults for store info. The owner dashboard's "Hours & Info" editor
// overrides these (saved under bod.info).
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const DEFAULT_INFO = {
  name: 'Bun on D-Run',
  tagline: 'The fast lane of flavor…',
  phone: '[PHONE]', // TODO: Tim to confirm
  facebook: 'https://www.facebook.com/search/top?q=Bun%20on%20D-Run', // TODO: replace with the page URL
  address: {
    street: '2850 S Washington Ave',
    city: 'Titusville',
    state: 'FL',
    zip: '32796',
    note: 'US-1 near Titus Landing, in the old Ice House building',
  },
  // TODO: placeholder [HOURS], Tim to confirm. 24h "HH:MM".
  hours: Object.fromEntries(DAYS.map((d) => [d, { open: '11:00', close: '21:00', closed: false }])),
  announcement: 'Opening soon on US-1. Start your engines.',
  taxRate: 0.07, // FL 6% + Brevard County 1% surtax (estimate; confirm with accountant)
}

export const fullAddress = (a) => `${a.street}, ${a.city}, ${a.state} ${a.zip}`
export const mapsQuery = (a) => encodeURIComponent(fullAddress(a))
