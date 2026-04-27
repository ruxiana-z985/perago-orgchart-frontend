export const STATUS_CONFIG = {
  'pending-confirmation': {
    label: 'Pending Confirmation',
    color: 'yellow',
    headline: 'Check your email to confirm this request',
  },
  'pending-approval': {
    label: 'Pending Approval',
    color: 'orange',
    headline: 'Request confirmed and waiting for approver',
  },
  approved: {
    label: 'Approved',
    color: 'teal',
    headline: 'Request approved, awaiting execution',
  },
  executed: {
    label: 'Executed',
    color: 'green',
    headline: 'Request approved and applied',
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    headline: 'Request rejected',
  },
  expired: {
    label: 'Expired',
    color: 'gray',
    headline: 'Request expired before completion',
  },
}

export const ACTION_CONFIG = {
  create: { label: 'Create Position', color: 'green' },
  update: { label: 'Update Position', color: 'blue' },
  delete: { label: 'Delete Position', color: 'red' },
}

export const EVENT_CONFIG = {
  submitted: { label: 'Submitted', color: 'blue' },
  confirmed: { label: 'Confirmed', color: 'yellow' },
  approved: { label: 'Approved', color: 'teal' },
  rejected: { label: 'Rejected', color: 'red' },
  executed: { label: 'Executed', color: 'green' },
}
