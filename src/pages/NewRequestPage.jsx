import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box,
  Button,
  Group,
  Text,
  Paper,
  Stack,
  Stepper,
  TextInput,
  Textarea,
  Select,
  Alert,
  Badge,
  Divider,
  ActionIcon,
} from '@mantine/core'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconBuilding,
  IconAlertCircle,
  IconTree,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import {
  createRequestSchema,
  updateRequestSchema,
  deleteRequestSchema,
} from '../components/forms/requestSchemas'
import { useSubmitRequestMutation } from '../features/requests/requestsApi'
import { useLazyGetPositionQuery } from '../features/positions/positionsApi'
import { PositionSearchPicker } from '../components/pickers/PositionSearchPicker'
import { PositionTreePickerModal } from '../components/pickers/PositionTreePickerModal'
import { SelectedPositionPreview } from '../components/pickers/SelectedPositionPreview'
import { ACTION_CONFIG } from '../lib/config'
import { getErrorMessage } from '../lib/errors'

const actionCards = [
  {
    action: 'create',
    icon: IconPlus,
    title: 'Create Position',
    description: 'Submit a request to add a new position to the organization.',
    color: 'green',
  },
  {
    action: 'update',
    icon: IconEdit,
    title: 'Update Position',
    description: 'Submit a request to change the name, description, or parent of a position.',
    color: 'blue',
  },
  {
    action: 'delete',
    icon: IconTrash,
    title: 'Delete Position',
    description: 'Submit a request to remove a position. Children may be reassigned.',
    color: 'red',
  },
]

const reassignmentOptions = [
  { value: 'promote-to-parent', label: 'Promote children to parent' },
]

function buildDefaultValues(action) {
  if (action === 'create') {
    return { parentId: '', name: '', description: '', requesterName: '', requesterEmail: '' }
  }
  if (action === 'update') {
    return { targetPositionId: '', name: '', description: '', newParentId: '', requesterName: '', requesterEmail: '' }
  }
  return { targetPositionId: '', reassignmentStrategy: '', requesterName: '', requesterEmail: '' }
}

function getSchema(action) {
  if (action === 'create') return createRequestSchema
  if (action === 'update') return updateRequestSchema
  return deleteRequestSchema
}

