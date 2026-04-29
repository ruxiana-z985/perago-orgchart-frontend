import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Group,
  Text,
  TextInput,
  Select,
  Table,
  Pagination,
  Badge,
  ActionIcon,
  Menu,
  Paper,
} from '@mantine/core'
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { useGetPositionsQuery, useDeletePositionMutation } from '../features/positions/positionsApi'
import { formatDateShort } from '../lib/format'
import { getErrorMessage } from '../lib/errors'
import { ErrorState } from '../components/feedback/ErrorState'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'
import { PositionFormModal } from '../components/modals/PositionFormModal'
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal'

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'depth', label: 'Depth' },
]

const limitOptions = [
  { value: '10', label: '10 per page' },
  { value: '25', label: '25 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' },
]

export function PositionsTablePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10))
  const sortBy = searchParams.get('sortBy') || 'name'
  const search = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(search)

  // Modal states
  const [modalMode, setModalMode] = useState(null) // 'create' | 'edit' | 'delete'
  const [selectedPosition, setSelectedPosition] = useState(null)

  const [deletePosition] = useDeletePositionMutation()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        const next = new URLSearchParams(searchParams)
        if (searchInput.trim()) {
          next.set('search', searchInput.trim())
          next.set('page', '1')
        } else {
          next.delete('search')
        }
        setSearchParams(next, { replace: true })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, error, refetch } = useGetPositionsQuery({
    page,
    limit,
    sortBy,
    search: search.trim(),
  })

  const positions = data?.data || []
  const pagination = data?.pagination

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, String(value))
      if (key !== 'page') next.set('page', '1')
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const handleCreate = () => {
    setSelectedPosition(null)
    setModalMode('create')
  }

  const handleEdit = (pos) => {
    setSelectedPosition(pos)
    setModalMode('edit')
  }

  const handleDelete = (pos) => {
    setSelectedPosition(pos)
    setModalMode('delete')
  }

  const handleCloseModal = () => {
    setModalMode(null)
    setSelectedPosition(null)
  }

  const handleDeleteConfirm = async (reassignmentStrategy) => {
    try {
      await deletePosition({
        id: selectedPosition.id,
        reassignmentStrategy: reassignmentStrategy || undefined,
      }).unwrap()
      notifications.show({ title: 'Deleted', message: 'Position deleted.', color: 'green' })
      handleCloseModal()
      refetch()
    } catch (err) {
      notifications.show({ title: 'Failed', message: getErrorMessage(err), color: 'red' })
      throw err
    }
  }

  return (
    <Box className="p-6">
      <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
        <div>
          <Text fw={700} size="xl" className="tracking-tight">Positions</Text>
          <Text c="dimmed" size="sm">Browse all active positions in list view</Text>
        </div>
        <Group gap="sm">
          <Button variant="light" size="sm" leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add Position
          </Button>
          <ActionIcon variant="default" size="sm" onClick={refetch} title="Refresh">
            <IconRefresh size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Paper className="rounded-xl border border-surface-200 bg-white overflow-hidden mb-4">
        <Group p="md" gap="sm" wrap="wrap">
          <TextInput
            placeholder="Search by name..."
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            className="w-64"
            size="sm"
          />
          <Select
            placeholder="Sort by"
            data={sortOptions}
            value={sortBy}
            onChange={(val) => updateParam('sortBy', val)}
            size="sm"
            className="w-40"
          />
          <Select
            placeholder="Per page"
            data={limitOptions}
            value={String(limit)}
            onChange={(val) => updateParam('limit', val)}
            size="sm"
            className="w-36"
          />
        </Group>

        {isLoading && <Box p="md"><LoadingState count={5} /></Box>}
        {error && <Box p="md"><ErrorState error={error} onRetry={refetch} /></Box>}
        {!isLoading && !error && positions.length === 0 && (
          <Box p="xl">
            <EmptyState
              title="No positions found"
              description={search ? 'Try adjusting your search.' : 'There are no positions yet.'}
              showCreate={!search}
            />
          </Box>
        )}
        {!isLoading && !error && positions.length > 0 && (
          <Table striped highlightOnHover className="text-sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Path</Table.Th>
                <Table.Th>Depth</Table.Th>
                <Table.Th>Children</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th className="w-24">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {positions.map((pos) => (
                <Table.Tr key={pos.id} className="cursor-pointer" onClick={() => navigate(`/positions/${pos.id}`)}>
                  <Table.Td><Text fw={500}>{pos.name}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed" lineClamp={1} className="max-w-xs">{pos.description}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{pos.path}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color="blue" size="sm">{pos.depth}</Badge></Table.Td>
                  <Table.Td>{pos.childrenCount}</Table.Td>
                  <Table.Td>{formatDateShort(pos.createdAt)}</Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width={200} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm" onClick={(e) => e.stopPropagation()}>
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />} onClick={(e) => { e.stopPropagation(); navigate(`/positions/${pos.id}`) }}>
                          View Details
                        </Menu.Item>
                        <Menu.Item leftSection={<IconUserPlus size={14} />} onClick={(e) => { e.stopPropagation(); setSelectedPosition(pos); setModalMode('create') }}>
                          Add Child
                        </Menu.Item>
                        <Menu.Item leftSection={<IconEdit size={14} />} onClick={(e) => { e.stopPropagation(); handleEdit(pos) }}>
                          Edit
                        </Menu.Item>
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={(e) => { e.stopPropagation(); handleDelete(pos) }}>
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        {pagination && pagination.totalPages > 1 && (
          <Group p="md" justify="center">
            <Pagination value={page} onChange={(p) => updateParam('page', p)} total={pagination.totalPages} size="sm" />
          </Group>
        )}
      </Paper>

      {/* Modals */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <PositionFormModal
          opened={true}
          onClose={handleCloseModal}
          mode={modalMode}
          position={modalMode === 'edit' ? selectedPosition : selectedPosition}
          onSubmit={async (values) => {
            // This is handled by the parent but we don't need it here since PositionFormModal
            // doesn't do API calls itself - the parent handles it.
            // For table page, we just close and refetch
            handleCloseModal()
            refetch()
          }}
        />
      )}
      {modalMode === 'delete' && selectedPosition && (
        <DeleteConfirmModal
          opened={true}
          onClose={handleCloseModal}
          position={selectedPosition}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </Box>
  )
}