import { useState } from 'react'
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
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { useGetTreeQuery, useCreatePositionMutation, useUpdatePositionMutation, useDeletePositionMutation } from '../features/positions/positionsApi'
import { useAppSelector, useAppDispatch } from '../app/hooks'
import { setSelectedPositionId } from '../features/ui/uiSlice'
import { OrgChartTree } from '../components/chart/OrgChartTree'
import { OrgChartDetailPanel } from '../components/chart/OrgChartDetailPanel'
import { ErrorState } from '../components/feedback/ErrorState'
import { EmptyState } from '../components/feedback/EmptyState'
import { PositionFormModal } from '../components/modals/PositionFormModal'
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal'
import { getErrorMessage } from '../lib/errors'

export function OrgChartPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((state) => state.ui.selectedPositionId)
  const { data, isLoading, error, refetch } = useGetTreeQuery()

  const [createPosition] = useCreatePositionMutation()
  const [updatePosition] = useUpdatePositionMutation()
  const [deletePosition] = useDeletePositionMutation()

  // Modal states
  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | 'delete'
  const [modalPosition, setModalPosition] = useState(null) // position context for the modal

  const handleSelect = (id) => {
    dispatch(setSelectedPositionId(id))
  }

  const handleClosePanel = () => {
    dispatch(setSelectedPositionId(null))
  }

  const handleCreateChild = (parent) => {
    setModalPosition(parent)
    setModalMode('create')
  }

  const handleEdit = (position) => {
    setModalPosition(position)
    setModalMode('edit')
  }

  const handleDelete = (position) => {
    setModalPosition(position)
    setModalMode('delete')
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setModalPosition(null)
  }

  const handleCreateSubmit = async (values) => {
    try {
      await createPosition({
        name: values.name,
        description: values.description,
        parentId: modalPosition?.id || null,
      }).unwrap()
      notifications.show({ title: 'Created', message: 'Position created successfully.', color: 'green' })
      handleCloseModal()
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err // re-throw so the form knows it failed
    }
  }

  const handleEditSubmit = async (values) => {
    try {
      await updatePosition({
        id: modalPosition.id,
        name: values.name,
        description: values.description,
        parentId: values.parentId ?? undefined,
      }).unwrap()
      notifications.show({ title: 'Updated', message: 'Position updated successfully.', color: 'green' })
      handleCloseModal()
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err
    }
  }

  const handleDeleteConfirm = async (reassignmentStrategy) => {
    try {
      await deletePosition({
        id: modalPosition.id,
        reassignmentStrategy: reassignmentStrategy || undefined,
      }).unwrap()
      notifications.show({ title: 'Deleted', message: 'Position deleted successfully.', color: 'green' })
      if (selectedId === modalPosition.id) {
        dispatch(setSelectedPositionId(null))
      }
      handleCloseModal()
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err
    }
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
              Browse and manage position hierarchy
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
              onClick={() => {
                setModalPosition(null)
                setModalMode('create')
              }}
            >
              Add Position
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

        {selectedId && (
          <div className="w-full max-w-md shrink-0 border-l border-surface-200">
            <OrgChartDetailPanel
              positionId={selectedId}
              onClose={handleClosePanel}
              onCreateChild={handleCreateChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <PositionFormModal
          opened={true}
          onClose={handleCloseModal}
          mode={modalMode}
          position={modalPosition}
          onSubmit={modalMode === 'create' ? handleCreateSubmit : handleEditSubmit}
        />
      )}

      {/* Delete Modal */}
      {modalMode === 'delete' && modalPosition && (
        <DeleteConfirmModal
          opened={true}
          onClose={handleCloseModal}
          position={modalPosition}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}