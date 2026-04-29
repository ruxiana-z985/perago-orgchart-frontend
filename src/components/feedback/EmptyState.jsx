import { Paper, Text, Button, Stack } from '@mantine/core'
import { IconSearch, IconPlus } from '@tabler/icons-react'

export function EmptyState({
  title = 'No positions found',
  description = 'Get started by creating your first position.',
  showCreate = true,
  onCreate,
}) {
  return (
    <Paper className="p-10 text-center rounded-xl border border-surface-200 bg-white">
      <Stack gap="md" align="center">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center">
          <IconSearch size={28} className="text-surface-400" />
        </div>
        <Text fw={600} size="lg">{title}</Text>
        <Text c="dimmed" size="sm" className="max-w-sm">{description}</Text>
        {showCreate && (
          <Button leftSection={<IconPlus size={18} />} onClick={onCreate}>
            Create Position
          </Button>
        )}
      </Stack>
    </Paper>
  )
}