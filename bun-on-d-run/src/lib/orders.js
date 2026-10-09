// Shared status model for the ordering app (customer view) and the owner dashboard.
export const STATUSES = [
  { id: 'new', customer: 'Received', owner: 'New' },
  { id: 'preparing', customer: 'On the Grill', owner: 'Preparing' },
  { id: 'ready', customer: 'Ready for Pickup', owner: 'Ready' },
  { id: 'completed', customer: 'Picked Up', owner: 'Completed' },
]

export const statusIndex = (id) => STATUSES.findIndex((s) => s.id === id)
