import { useState, useEffect, useRef } from 'react'
import {
  Modal,
  TextInput,
  Stack,
  Group,
  Text,
  ScrollArea,
  Badge,
  Box,
  Loader,
  UnstyledButton,
} from '@mantine/core'
import { IconSearch, IconBuilding } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useLazySearchPositionsQuery } from '../../features/positions/positionsApi.js'

export function GlobalSearchModal({ opened, onClose }) {
  const [query, setQuery] = useState('')
  const [triggerSearch, { data, isFetching, error }] = useLazySearchPositionsQuery()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (opened && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [opened])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        triggerSearch(query.trim())
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, triggerSearch])

  const handleSelect = (id) => {
    onClose()
    setQuery('')
    navigate(`/positions/${id}`)
  }

  const results = data?.data || []

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Search Positions"
      size="lg"
      centered
      className="rounded-xl"
    >
      <Stack gap="md">
        <TextInput
          ref={inputRef}
          placeholder="Type to search positions..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          size="md"
          className="rounded-lg"
        />

        {isFetching && (
          <Group justify="center" py="md">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              Searching...
            </Text>
          </Group>
        )}

        {error && (
          <Text c="red" size="sm" ta="center">
            Failed to search. Try again.
          </Text>
        )}

        {!isFetching && query.trim().length >= 2 && results.length === 0 && (
          <Text c="dimmed" size="sm" ta="center" py="md">
            No positions found.
          </Text>
        )}

        {results.length > 0 && (
          <ScrollArea className="max-h-80">
            <Stack gap="xs">
              {results.map((item) => (
                <UnstyledButton
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full p-3 rounded-lg hover:bg-surface-100 transition-colors border border-transparent hover:border-surface-200"
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Box className="w-8 h-8 rounded-md bg-primary-100 flex items-center justify-center shrink-0">
                        <IconBuilding size={16} className="text-primary-600" />
                      </Box>
                      <div>
                        <Text size="sm" fw={500}>
                          {item.name}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {item.path}
                        </Text>
                      </div>
                    </Group>
                    <Badge
                      size="xs"
                      variant={item.matchType === 'exact' ? 'filled' : 'light'}
                      color={item.matchType === 'exact' ? 'green' : 'gray'}
                    >
                      {item.matchType}
                    </Badge>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          </ScrollArea>
        )}

        {query.trim().length < 2 && (
          <Text c="dimmed" size="sm" ta="center" py="md">
            Type at least 2 characters to search
          </Text>
        )}
      </Stack>
    </Modal>
  )
}
