import { useState } from 'react'
import {
  Modal,
  Button,
  Text,
  Stack,
  Group,
  Alert,
  Select,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useGetPositionQuery } from '../../features/positions/positionsApi'

export function DeleteConfirmModal({ opened, onClose, position, onConfirm }) {
  const [strategy, setStrategy] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: details } = useGetPositionQuery(position?.id, { skip: !position?.id })
  const hasChildren = (details?.childrenCount || 0) > 0

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm(hasChildren ? strategy : undefined)
    } catch {
      // Error handled by parent
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">Delete Position</Text>}
      size="md"
      centered
    >
      <Stack gap="md">
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
          <Text size="sm">
            Are you sure you want to delete <strong>{position?.name}</strong>?
            This action cannot be undone.
          </Text>
        </Alert>

        {hasChildren && (
          <>
            <Text size="sm" fw={500}>
              This position has {details.childrenCount} active children.
              Choose how to handle them:
            </Text>
            <Select
              placeholder="Select reassignment strategy"
              data={[
                { value: 'promote-to-parent', label: 'Promote children to parent position' },
              ]}
              value={strategy}
              onChange={setStrategy}
              size="md"
              required
            />
            {!strategy && (
              <Text size="xs" c="red">You must select a strategy to proceed.</Text>
            )}
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button
            color="red"
            onClick={handleConfirm}
            loading={isDeleting}
            disabled={hasChildren && !strategy}
          >
            Delete Position
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}