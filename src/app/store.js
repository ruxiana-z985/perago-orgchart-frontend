import { configureStore } from '@reduxjs/toolkit'
import { positionsApi } from '../features/positions/positionsApi.js'
import { requestsApi } from '../features/requests/requestsApi.js'
import { uiSlice } from '../features/ui/uiSlice.js'

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    [positionsApi.reducerPath]: positionsApi.reducer,
    [requestsApi.reducerPath]: requestsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(positionsApi.middleware, requestsApi.middleware),
})
