import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__not-found')({
  component: () => <div>404 - Page Not Found</div>,
})
