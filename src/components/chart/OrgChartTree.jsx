import { Box } from '@mantine/core'
import { OrgChartNode } from './OrgChartNode.jsx'

export function OrgChartTree({ data, selectedId, onSelect }) {
  console.log('OrgChartTree data:', data)
  if (!data || data.length === 0) return null

  return (
    <Box className="py-4">
      {data.map((node) => (
        <OrgChartNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          level={0}
        />
      ))}
    </Box>
  )
}
