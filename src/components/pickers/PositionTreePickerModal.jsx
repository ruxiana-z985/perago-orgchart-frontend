import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Stack,
  Text,
  Box,
  ScrollArea,
  UnstyledButton,
  Group,
  ActionIcon,
  Collapse,
} from '@mantine/core'
import { IconChevronDown, IconChevronRight, IconBuilding } from '@tabler/icons-react'
import { useGetTreeQuery } from '../../features/positions/positionsApi.js'
import { LoadingState } from '../feedback/LoadingState.jsx'
import { ErrorState } from '../feedback/ErrorState.jsx'

function TreePickerNode({ node, selectedId, onSelect, expandedIds, onToggle }) {
  const isExpanded = expandedIds[node.id] ?? true
  const isSelected = selectedId === node.id
  const hasChildren = node.children && node.children.length > 0

  return (
    <Box className="relative">
      <UnstyledButton
        onClick={() => onSelect(node)}
        className={`w-full rounded-lg px-3 py-2 flex items-center gap-2 transition-colors ${
          isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-surface-50'
        }`}
      >
        {hasChildren && (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            className="shrink-0"
          >
            {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </ActionIcon>
        )}
        {!hasChildren && <Box className="w-7" />}
        <IconBuilding size={16} className={isSelected ? 'text-primary-600' : 'text-surface-400'} />
        <div className="flex-1 min-w-0 text-left">
          <Text size="sm" fw={isSelected ? 600 : 400} truncate>
            {node.name}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {node.path}
          </Text>
        </div>
      </UnstyledButton>

      {hasChildren && (
        <Collapse in={isExpanded}>
          <Box className="pl-6 border-l border-surface-200 ml-4 mt-1">
            {node.children.map((child) => (
              <TreePickerNode
                key={child.id}
                node={child}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                onToggle={onToggle}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  )
}

export function PositionTreePickerModal({ opened, onClose, onSelect, selectedId, excludeId }) {
  const { data, isLoading, error, refetch } = useGetTreeQuery()
  const [expandedIds, setExpandedIds] = useState({})

  // Initialize expanded state when data loads
  useEffect(() => {
    if (data?.data) {
      const initial = {}
      const expandAll = (nodes) => {
        nodes?.forEach((node) => {
          initial[node.id] = true
          expandAll(node.children)
        })
      }
      expandAll(data.data)
      setExpandedIds(initial)
    }
  }, [data])

  const handleToggle = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSelect = (node) => {
    if (node.id === excludeId) return
    onSelect(node)
    onClose()
  }

  const treeData = (data?.data || []).filter((n) => n.id !== excludeId)

  return (
    <Modal opened={opened} onClose={onClose} title="Select from Org Chart" size="lg">
      <Box className="min-h-80">
        {isLoading && <LoadingState count={4} />}
        {error && <ErrorState error={error} onRetry={refetch} />}
        {!isLoading && !error && treeData.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            No positions available.
          </Text>
        )}
        {!isLoading && !error && treeData.length > 0 && (
          <ScrollArea className="max-h-96">
            <Stack gap="xs">
              {treeData.map((node) => (
                <TreePickerNode
                  key={node.id}
                  node={node}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                />
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Box>
    </Modal>
  )
}
