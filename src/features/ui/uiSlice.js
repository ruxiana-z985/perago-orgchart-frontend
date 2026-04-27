import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selectedPositionId: null,
  chartExpandedNodeIds: {},
  chartViewMode: 'tree',
  searchOpen: false,
  sidebarCollapsed: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedPositionId: (state, action) => {
      state.selectedPositionId = action.payload
    },
    setChartExpandedNodeIds: (state, action) => {
      state.chartExpandedNodeIds = action.payload
    },
    toggleExpandedNode: (state, action) => {
      const id = action.payload
      state.chartExpandedNodeIds[id] = !state.chartExpandedNodeIds[id]
    },
    expandNode: (state, action) => {
      state.chartExpandedNodeIds[action.payload] = true
    },
    collapseNode: (state, action) => {
      state.chartExpandedNodeIds[action.payload] = false
    },
    setChartViewMode: (state, action) => {
      state.chartViewMode = action.payload
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    resetUi: () => initialState,
  },
})

export const {
  setSelectedPositionId,
  setChartExpandedNodeIds,
  toggleExpandedNode,
  expandNode,
  collapseNode,
  setChartViewMode,
  setSearchOpen,
  toggleSidebar,
  resetUi,
} = uiSlice.actions
