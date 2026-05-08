import { CheckCircle2, CircleAlert } from 'lucide-react'

interface BannersProps {
  error: string | null
  notice: string | null
}

export function Banners({ error, notice }: BannersProps) {
  return (
    <>
      {error && (
        <div className="banner banner-error">
          <CircleAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="banner banner-success">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}
    </>
  )
}
