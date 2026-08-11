import Hero from '@/components/hero/Hero'
import ShopByCategory from '@/components/sections/ShopByCategory'
import NewArrivals from '@/components/sections/NewArrivals'
import FeaturedCollection from '@/components/sections/FeaturedCollection'
import BrandStory from '@/components/sections/BrandStory'
import PromoBanner from '@/components/sections/PromoBanner'
import WhyShop from '@/components/sections/WhyShop'
import Newsletter from '@/components/sections/Newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <NewArrivals />
      <FeaturedCollection />
      <BrandStory />
      <PromoBanner />
      <WhyShop />
      <Newsletter />
    </>
  )
}
