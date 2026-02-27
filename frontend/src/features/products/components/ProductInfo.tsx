import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import type { ProductEntity } from '../types'
import { StockLevelBadge } from './StockLevelBadge'

interface ProductInfoProps {
  product: ProductEntity
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Mã sản phẩm</span>
              <p className="font-medium">{product.code}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Đơn vị tính</span>
              <p className="font-medium">{product.unit}</p>
            </div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Tên sản phẩm</span>
            <p className="font-medium">{product.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Giá nhập</span>
              <p className="font-medium">{formatCurrency(product.costPrice)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Giá bán</span>
              <p className="font-semibold text-primary">
                {formatCurrency(product.sellPrice)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Stock Information ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Tồn kho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">
                Số lượng tồn kho
              </span>
              <div className="mt-1">
                <StockLevelBadge
                  stockQty={product.stockQty}
                  alertLevel={product.alertLevel}
                />
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Mức cảnh báo
              </span>
              <p className="font-medium">{product.alertLevel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Metadata ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khác</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Ngày tạo</span>
              <p className="font-medium">
                {formatDate(product.createdAt, { showTime: true })}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Cập nhật lần cuối
              </span>
              <p className="font-medium">
                {formatDate(product.updatedAt, { showTime: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
