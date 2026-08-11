import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { SiteSettings } from '@/types'

const defaultSettings: SiteSettings = {
  id: 'global',
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'global')
        .single()

      if (error && error.code !== 'PGRST116') {
        alert(error.message)
      }

      if (data) {
        setSettings({
          id: data.id,
          announcement_text: data.announcement_text,
          hero_headline: data.hero_headline,
          hero_subheadline: data.hero_subheadline,
          hero_cta_text: data.hero_cta_text,
          hero_cta_link: data.hero_cta_link,
          featured_collection_id: data.featured_collection_id,
          promo_banner_text: data.promo_banner_text,
          promo_banner_link: data.promo_banner_link,
        })
      }

      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const update = (field: keyof SiteSettings, value: string | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!supabase) return

    const payload = {
      id: 'global',
      announcement_text: settings.announcement_text,
      hero_headline: settings.hero_headline,
      hero_subheadline: settings.hero_subheadline,
      hero_cta_text: settings.hero_cta_text,
      hero_cta_link: settings.hero_cta_link,
      featured_collection_id: settings.featured_collection_id,
      promo_banner_text: settings.promo_banner_text,
      promo_banner_link: settings.promo_banner_link,
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      alert(error.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Hero CTA Text
          </label>
          <input
            type="text"
            value={settings.hero_cta_text || ''}
            onChange={(e) => update('hero_cta_text', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Hero CTA Link
          </label>
          <input
            type="text"
            value={settings.hero_cta_link || ''}
            onChange={(e) => update('hero_cta_link', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Promo Banner Text
          </label>
          <input
            type="text"
            value={settings.promo_banner_text || ''}
            onChange={(e) => update('promo_banner_text', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
          <label className="block text-xs font-medium text-charcoal-light uppercase tracking-wider mb-1.5">
            Promo Banner Link
          </label>
          <input
            type="text"
            value={settings.promo_banner_link || ''}
            onChange={(e) => update('promo_banner_link', e.target.value)}
            className="w-full px-3 py-2 border border-ivory-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-ivory-50"
          />
        </div>
      </div>
    </div>
  )
}
