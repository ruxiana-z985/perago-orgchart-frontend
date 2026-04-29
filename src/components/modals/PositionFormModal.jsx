import { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Stack,
  Group,
  Text,
} from '@mantine/core'
import { useForm } from 'react-hook-form'
import { PositionSearchPicker } from '../pickers/PositionSearchPicker'
import { PositionTreePickerModal } from '../pickers/PositionTreePickerModal'
import { SelectedPositionPreview } from '../pickers/SelectedPositionPreview'
import { IconTree } from '@tabler/icons-react'

export function PositionFormModal({ opened, onClose, mode, position, onSubmit }) {
  const [treeOpen, setTreeOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCreate = mode === 'create'
  const isEdit = mode === 'edit'

  const form = useForm({
    defaultValues: {
      name: isEdit ? position?.name || '' : '',
      description: isEdit ? position?.description || '' : '',
    },
  })

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      form.reset({
        name: isEdit ? position?.name || '' : '',
        description: isEdit ? position?.description || '' : '',
      })
      setSelectedParent(null)
    }
  }, [opened])

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: values.name,
        description: values.description,
        parentId: selectedParent?.id ?? null,
      })
    } catch {
      // Error is handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Text fw={600} size="lg">
            {isCreate ? 'Add New Position' : 'Edit Position'}
          </Text>
        }
        size="lg"
        centered
      >
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Stack gap="md">
            {isCreate && position && (
              <SelectedPositionPreview
                position={position}
                label="Parent"
                onClear={() => setSelectedParent(null)}
              />
            )}

            {isCreate && !position && (
              <>
                <Group justify="space-between" mb={0}>
                  <Text size="sm" fw={500}>Parent Position (optional)</Text>
                  <Button variant="light" size="xs" leftSection={<IconTree size={14} />} onClick={() => setTreeOpen(true)}>
                    Browse Tree
                  </Button>
                </Group>
                <PositionSearchPicker
                  onSelect={(item) => setSelectedParent({ id: item.id, name: item.name, path: item.path })}
                  selectedId={selectedParent?.id}
                  label="Search parent"
                />
                {selectedParent && (
                  <SelectedPositionPreview position={selectedParent} label="Parent" onClear={() => setSelectedParent(null)} />
                )}
              </>
            )}

            <TextInput
              label="Position Name"
              placeholder="e.g. Senior Developer"
              {...form.register('name', { required: 'Name is required' })}
              error={form.formState.errors.name?.message}
              size="md"
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the role and responsibilities"
              {...form.register('description', { required: 'Description is required' })}
              error={form.formState.errors.description?.message}
              minRows={3}
              size="md"
              required
            />

            {isEdit && (
              <>
                <Group justify="space-between" mb={0}>
                  <Text size="sm" fw={500}>New Parent (optional)</Text>
                  <Button variant="light" size="xs" leftSection={<IconTree size={14} />} onClick={() => setTreeOpen(true)}>
                    Browse Tree
                  </Button>
                </Group>
                {selectedParent ? (
                  <SelectedPositionPreview position={selectedParent} label="New Parent" onClear={() => setSelectedParent(null)} />
                ) : (
                  <Text size="sm" c="dimmed">Keep current parent</Text>
                )}
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={isSubmitting} color={isCreate ? 'green' : 'blue'}>
                {isCreate ? 'Create Position' : 'Save Changes'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <PositionTreePickerModal
        opened={treeOpen}
        onClose={() => setTreeOpen(false)}
        onSelect={(node) => {
          setSelectedParent({ id: node.id, name: node.name, path: node.path })
          setTreeOpen(false)
        }}
        selectedId={selectedParent?.id}
        excludeId={isEdit ? position?.id : undefined}
      />
    </>
  )
}