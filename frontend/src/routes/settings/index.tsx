import { SystemSettingsView } from '@/features/system/components/SystemSettingsView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return <SystemSettingsView />
}
