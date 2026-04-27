import {
  Box,
  Button,
  Group,
  Text,
  Skeleton,
  Stack,
  ActionIcon,
} from '@mantine/core'
import {
  IconRefresh,
  IconPlus,
  IconLayoutList,
  IconSitemap,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useGetTreeQuery } from '../features/positions/positionsApi'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { setSelectedPositionId } from '../features/ui/uiSlice'
import { OrgChartTree } from '../components/chart/OrgChartTree'
import { OrgChartDetailPanel } from '../components/chart/OrgChartDetailPanel'
import { ErrorState } from '../components/feedback/ErrorState'
import { EmptyState } from '../components/feedback/EmptyState'

export function OrgChartPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((state) => state.ui.selectedPositionId)
  const { data, isLoading, error, refetch } = useGetTreeQuery()

  const handleSelect = (id) => {
    dispatch(setSelectedPositionId(id))
  }

  const handleClosePanel = () => {
    dispatch(setSelectedPositionId(null))
  }

  const treeData = data?.data || []

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text fw={700} size="xl" className="tracking-tight">
              Organization Chart
            </Text>
            <Text c="dimmed" size="sm">
              Browse current position hierarchy
            </Text>
          </div>
          <Group gap="sm">
            <Button
              variant="default"
              size="sm"
              leftSection={<IconLayoutList size={16} />}
              onClick={() => navigate('/positions')}
            >
              Table View
            </Button>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/requests/new?action=create')}
            >
              Request Change
            </Button>
            <ActionIcon
              variant="default"
              size="sm"
              onClick={refetch}
              title="Refresh"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tree Area */}
        <Box className={`flex-1 overflow-auto px-6 pb-6 ${selectedId ? 'pr-0' : ''}`}>
          {isLoading && (
            <Stack gap="md" className="py-4">
              <Skeleton height={80} radius="md" />
              <Skeleton height={80} radius="md" />
              <Skeleton height={80} radius="md" />
            </Stack>
          )}

          {error && (
            <div className="py-4 max-w-md">
              <ErrorState error={error} onRetry={refetch} />
            </div>
          )}

          {!isLoading && !error && treeData.length === 0 && (
            <EmptyState
              title="No org chart data"
              description="There are no positions to display yet."
            />
          )}

          {!isLoading && !error && treeData.length > 0 && (
            <OrgChartTree
              data={treeData}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}
        </Box>

        {/* Detail Panel */}
        {selectedId && (
          <div className="w-full max-w-md shrink-0 border-l border-surface-200">
            <OrgChartDetailPanel positionId={selectedId} onClose={handleClosePanel} />
          </div>
        )}
      </div>
    </div>
  )
}
