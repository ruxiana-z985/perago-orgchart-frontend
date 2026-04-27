import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../../api/baseQuery.js'

export const requestsApi = createApi({
  reducerPath: 'requestsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Request'],
  endpoints: (builder) => ({
    submitRequest: builder.mutation({
      query: (body) => ({
        url: '/requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Request'],
    }),
    getRequest: builder.query({
      query: (id) => ({ url: `/requests/${id}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Request', id }],
    }),
    confirmRequest: builder.mutation({
      query: (id) => ({
        url: `/requests/${id}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Request', id }],
    }),
    approveRequest: builder.mutation({
      query: (id) => ({
        url: `/requests/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Request', id }],
    }),
    rejectRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/requests/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Request', id }],
    }),
  }),
})

export const {
  useSubmitRequestMutation,
  useGetRequestQuery,
  useConfirmRequestMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
} = requestsApi
