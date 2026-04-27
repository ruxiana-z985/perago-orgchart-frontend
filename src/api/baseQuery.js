import { axiosInstance } from './axios.js'

/**
 * Custom Axios base query for RTK Query.
 * @param {{ url: string, method?: string, body?: any, params?: any, headers?: any }} args
 * @param {any} api
 * @param {any} extraOptions
 */
export const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', body, params, headers }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data: body,
        params,
        headers,
      })
      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError
      return {
        error: {
          status: err.statusCode || err.response?.status,
          data: err.response?.data || err.message,
          message: typeof err.message === 'string' ? err.message : err.message?.message || 'Request failed',
          isValidationError: err.isValidationError,
        },
      }
    }
  }
