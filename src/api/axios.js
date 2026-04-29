import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://perago-chart-api.onrender.com'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const structuredError = {
      statusCode: error.response?.status || 0,
      message: error.response?.data?.message || error.message || 'An error occurred',
      error: error.response?.data?.error || 'Error',
      isValidationError: error.response?.status === 400 && typeof error.response?.data?.message === 'object',
    }
    return Promise.reject(structuredError)
  }
)