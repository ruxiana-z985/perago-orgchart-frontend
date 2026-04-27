import dayjs from 'dayjs'

export function formatDate(isoString) {
  if (!isoString) return '—'
  return dayjs(isoString).format('MMM D, YYYY h:mm A')
}

export function formatDateShort(isoString) {
  if (!isoString) return '—'
  return dayjs(isoString).format('MMM D, YYYY')
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '—'
  return dayjs(isoString).fromNow()
}
