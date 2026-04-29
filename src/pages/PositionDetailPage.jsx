import { useState } from 'react'
import {
  Box,
  Button,
  Group,
  Text,
  Badge,
  Paper,
  Stack,
  Breadcrumbs,
  Anchor,
  Table,
  Pagination,
  ActionIcon,
  Skeleton,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconPlus,
  IconUsers,
  IconSitemap,
  IconChevronRight,
} from '@tabler/icons-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import {
  useGetPositionQuery,
  useGetPositionChildrenQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from '../features/positions/positionsApi.js'
import { formatDate } from '../lib/format.js'
import { getErrorMessage } from '../lib/errors.js'
import { ErrorState } from '../components/feedback/ErrorState.jsx'
import { EmptyState } from '../components/feedback/EmptyState.jsx'
import { PositionFormModal } from '../components/modals/PositionFormModal'
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal'

export function PositionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [childrenPage, setChildrenPage] = useState(1)

  // Modals
  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | 'delete'
  const [createParent, setCreateParent] = useState(null)

  const [createPosition] = useCreatePositionMutation()
  const [updatePosition] = useUpdatePositionMutation()
  const [deletePosition] = useDeletePositionMutation()

  const {
    data: position,
    isLoading: posLoading,
    error: posError,
    refetch: refetchPos,
  } = useGetPositionQuery(id)

  const {
    data: childrenData,
    isLoading: childrenLoading,
    error: childrenError,
    refetch: refetchChildren,
  } = useGetPositionChildrenQuery({ id, page: childrenPage, limit: 10 })

  const handleCreateChild = () => {
    setCreateParent({ id, name: position?.name })
    setModalMode('create')
  }

  const handleEdit = () => {
    setModalMode('edit')
  }

  const handleDelete = () => {
    setModalMode('delete')
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setCreateParent(null)
  }

  const handleCreateSubmit = async (values) => {
    try {
      await createPosition({
        name: values.name,
        description: values.description,
        parentId: createParent?.id || id,
      }).unwrap()
      notifications.show({ title: 'Created', message: 'Position created.', color: 'green' })
      handleCloseModal()
      refetchPos()
      refetchChildren()
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err
    }
  }

  const handleEditSubmit = async (values) => {
    try {
      await updatePosition({
        id,
        name: values.name,
        description: values.description,
        parentId: values.parentId ?? undefined,
      }).unwrap()
      notifications.show({ title: 'Updated', message: 'Position updated.', color: 'green' })
      handleCloseModal()
      refetchPos()
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err
    }
  }

  const handleDeleteConfirm = async (reassignmentStrategy) => {
    try {
      await deletePosition({
        id,
        reassignmentStrategy: reassignmentStrategy || undefined,
      }).unwrap()
      notifications.show({ title: 'Deleted', message: 'Position deleted.', color: 'green' })
      handleCloseModal()
      navigate('/positions')
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err
    }
  }

  if (posLoading) {
    return (
      <Box className="p-6 max-w-5xl">
        <Skeleton height={32} width="40%" className="mb-4" />
        <Skeleton height={200} radius="md" className="mb-4" />
        <Skeleton height={120} radius="md" />
      </Box>
    )
  }

  if (posError) {
    return (
      <Box className="p-6 max-w-2xl">
        <Button leftSection={<IconArrowLeft size={16} />} variant="subtle" onClick={() => navigate(-1)} className="mb-4">
          Back
        </Button>
        <ErrorState error={posError} onRetry={refetchPos} title="Failed to load position" />
      </Box>
    )
  }

  if (!position) {
    return (
      <Box className="p-6">
        <EmptyState title="Position not found" description="The position does not exist." showCreate={false} />
      </Box>
    )
  }

  const children = childrenData?.data || []
  const childrenPagination = childrenData?.pagination

  return (
    <Box className="p-6 max-w-5xl">
      <Button leftSection={<IconArrowLeft size={16} />} variant="subtle" onClick={() => navigate(-1)} className="mb-4">
        Back
      </Button>

      <Stack gap="lg">
        {position.ancestors && position.ancestors.length > 0 && (
          <Breadcrumbs separator={<IconChevronRight size={14} className="text-surface-400" />}>
            {position.ancestors.map((a) => (
              <Anchor key={a.id} component={Link} to={`/positions/${a.id}`} size="sm">
                {a.name}
              </Anchor>
            ))}
            <Text size="sm" fw={500}>{position.name}</Text>
          </Breadcrumbs>
        )}

        <Group justify="space-between" wrap="wrap" gap="sm">
          <div>
            <Text fw={800} size="32px" className="tracking-tight mb-1">{position.name}</Text>
            <Text c="dimmed" size="sm">{position.path}</Text>
          </div>
          <Group gap="sm">
            <Button leftSection={<IconPlus size={16} />} variant="light" color="green" size="sm" onClick={handleCreateChild}>
              Add Child
            </Button>
            <Button leftSection={<IconEdit size={16} />} variant="light" color="blue" size="sm" onClick={handleEdit}>
              Edit
            </Button>
            <Button leftSection={<IconTrash size={16} />} variant="light" color="red" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Group>

        <Paper className="rounded-xl border border-surface-200 bg-white p-6">
          <Stack gap="md">
            {position.description && (
              <div>
                <Text fw={600} size="sm" className="mb-1 uppercase tracking-wider text-surface-500">Description</Text>
                <Text size="sm" className="leading-relaxed">{position.description}</Text>
              </div>
            )}
            <Group gap="lg" wrap>
              <div>
                <Text fw={600} size="sm" className="mb-1 uppercase tracking-wider text-surface-500">Depth</Text>
                <Badge variant="light" color="blue" leftSection={<IconSitemap size={12} />}>{position.depth}</Badge>
              </div>
              <div>
                <Text fw={600} size="sm" className="mb-1 uppercase tracking-wider text-surface-500">Direct Children</Text>
                <Badge variant="light" color="teal" leftSection={<IconUsers size={12} />}>{position.childrenCount}</Badge>
              </div>
              <div>
                <Text fw={600} size="sm" className="mb-1 uppercase tracking-wider text-surface-500">Total Descendants</Text>
                <Badge variant="light" color="grape" leftSection={<IconUsers size={12} />}>{position.descendantCount}</Badge>
              </div>
              <div>
                <Text fw={600} size="sm" className="mb-1 uppercase tracking-wider text-surface-500">Created</Text>
                <Text size="sm">{formatDate(position.createdAt)}</Text>
              </div>
              <div>
                <Text fw={600} size="sm" className="mb-1 uppercase tracking-wider text-surface-500">Updated</Text>
                <Text size="sm">{formatDate(position.updatedAt)}</Text>
              </div>
            </Group>
          </Stack>
        </Paper>

        {/* Children Section */}
        <Paper className="rounded-xl border border-surface-200 bg-white p-6">
          <Group justify="space-between" mb="md">
            <Text fw={700} size="md">Direct Children</Text>
            <Badge variant="light" color="gray" size="sm">{position.childrenCount} total</Badge>
          </Group>

          {childrenLoading && <Stack gap="sm"><Skeleton height={48} /><Skeleton height={48} /></Stack>}
          {childrenError && <ErrorState error={childrenError} onRetry={refetchChildren} title="Failed to load children" />}
          {!childrenLoading && !childrenError && children.length === 0 && <Text c="dimmed" size="sm">No direct children.</Text>}
          {!childrenLoading && !childrenError && children.length > 0 && (
            <>
              <Table className="text-sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Children</Table.Th>
                    <Table.Th className="w-24">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {children.map((child) => (
                    <Table.Tr key={child.id} className="cursor-pointer" onClick={() => navigate(`/positions/${child.id}`)}>
                      <Table.Td><Text fw={500}>{child.name}</Text></Table.Td>
                      <Table.Td><Text size="sm" c="dimmed" lineClamp={1}>{child.description}</Text></Table.Td>
                      <Table.Td>{child.childrenCount}</Table.Td>
                      <Table.Td>
                        <ActionIcon variant="subtle" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/positions/${child.id}`) }}>
                          <IconArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              {childrenPagination && childrenPagination.total > childrenPagination.limit && (
                <Group justify="center" mt="md">
                  <Pagination value={childrenPage} onChange={setChildrenPage} total={Math.ceil(childrenPagination.total / childrenPagination.limit)} size="sm" />
                </Group>
              )}
            </>
          )}
        </Paper>

        {position.siblings && position.siblings.length > 0 && (
          <Paper className="rounded-xl border border-surface-200 bg-white p-6">
            <Text fw={700} size="md" mb="md">Siblings</Text>
            <Group gap="sm" wrap>
              {position.siblings.map((sibling) => (
                <Badge key={sibling.id} variant="light" color="gray" size="md" className="cursor-pointer hover:bg-surface-200 transition-colors" onClick={() => navigate(`/positions/${sibling.id}`)}>
                  {sibling.name}
                </Badge>
              ))}
            </Group>
          </Paper>
        )}
      </Stack>

      {/* Modals */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <PositionFormModal
          opened={true}
          onClose={handleCloseModal}
          mode={modalMode}
          position={modalMode === 'edit' ? position : createParent}
          onSubmit={modalMode === 'create' ? handleCreateSubmit : handleEditSubmit}
        />
      )}
      {modalMode === 'delete' && (
        <DeleteConfirmModal
          opened={true}
          onClose={handleCloseModal}
          position={position}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Box>
  )
}