import { Alert, Button, Stack, Text } from '@mantine/core'
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react'
import { getErrorMessage } from '../../lib/errors.js'

export function ErrorState({ error, onRetry, title = 'Failed to load' }) {
  const message = getErrorMessage(error)

  return (
    <Alert
      icon={<IconAlertCircle size={20} />}
      title={title}
      color="red"
      variant="light"
      className="rounded-lg"
    >
      <Stack gap="sm">
        <Text size="sm">{message}</Text>
        {onRetry && (
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            color="red"
            size="sm"
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
      </Stack>
    </Alert>
  )
}