export function NewRequestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeStep, setActiveStep] = useState(0)
  const [actionType, setActionType] = useState(() => searchParams.get('action') || '')
  const [submitRequest, { isLoading: isSubmitting }] = useSubmitRequestMutation()
  const [getPosition, { data: prefetchedPosition }] = useLazyGetPositionQuery()
  const [treePickerOpen, setTreePickerOpen] = useState(false)
  const [treePickerMode, setTreePickerMode] = useState('parent') // 'parent' | 'target' | 'newParent'

  // Prefill state from URL
  const [selectedParent, setSelectedParent] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedNewParent, setSelectedNewParent] = useState(null)

  const form = useForm({
    resolver: yupResolver(getSchema(actionType || 'create')),
    defaultValues: buildDefaultValues(actionType || 'create'),
    mode: 'onBlur',
  })

  // Reset form when action changes
  useEffect(() => {
    if (actionType) {
      form.reset(buildDefaultValues(actionType))
      setActiveStep(1)
    }
  }, [actionType])

  // Prefill from URL params
  useEffect(() => {
    const parentId = searchParams.get('parent')
    const targetId = searchParams.get('target')
    if (targetId) {
      getPosition(targetId)
    }
  }, [searchParams, getPosition])

  useEffect(() => {
    if (prefetchedPosition) {
      if (actionType === 'update') {
        setSelectedTarget({ id: prefetchedPosition.id, name: prefetchedPosition.name, path: prefetchedPosition.path })
        form.setValue('targetPositionId', prefetchedPosition.id)
        form.setValue('name', prefetchedPosition.name)
        form.setValue('description', prefetchedPosition.description)
      } else if (actionType === 'delete') {
        setSelectedTarget({ id: prefetchedPosition.id, name: prefetchedPosition.name, path: prefetchedPosition.path })
        form.setValue('targetPositionId', prefetchedPosition.id)
        form.setValue('hasChildren', prefetchedPosition.childrenCount > 0)
      } else if (actionType === 'create') {
        setSelectedParent({ id: prefetchedPosition.id, name: prefetchedPosition.name, path: prefetchedPosition.path })
        form.setValue('parentId', prefetchedPosition.id)
      }
    }
  }, [prefetchedPosition, actionType, form])

  const handleSelectAction = (action) => {
    setActionType(action)
    setActiveStep(1)
    form.reset(buildDefaultValues(action))
  }

  const handleSelectParent = (node) => {
    setSelectedParent(node)
    form.setValue('parentId', node.id, { shouldValidate: true })
  }

  const handleSelectTarget = (node) => {
    setSelectedTarget(node)
    form.setValue('targetPositionId', node.id, { shouldValidate: true })
    if (actionType === 'update') {
      getPosition(node.id)
    }
  }

  const handleSelectNewParent = (node) => {
    setSelectedNewParent(node)
    form.setValue('newParentId', node.id, { shouldValidate: true })
  }

  const openTreePicker = (mode) => {
    setTreePickerMode(mode)
    setTreePickerOpen(true)
  }

  const handleTreeSelect = (node) => {
    if (treePickerMode === 'parent') handleSelectParent(node)
    else if (treePickerMode === 'target') handleSelectTarget(node)
    else if (treePickerMode === 'newParent') handleSelectNewParent(node)
  }

  const onSubmit = async (values) => {
    let payload = {}
    let body = {
      actionType,
      requesterName: values.requesterName,
      requesterEmail: values.requesterEmail,
    }

    if (actionType === 'create') {
      payload = {
        name: values.name,
        description: values.description,
        parentId: values.parentId || null,
      }
    } else if (actionType === 'update') {
      body.positionId = values.targetPositionId
      payload = {
        name: values.name,
        description: values.description,
        parentId: values.newParentId || undefined,
      }
    } else if (actionType === 'delete') {
      body.positionId = values.targetPositionId
      payload = {
        reassignmentStrategy: values.reassignmentStrategy || undefined,
      }
    }

    body.payload = payload

    try {
      const result = await submitRequest(body).unwrap()
      if (result.success && result.data?.requestId) {
        notifications.show({
          title: 'Request submitted',
          message: result.data.message || 'Your request has been submitted successfully.',
          color: 'green',
        })
        navigate(`/requests/${result.data.requestId}`)
      } else {
        notifications.show({
          title: 'Submission issue',
          message: 'Unexpected response from server.',
          color: 'orange',
        })
      }
    } catch (err) {
      const msg = getErrorMessage(err)
      notifications.show({
        title: 'Submission failed',
        message: msg,
        color: 'red',
      })
    }
  }

  const currentValues = form.watch()
  const errors = form.formState.errors

  const stepLabels = ['Type', 'Target', 'Details', 'Requester', 'Review']

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

      <Text fw={700} size="xl" className="tracking-tight mb-1">
        New Change Request
      </Text>
      <Text c="dimmed" size="sm" className="mb-6">
        Submit a request to change the organization structure.
      </Text>

      <Stepper active={activeStep} onStepClick={setActiveStep} size="sm" className="mb-6">
        {stepLabels.map((label, i) => (
          <Stepper.Step key={label} label={label} />
        ))}
      </Stepper>

      {/* Step 0: Choose action type */}
      {activeStep === 0 && (
        <Stack gap="md">
          {actionCards.map((card) => {
            const Icon = card.icon
            return (
              <Paper
                key={card.action}
                className={`p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  actionType === card.action
                    ? `border-${card.color}-400 bg-${card.color}-50 ring-1 ring-${card.color}-300`
                    : 'border-surface-200 bg-white hover:border-surface-300'
                }`}
                onClick={() => handleSelectAction(card.action)}
              >
                <Group gap="md">
                  <Box
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      actionType === card.action ? `bg-${card.color}-100` : 'bg-surface-100'
                    }`}
                  >
                    <Icon
                      size={24}
                      className={actionType === card.action ? `text-${card.color}-600` : 'text-surface-500'}
                    />
                  </Box>
                  <div>
                    <Text fw={600} size="md" className="mb-0.5">
                      {card.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {card.description}
                    </Text>
                  </div>
                </Group>
              </Paper>
            )
          })}
        </Stack>
      )}

      {/* Step 1: Target context */}
      {activeStep === 1 && actionType && (
        <Stack gap="lg">
          <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="md">
                {actionType === 'create' ? 'Choose Parent Position' : 'Choose Target Position'}
              </Text>
              <Button variant="light" size="xs" leftSection={<IconTree size={14} />} onClick={() => openTreePicker(actionType === 'create' ? 'parent' : 'target')}>
                Browse Tree
              </Button>
            </Group>

            <PositionSearchPicker
              onSelect={(item) => {
                const node = { id: item.id, name: item.name, path: item.path }
                if (actionType === 'create') handleSelectParent(node)
                else handleSelectTarget(node)
              }}
              selectedId={actionType === 'create' ? selectedParent?.id : selectedTarget?.id}
              label="Search by name"
            />

            {actionType === 'create' && selectedParent && (
              <Box mt="md">
                <SelectedPositionPreview position={selectedParent} label="Parent" onClear={() => { setSelectedParent(null); form.setValue('parentId', null) }} />
              </Box>
            )}
            {actionType !== 'create' && selectedTarget && (
              <Box mt="md">
                <SelectedPositionPreview position={selectedTarget} label="Target" onClear={() => { setSelectedTarget(null); form.setValue('targetPositionId', '') }} />
              </Box>
            )}
          </Paper>

          {actionType === 'create' && (
            <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light" className="rounded-lg">
              <Text size="sm">
                Leave parent empty to request a root position. Depending on business rules, this may require special approval.
              </Text>
            </Alert>
          )}

          <Group justify="space-between">
            <Button variant="default" onClick={() => setActiveStep(0)} leftSection={<IconArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              onClick={() => setActiveStep(2)}
              rightSection={<IconArrowRight size={16} />}
              disabled={actionType !== 'create' && !selectedTarget}
            >
              Continue
            </Button>
          </Group>
        </Stack>
      )}

      {/* Step 2: Fill change details */}
      {activeStep === 2 && actionType && (
        <Stack gap="lg">
          <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
            <Text fw={600} size="md" className="mb-4">
              Change Details
            </Text>

            <Stack gap="md">
              {actionType === 'create' && (
                <>
                  {selectedParent && <SelectedPositionPreview position={selectedParent} label="Parent" />}
                  <TextInput
                    label="Position Name"
                    placeholder="e.g. Senior Product Manager"
                    {...form.register('name')}
                    error={errors.name?.message}
                    className="rounded-lg"
                    size="md"
                  />
                  <Textarea
                    label="Description"
                    placeholder="Describe the role and responsibilities"
                    {...form.register('description')}
                    error={errors.description?.message}
                    minRows={3}
                    className="rounded-lg"
                    size="md"
                  />
                </>
              )}

              {actionType === 'update' && (
                <>
                  {selectedTarget && <SelectedPositionPreview position={selectedTarget} label="Target" />}
                  <TextInput
                    label="New Name"
                    placeholder="Updated position name"
                    {...form.register('name')}
                    error={errors.name?.message}
                    className="rounded-lg"
                    size="md"
                  />
                  <Textarea
                    label="New Description"
                    placeholder="Updated description"
                    {...form.register('description')}
                    error={errors.description?.message}
                    minRows={3}
                    className="rounded-lg"
                    size="md"
                  />
                  <Box>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        New Parent (optional)
                      </Text>
                      <Button variant="light" size="xs" leftSection={<IconTree size={14} />} onClick={() => openTreePicker('newParent')}>
                        Browse Tree
                      </Button>
                    </Group>
                    {selectedNewParent ? (
                      <SelectedPositionPreview position={selectedNewParent} label="New Parent" onClear={() => { setSelectedNewParent(null); form.setValue('newParentId', null) }} />
                    ) : (
                      <Text size="sm" c="dimmed">
                        Keep current parent
                      </Text>
                    )}
                  </Box>
                </>
              )}

              {actionType === 'delete' && (
                <>
                  {selectedTarget && <SelectedPositionPreview position={selectedTarget} label="Target to Delete" />}
                  <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light" className="rounded-lg">
                    <Text size="sm">
                      Deleting this position may affect reporting lines. Choose how to handle existing children.
                    </Text>
                  </Alert>
                  {currentValues.hasChildren && (
                    <Select
                      label="Reassignment Strategy"
                      placeholder="Select strategy"
                      data={reassignmentOptions}
                      value={currentValues.reassignmentStrategy}
                      onChange={(val) => form.setValue('reassignmentStrategy', val, { shouldValidate: true })}
                      error={errors.reassignmentStrategy?.message}
                      size="md"
                    />
                  )}
                </>
              )}
            </Stack>
          </Paper>

          <Group justify="space-between">
            <Button variant="default" onClick={() => setActiveStep(1)} leftSection={<IconArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              onClick={() => setActiveStep(3)}
              rightSection={<IconArrowRight size={16} />}
              disabled={actionType === 'update' && (!currentValues.name || !currentValues.description)}
            >
              Continue
            </Button>
          </Group>
        </Stack>
      )}

      {/* Step 3: Requester info */}
      {activeStep === 3 && (
        <Stack gap="lg">
          <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
            <Text fw={600} size="md" className="mb-4">
              Requester Information
            </Text>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Your name"
                {...form.register('requesterName')}
                error={errors.requesterName?.message}
                size="md"
              />
              <TextInput
                label="Email"
                placeholder="you@company.com"
                {...form.register('requesterEmail')}
                error={errors.requesterEmail?.message}
                size="md"
              />
            </Stack>
          </Paper>

          <Group justify="space-between">
            <Button variant="default" onClick={() => setActiveStep(2)} leftSection={<IconArrowLeft size={16} />}>
              Back
            </Button>
            <Button onClick={() => setActiveStep(4)} rightSection={<IconArrowRight size={16} />}>
              Review
            </Button>
          </Group>
        </Stack>
      )}

      {/* Step 4: Review and submit */}
      {activeStep === 4 && (
        <Stack gap="lg">
          <Paper className="p-5 rounded-xl border border-surface-200 bg-white">
            <Text fw={600} size="md" className="mb-4">
              Review Request
            </Text>

            <Stack gap="md">
              <Group gap="sm">
                <Text size="sm" fw={500} className="text-surface-500">
                  Action:
                </Text>
                <Badge color={ACTION_CONFIG[actionType]?.color} variant="light">
                  {ACTION_CONFIG[actionType]?.label}
                </Badge>
              </Group>

              {actionType === 'create' && selectedParent && (
                <Group gap="sm">
                  <Text size="sm" fw={500} className="text-surface-500">
                    Parent:
                  </Text>
                  <Text size="sm">{selectedParent.name}</Text>
                </Group>
              )}

              {(actionType === 'update' || actionType === 'delete') && selectedTarget && (
                <Group gap="sm">
                  <Text size="sm" fw={500} className="text-surface-500">
                    Target:
                  </Text>
                  <Text size="sm">{selectedTarget.name}</Text>
                </Group>
              )}

              {actionType === 'create' && (
                <>
                  <Group gap="sm">
                    <Text size="sm" fw={500} className="text-surface-500">
                      Name:
                    </Text>
                    <Text size="sm">{currentValues.name}</Text>
                  </Group>
                  <Group gap="sm">
                    <Text size="sm" fw={500} className="text-surface-500">
                      Description:
                    </Text>
                    <Text size="sm">{currentValues.description}</Text>
                  </Group>
                </>
              )}

              {actionType === 'update' && (
                <>
                  <Group gap="sm">
                    <Text size="sm" fw={500} className="text-surface-500">
                      New Name:
                    </Text>
                    <Text size="sm">{currentValues.name}</Text>
                  </Group>
                  <Group gap="sm">
                    <Text size="sm" fw={500} className="text-surface-500">
                      New Description:
                    </Text>
                    <Text size="sm">{currentValues.description}</Text>
                  </Group>
                  {selectedNewParent && (
                    <Group gap="sm">
                      <Text size="sm" fw={500} className="text-surface-500">
                        New Parent:
                      </Text>
                      <Text size="sm">{selectedNewParent.name}</Text>
                    </Group>
                  )}
                </>
              )}

              {actionType === 'delete' && currentValues.reassignmentStrategy && (
                <Group gap="sm">
                  <Text size="sm" fw={500} className="text-surface-500">
                    Reassignment:
                  </Text>
                  <Text size="sm">{currentValues.reassignmentStrategy}</Text>
                </Group>
              )}

              <Divider />

              <Group gap="sm">
                <Text size="sm" fw={500} className="text-surface-500">
                  Requester:
                </Text>
                <Text size="sm">
                  {currentValues.requesterName} ({currentValues.requesterEmail})
                </Text>
              </Group>
            </Stack>
          </Paper>

          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light" className="rounded-lg">
            <Text size="sm">
              After submitting, a confirmation email will be sent to <strong>{currentValues.requesterEmail}</strong>.
              The request will not apply until it is confirmed and approved.
            </Text>
          </Alert>

          <Group justify="space-between">
            <Button variant="default" onClick={() => setActiveStep(3)} leftSection={<IconArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={form.handleSubmit(onSubmit)}
              loading={isSubmitting}
              color="green"
            >
              Submit Request
            </Button>
          </Group>
        </Stack>
      )}

      <PositionTreePickerModal
        opened={treePickerOpen}
        onClose={() => setTreePickerOpen(false)}
        onSelect={handleTreeSelect}
        selectedId={
          treePickerMode === 'parent'
            ? selectedParent?.id
            : treePickerMode === 'target'
            ? selectedTarget?.id
            : selectedNewParent?.id
        }
        excludeId={treePickerMode === 'newParent' ? selectedTarget?.id : undefined}
      />
    </Box>
  )
}
