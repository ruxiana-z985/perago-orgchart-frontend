import { Box, Button, Text, Paper, Stack } from '@mantine/core'
import { IconHome, IconMapOff } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Box className="h-full flex items-center justify-center p-6">
      <Paper className="p-10 text-center rounded-xl border border-surface-200 bg-white max-w-md">
        <Stack gap="md" align="center">
          <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center">
            <IconMapOff size={32} className="text-surface-400" />
          </div>
          <Text fw={700} size="xl">
            Page Not Found
          </Text>
          <Text c="dimmed" size="sm">
            The page you are looking for does not exist or has been moved.
          </Text>
          <Button leftSection={<IconHome size={18} />} component={Link} to="/">
            Go Home
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
