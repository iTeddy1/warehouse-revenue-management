import { ImportList } from '@/features/imports/components/ImportList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/imports/')({
  component: ImportsPage,
})

function ImportsPage() {
  return <ImportList />
}
