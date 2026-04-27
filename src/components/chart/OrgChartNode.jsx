import { useNavigate } from 'react-router-dom'
import {
  Box,
  Group,
  Text,
  Badge,
  ActionIcon,
} from '@mantine/core'
import {
  IconChevronDown,
  IconChevronRight,
  IconUsers,
} from '@tabler/icons-react'
import { useAppSelector, useAppDispatch } from '../../app/hooks.js'
import { toggleExpandedNode } from '../../features/ui/uiSlice.js'

/**
 * Single org chart node with expand/collapse and click selection.
 */
export function OrgChartNode({ node, selectedId, onSelect, level = 0 }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const expandedNodeIds = useAppSelector((state) => state.ui.chartExpandedNodeIds)
  const isExpanded = expandedNodeIds[node.id] ?? true
  const isSelected = selectedId === node.id
  const hasChildren = node.children && node.children.length > 0

  console.log('Node:', node.name, 'hasChildren:', hasChildren, 'children:', node.children?.length)

  const handleToggle = (e) => {
    e.stopPropagation()
    dispatch(toggleExpandedNode(node.id))
  }

  const handleClick = () => {
    onSelect(node.id)
  }

  const handleRequestChild = (e) => {
    e.stopPropagation()
    navigate(`/requests/new?action=create&parent=${node.id}`)
  }

  return (
    <Box className="relative">
      <Box
        onClick={handleClick}
        className={`relative rounded-xl border transition-all cursor-pointer select-none ${
          isSelected
            ? 'border-primary-400 bg-primary-50 shadow-sm ring-1 ring-primary-300'
            : 'border-surface-200 bg-white hover:border-primary-300 hover:shadow-sm'
        }`}
        style={{ marginLeft: level > 0 ? 24 : 0 }}
      >
        {/* Connector line from parent */}
        {level > 0 && (
          <div
            className="absolute -left-3 top-6 w-3 h-px bg-surface-300"
            style={{ marginLeft: -12 }}
          />
        )}

        <div className="p-4">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              {hasChildren && (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={handleToggle}
                  className="shrink-0"
                >
                  {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                </ActionIcon>
              )}
              {!hasChildren && <Box className="w-6" />}

              <div>
                <Text fw={600} size="sm" className={isSelected ? 'text-primary-800' : ''}>
                  {node.name}
                </Text>
                {node.description && (
                  <Text size="xs" c="dimmed" lineClamp={1} className="max-w-xs">
                    {node.description}
                  </Text>
                )}
              </div>
            </Group>

            <Group gap="xs" wrap="nowrap">
              {hasChildren && (
                <Badge size="xs" variant="light" color="blue" leftSection={<IconUsers size={10} />}>
                  {node.children.length}
                </Badge>
              )}
            </Group>
          </Group>
        </div>
      </Box>

      {/* Children - always render if hasChildren */}
      {node.children && node.children.length > 0 && (
        <Box className="relative pt-3 pl-6" style={{ display: isExpanded ? 'block' : 'none' }}>
          {/* Vertical line connecting children */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-surface-200" />

            {node.children.map((child) => (
              <div key={child.id} className="relative mb-2">
                {/* Horizontal connector to child */}
                <div className="absolute -left-3 top-6 w-3 h-px bg-surface-200" />
                <OrgChartNode
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  level={level + 1}
                />
              </div>
            ))}
        </Box>
      )}
    </Box>
  )
}
