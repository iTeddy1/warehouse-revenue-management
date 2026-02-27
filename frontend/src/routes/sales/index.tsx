import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SaleList } from '@/features/sales/components/History/SaleList'
import { POSLayout } from '@/features/sales/components/POS/POSLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sales/')({
  component: SalesPage,
})

function SalesPage() {
  return (
    <Tabs defaultValue="pos" className="flex h-full flex-col">
      <div className="px-4 pt-4">
        <TabsList>
          <TabsTrigger value="pos">POS / Bán hàng</TabsTrigger>
          <TabsTrigger value="history">Lịch sử bán hàng</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="pos" className="flex-1 overflow-hidden p-0">
        <POSLayout />
      </TabsContent>
      <TabsContent value="history" className="p-4">
        <SaleList />
      </TabsContent>
    </Tabs>
  )
}
