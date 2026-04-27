import { Paper, Text, Group, Badge, Box } from '@mantine/core'
import { IconBuilding } from '@tabler/icons-react'

export function SelectedPositionPreview({ position, onClear, label = 'Selected' }) {
  if (!position) return null

  return (
    <Paper className="p-4 rounded-lg border border-primary-200 bg-primary-50">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Box className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <IconBuilding size={20} className="text-primary-600" />
          </Box>
          <div>
            <Text size="sm" fw={600} className="text-primary-900">
              {label}: {position.name}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {position.path || position.description}
            </Text>
          </div>
        </Group>
        {onClear && (
          <Badge
            color="red"
            variant="light"
            className="cursor-pointer"
            onClick={onClear}
            size="sm"
          >
            Clear
          </Badge>
        )}
      </Group>
    </Paper>
  )
}
