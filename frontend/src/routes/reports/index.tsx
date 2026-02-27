import { SalesReportView } from '@/features/reports/components/SalesReport/SalesReportView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reports/')({
  component: SalesReportView,
})
