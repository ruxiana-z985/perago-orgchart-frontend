import {
  Box,
  Button,
  Group,
  Text,
  Paper,
  Badge,
  Stack,
  Skeleton,
  Alert,
  Divider,
  Anchor,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconRefresh,
  IconCheck,
  IconX,
  IconMail,
  IconClock,
  IconTimeline,
  IconAlertCircle,
  IconExternalLink,
} from '@tabler/icons-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { useGetRequestQuery, useConfirmRequestMutation, useApproveRequestMutation, useRejectRequestMutation } from '../features/requests/requestsApi.js'
import { STATUS_CONFIG, ACTION_CONFIG } from '../lib/config.js'
import { formatDate } from '../lib/format.js'
import { getErrorMessage } from '../lib/errors.js'
import { ErrorState } from '../components/feedback/ErrorState.jsx'

/**
 * Request Status Page with polling for pending states.
 * Works both in production (no debug links) and local dev (with debug links).
 */
export function RequestStatusPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetRequestQuery(id, {
    pollingInterval: 10000, // Poll every 10 seconds for pending states
  })

  const [confirmRequest, { isLoading: confirming }] = useConfirmRequestMutation()
  const [approveRequest, { isLoading: approving }] = useApproveRequestMutation()
  const [rejectRequest, { isLoading: rejecting }] = useRejectRequestMutation()

  const request = response?.data
  const statusConfig = request ? STATUS_CONFIG[request.status] : null

  const handleConfirm = async () => {
    try {
      const result = await confirmRequest(id).unwrap()
      notifications.show({
        title: 'Confirmed',
        message: result.data?.message || 'Request confirmed successfully.',
        color: 'green',
      })
      refetch()
    } catch (err) {
      notifications.show({
        title: 'Confirmation failed',
        message: getErrorMessage(err),
        color: 'red',
      })
    }
  }

  const handleApprove = async () => {
    try {
      const result = await approveRequest(id).unwrap()
      notifications.show({
        title: 'Approved',
        message: result.data?.message || 'Request approved and executed.',
        color: 'green',
      })
      refetch()
    } catch (err) {
      notifications.show({
        title: 'Approval failed',
        message: getErrorMessage(err),
        color: 'red',
      })
    }
  }

  const handleReject = async () => {
    const reason = window.prompt('Enter rejection reason:')
    if (!reason) return
    try {
      const result = await rejectRequest({ id, reason }).unwrap()
      notifications.show({
        title: 'Rejected',
        message: result.data?.rejectionReason || 'Request rejected.',
        color: 'orange',
      })
      refetch()
    } catch (err) {
      notifications.show({
        title: 'Rejection failed',
        message: getErrorMessage(err),
        color: 'red',
      })
    }
  }

  if (isLoading) {
    return (
      <Box className="p-6 max-w-4xl mx-auto">
        <Skeleton height={40} width="60%" className="mb-4" />
        <Skeleton height={200} radius="md" className="mb-4" />
        <Skeleton height={120} radius="md" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="p-6 max-w-2xl mx-auto">
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="subtle"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>
        <ErrorState error={error} onRetry={refetch} title="Failed to load request" />
      </Box>
    )
  }

  if (!request) {
    return (
      <Box className="p-6 max-w-2xl mx-auto">
        <Text c="dimmed" size="sm">
          Request not found.
        </Text>
      </Box>
    )
  }

  const links = response?.data?.links
  const hasDebugLinks = !!links

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      <Button
        leftSection={<IconArrowLeft size={16} />}
        variant="subtle"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Back
      </Button>

      <Stack gap="lg">
        {/* Hero Status Card */}
        <Paper
          className={`p-6 rounded-xl border ${
            request.status === 'executed'
              ? 'border-green-200 bg-green-50'
              : request.status === 'rejected'
              ? 'border-red-200 bg-red-50'
              : request.status === 'expired'
              ? 'border-gray-200 bg-gray-50'
              : 'border-primary-200 bg-primary-50'
          }`}
        >
          <Group justify="space-between" wrap="wrap" gap="sm" mb="sm">
            <Group gap="sm">
              <Text fw={700} size="lg">
                Request {id}
              </Text>
              <Badge size="lg" variant="filled" color={statusConfig?.color || 'gray'}>
                {statusConfig?.label || request.status}
              </Badge>
            </Group>
            <Group gap="sm">
              <Button variant="subtle" size="xs" leftSection={<IconRefresh size={14} />} onClick={refetch} loading={isLoading}>
                Refresh
              </Button>
            </Group>
          </Group>

          <Text fw={600} size="xl" className="mb-2">
            {statusConfig?.headline || request.status}
          </Text>

          {request.status === 'pending-confirmation' && (
            <Text size="sm" c="dimmed">
              A confirmation email has been sent to <strong>{request.requester?.email}</strong>. Please check your inbox and click the confirmation link.
            </Text>
          )}

          {request.status === 'pending-approval' && (
            <Text size="sm" c="dimmed">
              Your request has been confirmed and is now waiting for HR approval.
            </Text>
          )}

          {request.status === 'executed' && (
            <Text size="sm" c="dimmed">
              The change has been applied to the organization structure.
            </Text>
          )}

          {request.status === 'rejected' && (
            <Text size="sm" c="dimmed">
              This request was rejected and will not be applied.
            </Text>
          )}

          {request.status === 'expired' && (
            <Text size="sm" c="dimmed">
              This request expired before it could be completed. You may submit a new request.
            </Text>
          )}
        </Paper>

        {/* Debug Links Panel (local dev only) */}
        {hasDebugLinks && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" className="rounded-lg">
            <Text fw={600} size="sm" className="mb-2">
              Debug Actions (Local Development)
            </Text>
            <Stack gap="xs">
              {links.confirmationUrl && (
                <Group gap="sm">
                  <Button size="xs" variant="light" color="yellow" onClick={handleConfirm} loading={confirming} leftSection={<IconMail size={14} />}>
                    Simulate Confirm
                  </Button>
                  <Anchor href={links.confirmationUrl} target="_blank" size="xs">
                    Open Confirm URL <IconExternalLink size={12} />
                  </Anchor>
                </Group>
              )}
              {links.approveUrl && (
                <Group gap="sm">
                  <Button size="xs" variant="light" color="green" onClick={handleApprove} loading={approving} leftSection={<IconCheck size={14} />}>
                    Simulate Approve
                  </Button>
                  <Anchor href={links.approveUrl} target="_blank" size="xs">
                    Open Approve URL <IconExternalLink size={12} />
                  </Anchor>
                </Group>
              )}
              {links.rejectUrl && (
                <Group gap="sm">
                  <Button size="xs" variant="light" color="red" onClick={handleReject} loading={rejecting} leftSection={<IconX size={14} />}>
                    Simulate Reject
                  </Button>
                  <Anchor href={links.rejectUrl} target="_blank" size="xs">
                    Open Reject URL <IconExternalLink size={12} />
                  </Anchor>
                </Group>
              )}
              <Anchor href={links.statusUrl} target="_blank" size="xs">
                Status URL <IconExternalLink size={12} />
              </Anchor>
            </Stack>
          </Alert>
        )}

        {/* Summary */}
        <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
          <Text fw={700} size="md" className="mb-4">
            Request Details
          </Text>
          <Stack gap="sm">
            <Group gap="sm">
              <Text size="sm" fw={500} className="text-surface-500 w-32">
                Action
              </Text>
              <Text size="sm">
                {request.actionType === 'create' && request.position && request.position.parent
                  ? `Adding ${request.payload?.name || 'new position'} to ${request.position.parent.name}`
                  : request.actionType === 'update' && request.position
                  ? `Updating ${request.position.name}`
                  : request.actionType === 'delete' && request.position
                  ? `Deleting ${request.position.name}`
                  : ACTION_CONFIG[request.actionType]?.label || request.actionType}
              </Text>
            </Group>
            <Group gap="sm">
              <Text size="sm" fw={500} className="text-surface-500 w-32">
                Requested By
              </Text>
              <Text size="sm">
                {request.requester?.name}
              </Text>
            </Group>
            <Group gap="sm">
              <Text size="sm" fw={500} className="text-surface-500 w-32">
                Email
              </Text>
              <Text size="sm">
                {request.requester?.email}
              </Text>
            </Group>
            <Group gap="sm">
              <Text size="sm" fw={500} className="text-surface-500 w-32">
                Requested On
              </Text>
              <Text size="sm">{formatDate(request.submittedAt)}</Text>
            </Group>
          </Stack>
        </Paper>

        {/* Position Context */}
        {request.position && (
          <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
            <Text fw={700} size="md" className="mb-4">
              Affected Position
            </Text>
            <Group gap="md">
              <Box className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <IconCheck size={24} className="text-primary-600" />
              </Box>
              <div>
                <Text fw={600} size="md">
                  {request.position.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {request.position.path}
                </Text>
              </div>
              <Button
                variant="light"
                size="xs"
                onClick={() => navigate(`/positions/${request.position.id}`)}
              >
                View Position
              </Button>
            </Group>
          </Paper>
        )}

        {/* Impact (especially for delete) */}
        {request.impact && request.impact.childrenToReassign && request.impact.childrenToReassign.length > 0 && (
          <Paper className="p-5 rounded-xl border border-red-200 bg-red-50">
            <Text fw={700} size="md" className="mb-4 text-red-800">
              Delete Impact
            </Text>
            <Text size="sm" className="mb-3">
              The following children will be reassigned:
            </Text>
            <Stack gap="xs">
              {request.impact.childrenToReassign.map((child) => (
                <Group key={child.id} gap="sm">
                  <Text size="sm" fw={500}>
                    {child.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    new parent: {child.newParent || 'Root'}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Payload */}
        {request.payload && Object.keys(request.payload).length > 0 && (
          <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
            <Text fw={700} size="md" className="mb-4">
              Requested Changes
            </Text>
            <Stack gap="sm">
              {Object.entries(request.payload).map(([key, value]) => (
                <Group key={key} gap="sm">
                  <Text size="sm" fw={500} className="text-surface-500 w-32 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text size="sm">{String(value)}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

      </Stack>
    </Box>
  )
}
