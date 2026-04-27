import { useState } from 'react'
import {
  Modal,
  TextInput,
  Button,
  Text,
  Stack,
} from '@mantine/core'
import { IconSearch, IconFileDescription } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

export function TrackRequestModal({ opened, onClose }) {
  const [requestId, setRequestId] = useState('')
  const navigate = useNavigate()

  const handleTrack = () => {
    if (requestId.trim()) {
      navigate(`/requests/${requestId.trim()}`)
      onClose()
      setRequestId('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTrack()
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg">Track Request</Text>
      }
      centered
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Enter your request ID to check its status.
        </Text>
        <TextInput
          placeholder="e.g., abc123-def456-ghi789"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          onKeyDown={handleKeyDown}
          size="md"
          autoFocus
        />
        <Button onClick={handleTrack} disabled={!requestId.trim()} fullWidth>
          Track Request
        </Button>
      </Stack>
    </Modal>
  )
}