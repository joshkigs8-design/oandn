import { useState } from 'react'
import type { ProductImage } from '@/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const hasImages = images.length > 0
  const currentImage = hasImages ? images[selectedIndex] : null

  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-ivory-200 overflow-hidden rounded-lg">
        {currentImage?.image_url ? (
          <img
            src={currentImage.image_url}
            alt={currentImage.alt_text || productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-ivory-300">
            <span className="font-serif text-charcoal/30 text-4xl">O&amp;N</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-20 border-2 transition-colors rounded ${
                index === selectedIndex ? 'border-gold-500' : 'border-ivory-300'
              }`}
              aria-label={`View ${image.alt_text || productName} ${index + 1}`}
            >
              {image.image_url ? (
                <img src={image.image_url} alt={image.alt_text || productName} className="w-full h-full object-cover rounded" />
              ) : (
                <div className="w-full h-full bg-ivory-200 flex items-center justify-center">
                  <span className="font-serif text-charcoal/30 text-xs">O&amp;N</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
