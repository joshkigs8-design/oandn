export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  description: string | null
  sort_order: number
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  sort_order: number
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  sku: string | null
  stock_quantity: number
  price: number
  sale_price: number | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  category_id: string | null
  images: ProductImage[]
  variants: ProductVariant[]
  is_new_arrival: boolean
  is_featured: boolean
  is_best_seller: boolean
  stock_quantity: number
  sku: string | null
  created_at: string
}

export interface CartItem {
  id: string
  product_id: string
  variant_id: string | null
  quantity: number
  product: Product
  variant: ProductVariant | null
}

export interface WishlistItem {
  id: string
  product_id: string
  product: Product
}

export interface Address {
  id: string
  full_name: string
  phone: string
  county: string
  town: string
  address_line: string
  is_default: boolean
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  variant_label: string | null
  quantity: number
  unit_price: number
  total_price: number
  product_image_url: string | null
}

export interface Order {
  id: string
  user_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  transaction_ref: string | null
  subtotal: number
  delivery_fee: number
  total: number
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_county: string
  delivery_town: string
  delivery_address: string
  delivery_instructions: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface SiteSettings {
  id: string
  announcement_text: string | null
  hero_headline: string | null
  hero_subheadline: string | null
  hero_cta_text: string | null
  hero_cta_link: string | null
  featured_collection_id: string | null
  promo_banner_text: string | null
  promo_banner_link: string | null
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  created_at: string
}
