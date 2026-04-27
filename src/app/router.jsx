import { createHashRouter, Navigate } from 'react-router-dom'
import { AppShellLayout } from '../pages/AppShellLayout.jsx'
import { OrgChartPage } from '../pages/OrgChartPage.jsx'
import { PositionsTablePage } from '../pages/PositionsTablePage.jsx'
import { PositionDetailPage } from '../pages/PositionDetailPage.jsx'
import { NewRequestPage } from '../pages/NewRequestPage.jsx'
import { RequestStatusPage } from '../pages/RequestStatusPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShellLayout />,
    children: [
      { index: true, element: <Navigate to="/chart" replace /> },
      { path: 'chart', element: <OrgChartPage /> },
      { path: 'positions', element: <PositionsTablePage /> },
      { path: 'positions/:id', element: <PositionDetailPage /> },
      { path: 'requests/new', element: <NewRequestPage /> },
      { path: 'requests/:id', element: <RequestStatusPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
