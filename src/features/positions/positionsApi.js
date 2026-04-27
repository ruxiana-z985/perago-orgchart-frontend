import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../../api/baseQuery.js'

export const positionsApi = createApi({
  reducerPath: 'positionsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Position', 'Tree', 'Children', 'Search'],
  endpoints: (builder) => ({
    getTree: builder.query({
      query: () => ({ url: '/positions?format=tree', method: 'GET' }),
      providesTags: ['Tree'],
    }),
    getPositions: builder.query({
      query: ({ page = 1, limit = 50, sortBy = 'name', search = '' } = {}) => ({
        url: '/positions',
        method: 'GET',
        params: { page, limit, sortBy, search },
      }),
      providesTags: ['Position'],
    }),
    getPosition: builder.query({
      query: (id) => ({ url: `/positions/${id}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Position', id }],
    }),
    getPositionChildren: builder.query({
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/positions/${id}/children`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Children', id }],
    }),
    searchPositions: builder.query({
      query: (q) => ({ url: '/search', method: 'GET', params: { q } }),
      providesTags: ['Search'],
    }),
  }),
})

export const {
  useGetTreeQuery,
  useGetPositionsQuery,
  useGetPositionQuery,
  useGetPositionChildrenQuery,
  useSearchPositionsQuery,
  useLazySearchPositionsQuery,
  useLazyGetPositionQuery,
} = positionsApi
