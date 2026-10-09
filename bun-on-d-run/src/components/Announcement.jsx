import { useInfo } from '../lib/store'

/** Banner slot the owner publishes to from the dashboard's Hours & Info editor. */
export default function Announcement() {
  const [info] = useInfo()
  if (!info.announcement?.trim()) return null
  return (
    <div className="bg-flame px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-asphalt">
      {info.announcement}
    </div>
  )
}
