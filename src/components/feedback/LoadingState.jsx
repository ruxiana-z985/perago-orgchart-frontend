import { Skeleton, Stack, Box } from '@mantine/core'

export function LoadingState({ count = 5 }) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} height={48} radius="sm" />
      ))}
    </Stack>
  )
}

export function PageSkeleton() {
  return (
    <Stack gap="md" className="p-6">
      <Skeleton height={40} width="40%" radius="sm" />
      <Skeleton height={24} width="60%" radius="sm" />
      <Box className="h-8" />
      <Skeleton height={400} radius="md" />
    </Stack>
  )
}
