export const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`

export const time = (d) =>
  new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export const dateTime = (d) =>
  new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export const isToday = (d) => new Date(d).toDateString() === new Date().toDateString()

/** Accepts 10-digit US numbers in any common format. */
export const isValidPhone = (s) => /^\+?1?\D*\d{3}\D*\d{3}\D*\d{4}$/.test(s.trim())

export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** True while the phone is still the "[PHONE]" placeholder or empty. */
export const isPlaceholder = (s) => !s || /^\[.*\]$/.test(s.trim())
