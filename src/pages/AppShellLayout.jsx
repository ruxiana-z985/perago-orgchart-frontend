import {
  AppShell,
  Burger,
  Button,
  Group,
  ScrollArea,
  Text,
  UnstyledButton,
  Divider,
  Box,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChartDots,
  IconList,
  IconSearch,
} from '@tabler/icons-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { GlobalSearchModal } from '../components/pickers/GlobalSearchModal.jsx'

const navItems = [
  { label: 'Org Chart', to: '/chart', icon: IconChartDots },
  { label: 'Positions', to: '/positions', icon: IconList },
]

export function AppShellLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const [searchOpen, { open: openSearch, close: closeSearch }] = useDisclosure(false)
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/chart') return location.pathname === '/chart' || location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 260,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >
        <AppShell.Header className="border-b border-surface-200 bg-white">
          <Group h="100%" px="md" justify="space-between">
            <Group gap="sm">
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
              <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <IconChartDots size={18} className="text-white" />
                </div>
                <Text fw={700} size="lg" className="tracking-tight">Perago OrgChart</Text>
              </div>
            </Group>
            <Group gap="sm">
              <Button variant="light" leftSection={<IconSearch size={16} />} onClick={openSearch} size="sm" className="hidden sm:flex">
                Search
              </Button>
              <Button variant="subtle" size="sm" onClick={openSearch} className="sm:hidden">
                <IconSearch size={20} />
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" className="border-r border-surface-200 bg-white">
          <ScrollArea>
            <Box className="mb-4">
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider px-2 mb-2">Navigation</Text>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)
                return (
                  <UnstyledButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    onClick={() => closeMobile()}
                    className={`w-full rounded-lg px-3 py-2.5 mb-1 flex items-center gap-3 transition-colors ${
                      active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-surface-700 hover:bg-surface-100'
                    }`}
                  >
                    <Icon size={18} />
                    <Text size="sm">{item.label}</Text>
                  </UnstyledButton>
                )
              })}
            </Box>
          </ScrollArea>
        </AppShell.Navbar>

        <AppShell.Main className="bg-surface-50 min-h-screen">
          <Outlet />
        </AppShell.Main>
      </AppShell>

      <GlobalSearchModal opened={searchOpen} onClose={closeSearch} />
    </>
  )
}