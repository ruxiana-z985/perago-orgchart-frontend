import {
  Paper,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  Divider,
  Skeleton,
  ScrollArea,
  Box,
} from '@mantine/core'
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconExternalLink,
  IconUsers,
  IconSitemap,
  IconArrowUpRight,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useGetPositionQuery } from '../../features/positions/positionsApi.js'
import { formatDate } from '../../lib/format.js'

export function OrgChartDetailPanel({ positionId, onClose, onCreateChild, onEdit, onDelete }) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetPositionQuery(positionId, {
    skip: !positionId,
  })

  const position = data

  if (!positionId) return null

  return (
    <Paper className="h-full w-full max-w-md bg-white border-l border-surface-200 flex flex-col rounded-none">
      <div className="p-5 border-b border-surface-100">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={700} size="lg" className="tracking-tight">
            Position Details
          </Text>
          {onClose && (
            <Button variant="subtle" size="xs" onClick={onClose}>
              Close
            </Button>
          )}
        </Group>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5">
          {isLoading && (
            <Stack gap="md">
              <Skeleton height={24} width="60%" />
              <Skeleton height={16} width="80%" />
              <Skeleton height={16} width="40%" />
              <Divider />
              <Skeleton height={60} />
              <Skeleton height={60} />
            </Stack>
          )}

          {error && (
            <Text c="red" size="sm">
              Failed to load details.
            </Text>
          )}

          {position && (
            <Stack gap="lg">
              <div>
                <Text fw={700} size="xl" className="mb-1">
                  {position.name}
                </Text>
                <Text c="dimmed" size="sm">
                  {position.path}
                </Text>
              </div>

              {position.description && (
                <Text size="sm" className="leading-relaxed text-surface-700">
                  {position.description}
                </Text>
              )}

              <Group gap="xs">
                <Badge variant="light" color="blue" leftSection={<IconSitemap size={12} />}>
                  Depth: {position.depth}
                </Badge>
                <Badge variant="light" color="teal" leftSection={<IconUsers size={12} />}>
                  {position.childrenCount} children
                </Badge>
                <Badge variant="light" color="grape" leftSection={<IconUsers size={12} />}>
                  {position.descendantCount} descendants
                </Badge>
              </Group>

              <Divider />

              {position.ancestors && position.ancestors.length > 0 && (
                <Box>
                  <Text fw={600} size="sm" className="mb-2">
                    Hierarchy
                  </Text>
                  <Stack gap="xs">
                    {position.ancestors.map((ancestor) => (
                      <Group key={ancestor.id} gap="xs">
                        <IconArrowUpRight size={14} className="text-surface-400" />
                        <Text size="sm">{ancestor.name}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              )}

              {position.siblings && position.siblings.length > 0 && (
                <Box>
                  <Text fw={600} size="sm" className="mb-2">
                    Siblings
                  </Text>
                  <Group gap="xs" wrap>
                    {position.siblings.map((sibling) => (
                      <Badge key={sibling.id} variant="light" color="gray" size="sm">
                        {sibling.name}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              )}

              <Divider />

              <Stack gap="xs">
                <Text size="xs" c="dimmed">
                  Created: {formatDate(position.createdAt)}
                </Text>
                <Text size="xs" c="dimmed">
                  Updated: {formatDate(position.updatedAt)}
                </Text>
              </Stack>

              <Divider />

              <Stack gap="sm">
                <Button
                  leftSection={<IconPlus size={16} />}
                  variant="light"
                  color="green"
                  fullWidth
                  onClick={() => onCreateChild?.(position)}
                >
                  Add Child Position
                </Button>
                <Button
                  leftSection={<IconEdit size={16} />}
                  variant="light"
                  color="blue"
                  fullWidth
                  onClick={() => onEdit?.(position)}
                >
                  Edit Position
                </Button>
                <Button
                  leftSection={<IconTrash size={16} />}
                  variant="light"
                  color="red"
                  fullWidth
                  onClick={() => onDelete?.(position)}
                >
                  Delete Position
                </Button>
                <Button
                  leftSection={<IconExternalLink size={16} />}
                  variant="default"
                  fullWidth
                  onClick={() => navigate(`/positions/${position.id}`)}
                >
                  Open Full Details
                </Button>
              </Stack>
            </Stack>
          )}
        </div>
      </ScrollArea>
    </Paper>
  )
}