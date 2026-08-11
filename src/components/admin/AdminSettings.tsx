import { useState } from 'react'
import type { SiteSettings } from '@/types'

const defaultSettings: SiteSettings = {
  id: '1',
  announcement_text: 'Free delivery on orders over KES 15,000',
  hero_headline: 'Timeless Elegance for the Modern Woman',
  hero_subheadline: 'Discover O&N curated collection of premium fashion essentials',
  hero_cta_text: 'Shop Now',
  hero_cta_link: '/shop',
  featured_collection_id: null,
  promo_banner_text: 'Summer Sale - Up to 40% Off',
  promo_banner_link: '/shop?sale=true',
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  const update = (field: keyof SiteSettings, value: string | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-charcoal">Settings</h1>
        <button onClick={handleSave} className="btn-primary">
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-ivory-200 p-6 space-y-6">
        <div>
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Announcement Bar Text
          </label>
          <input
            type="text"
            value={settings.announcement_text || ''}
            onChange={(e) => update('announcement_text', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Hero Headline
          </label>
          <input
            type="text"
            value={settings.hero_headline || ''}
            onChange={(e) => update('hero_headline', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Hero Subheadline
          </label>
          <input
            type="text"
            value={settings.hero_subheadline || ''}
            onChange={(e) => update('hero_subheadline', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Promo Banner Text
          </label>
          <input
            type="text"
            value={settings.promo_banner_text || ''}
            onChange={(e) => update('promo_banner_text', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>
      </div>
    </div>
  )
}
