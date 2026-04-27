/**
 * Extract a human-readable message from an API error.
 */
export function getErrorMessage(error) {
  if (!error) return 'Unknown error'

  // RTK Query error shape
  if (error.data) {
    if (typeof error.data.message === 'string') {
      return error.data.message
    }
    if (typeof error.data.message === 'object' && error.data.message?.message) {
      return error.data.message.message
    }
    if (error.data.error) {
      return error.data.error
    }
  }

  if (typeof error.message === 'string') {
    if (error.message === 'Network Error') {
      return 'Network error. If running in production, ensure the API server allows CORS from this origin. For local development, confirm the API is running.'
    }
    return error.message
  }

  if (error.status) {
    return `Error ${error.status}`
  }

  return 'Something went wrong'
}
