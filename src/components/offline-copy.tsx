import { HardDriveDownload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isOfflineCopy } from '@/lib/offline-copy'
import { useLocale } from '@/lib/use-locale'

const OFFLINE_FILE = 'huth-calculator.html'

export function OfflineCopy() {
  const { m } = useLocale()
  if (isOfflineCopy()) return null

  const href = `${import.meta.env.BASE_URL}downloads/${OFFLINE_FILE}`

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={href} download={OFFLINE_FILE}>
        <HardDriveDownload />
        {m.header.offlineCopy}
      </a>
    </Button>
  )
}
