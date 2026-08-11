export default function AnnouncementBar() {
  const message = '✦ FREE DELIVERY ON ORDERS ABOVE KES 5,000'

  return (
    <div className="sticky top-0 z-50 border-b border-ivory-200 bg-ivory-100/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-taupe-500">
          <span className="text-gold-600">{message}</span>
        </p>
      </div>
    </div>
  )
}
