import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from './store.js'
import { router } from './router.jsx'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

export function Providers() {
  return (
    <ReduxProvider store={store}>
      <MantineProvider
        defaultColorScheme="light"
        theme={{
          primaryColor: 'blue',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        <Notifications position="top-right" />
        <ModalsProvider>
          <RouterProvider router={router} />
        </ModalsProvider>
      </MantineProvider>
    </ReduxProvider>
  )
}
