import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  IconAlertTriangle,
  IconCloudDownload,
  IconDatabaseImport,
} from '@tabler/icons-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useBackup } from '../api/backup'
import { useRestore } from '../api/restore'

export function SystemSettingsView() {
  const { mutate: triggerBackup, isPending: isBackingUp } = useBackup()
  const { mutate: triggerRestore, isPending: isRestoring } = useRestore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  /** When the user picks a file, hold it and open the confirmation dialog. */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    setPendingFile(file)
    setConfirmOpen(true)
    // Reset input so the same file can be re-selected if needed
    e.target.value = ''
  }

  /** Confirmed – upload the file and restore. */
  const handleConfirmRestore = () => {
    if (!pendingFile) return
    triggerRestore(pendingFile, {
      onSettled: () => {
        setPendingFile(null)
        setConfirmOpen(false)
      },
    })
  }

  const handleCancelRestore = () => {
    setPendingFile(null)
    setConfirmOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Quản lý sao lưu và phục hồi dữ liệu cơ sở dữ liệu
        </p>
      </div>

      <Separator />

      {/* ── Backup ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCloudDownload className="size-5 text-primary" />
            Sao lưu dữ liệu
          </CardTitle>
          <CardDescription>
            Xuất toàn bộ cơ sở dữ liệu ra file <code>.sql</code> để bảo quản
            hoặc chuyển sang môi trường khác.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => triggerBackup()}
            disabled={isBackingUp}
            className="gap-2"
          >
            <IconCloudDownload className="size-4" />
            {isBackingUp ? 'Đang tạo bản sao lưu…' : 'Tạo bản sao lưu'}
          </Button>
        </CardContent>
      </Card>

      {/* ── Restore ───────────────────────────────────────────── */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabaseImport className="size-5 text-destructive" />
            Phục hồi dữ liệu
          </CardTitle>
          <CardDescription>
            Tải lên file <code>.sql</code> để phục hồi cơ sở dữ liệu từ một bản
            sao lưu trước đó.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Inline warning banner */}
          <div className="bg-destructive/10 border-destructive/30 flex items-start gap-3 rounded-md border px-4 py-3">
            <IconAlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
            <p className="text-destructive text-sm font-medium">
              Thao tác phục hồi sẽ{' '}
              <strong>ghi đè toàn bộ dữ liệu hiện tại</strong>. Hãy tạo bản sao
              lưu trước khi tiến hành.
            </p>
          </div>

          {/* File picker */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="restore-file">Chọn file SQL để phục hồi</Label>
            <div className="flex items-center gap-3">
              <input
                id="restore-file"
                ref={fileInputRef}
                type="file"
                accept=".sql"
                className="hidden"
                onChange={handleFileChange}
                disabled={isRestoring}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
                className="gap-2"
              >
                <IconDatabaseImport className="size-4" />
                {isRestoring ? 'Đang phục hồi…' : 'Chọn file .sql'}
              </Button>
              {pendingFile && !confirmOpen && (
                <span className="text-muted-foreground text-sm">
                  {pendingFile.name}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Confirmation AlertDialog ──────────────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="size-5" />
              Xác nhận phục hồi dữ liệu
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  ⚠️{' '}
                  <strong>
                    Cảnh báo: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại!
                  </strong>
                </p>
                <p>
                  File được chọn:{' '}
                  <code className="bg-muted rounded px-1 py-0.5">
                    {pendingFile?.name}
                  </code>
                </p>
                <p>
                  Tất cả dữ liệu hiện có sẽ bị xóa và thay thế bằng nội dung
                  trong file sao lưu. Hành động này{' '}
                  <strong>không thể hoàn tác</strong>.
                </p>
                <p>Bạn có chắc chắn muốn tiếp tục?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRestore}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={isRestoring}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRestoring ? 'Đang phục hồi…' : 'Xác nhận phục hồi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
