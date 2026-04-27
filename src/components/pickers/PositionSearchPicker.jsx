import { useState, useEffect } from 'react'
import {
  Box,
  TextInput,
  Stack,
  Group,
  Text,
  Badge,
  ScrollArea,
  UnstyledButton,
  Paper,
  Loader,
} from '@mantine/core'
import { IconSearch, IconBuilding } from '@tabler/icons-react'
import { useLazySearchPositionsQuery } from '../../features/positions/positionsApi.js'

export function PositionSearchPicker({ onSelect, selectedId, excludeId, label = 'Search position' }) {
  const [query, setQuery] = useState('')
  const [triggerSearch, { data, isFetching, error }] = useLazySearchPositionsQuery()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        triggerSearch(query.trim())
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, triggerSearch])

  const results = (data?.data || []).filter((item) => item.id !== excludeId)

  return (
    <Box>
      <Text size="sm" fw={500} className="mb-1">
        {label}
      </Text>
      <TextInput
        placeholder="Type at least 2 characters..."
        leftSection={<IconSearch size={16} />}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        size="md"
        className="rounded-lg"
      />

      {isFetching && (
        <Group gap="xs" py="sm">
          <Loader size="xs" />
          <Text size="xs" c="dimmed">
            Searching...
          </Text>
        </Group>
      )}

      {error && (
        <Text c="red" size="xs" py="sm">
          Search failed
        </Text>
      )}

      {!isFetching && query.trim().length >= 2 && results.length === 0 && (
        <Text c="dimmed" size="xs" py="sm">
          No results
        </Text>
      )}

      {results.length > 0 && (
        <Paper className="border border-surface-200 mt-1 rounded-lg overflow-hidden">
          <ScrollArea className="max-h-60">
            <Stack gap={0}>
              {results.map((item) => (
                <UnstyledButton
                  key={item.id}
                  onClick={() => {
                    onSelect(item)
                    setQuery('')
                  }}
                  className={`w-full p-3 flex items-center gap-3 transition-colors border-b border-surface-100 last:border-0 ${
                    selectedId === item.id ? 'bg-primary-50' : 'hover:bg-surface-50'
                  }`}
                >
                  <Box className="w-8 h-8 rounded-md bg-primary-100 flex items-center justify-center shrink-0">
                    <IconBuilding size={16} className="text-primary-600" />
                  </Box>
                  <div className="flex-1 min-w-0">
                    <Text size="sm" fw={500} truncate>
                      {item.name}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {item.path}
                    </Text>
                  </div>
                  <Badge size="xs" variant="light" color={item.matchType === 'exact' ? 'green' : 'gray'}>
                    {item.matchType}
                  </Badge>
                </UnstyledButton>
              ))}
            </Stack>
          </ScrollArea>
        </Paper>
      )}
    </Box>
  )
}
