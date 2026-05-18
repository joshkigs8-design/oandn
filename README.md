# O & N FITS - Luxury 3D Fashion E-Commerce Website

## 🎨 Project Overview

O & N FITS is a premium, high-end 3D fashion e-commerce website for a luxury streetwear brand. The website features cutting-edge design with smooth animations, 3D elements using Three.js, and a fully functional admin dashboard for product management.

## ✨ Key Features

### 1. **Luxury Brand Identity**
- **Color Scheme**: Black (#0a0a0a), Deep Charcoal (#1a1a1a), Gold (#d4af37), and Light Gold (#e8c547)
- **Typography**: Bold, clean Inter sans-serif font
- **Feel**: Exclusive, elegant, futuristic design similar to top designer brands

### 2. **Pages & Functionality**

#### **Home Page (index.html)**
- Fullscreen hero section with 3D animated background
- "Luxury in Every Fit" brand slogan
- CTA buttons: "Shop Now" and "Explore Collection"
- Animated floating particles and gold accents
- Premium Craftsmanship feature cards
- Featured collection preview
- About section preview
- Complete footer with social links

#### **Shop Page (shop.html)**
- Premium grid layout with 4 columns on desktop
- Product filtering by category (Hoodies, T-Shirts, Jackets, Fits)
- Price sorting (Low to High / High to Low)
- Hover animations with 3D tilt effects
- Each product card displays: Image, Name, Category, Price, and "View Details" link
- Responsive design (1 column on mobile)

#### **Product Detail Page (product.html)**
- Large product preview with 3D rotation effect
- Product information: Name, Price, Sizes (S, M, L, XL)
- Size selection with visual feedback
- "Order via WhatsApp" button with pre-formatted message:
  - Format: `https://wa.me/254112854091?text=Hello%20I%20want%20to%20order%20[Product%20Name]%20-%20[Price]`
- Interactive 3D model display

#### **About Page (about.html)**
- Brand storytelling section
- "Crafted for Confidence" tagline
- Company values display: Quality, Innovation, Exclusivity
- Clean luxury brand layout

#### **Contact Page (contact.html)**
- WhatsApp contact with direct link
- Social media handles: @oandnfits (Instagram, TikTok, Twitter)
- Contact form that sends messages via WhatsApp
- Business hours information

#### **Admin Dashboard (admin.html)**
- **Sidebar Navigation**: Products, Add Product, Analytics
- **Products Tab**: Table showing all products with Edit/Delete buttons
- **Add Product Tab**: Form to add new products with:
  - Product Name
  - Category selection
  - Price input
  - Stock quantity
  - Description
  - Image upload
- **Analytics Tab**: Statistics dashboard showing:
  - Total Products
  - Total Stock
  - Pending Orders

### 3. **Design Features**

#### **Animations & Effects**
- Smooth scroll behavior throughout the site
- Fade-in and slide-up animations on page load
- 3D hover effects on product cards (tilt effect)
- Floating gold particles in hero section
- Glow effects on gold accents
- Smooth transitions on all interactive elements

#### **Visual Elements**
- Glassmorphism UI sections (semi-transparent backgrounds with blur)
- Soft shadows and gold highlights
- Gradient backgrounds
- Animated loading screen with logo pulse effect
- Smooth gradient text on headings

#### **Responsive Design**
- Mobile-optimized breakpoints (768px, 480px)
- Touch-friendly buttons and interactions
- Responsive navigation
- Optimized product grid (auto-fit columns)
- Mobile-first design approach

### 4. **3D Features**

#### **Three.js Implementation**
- **Hero Scene**: Animated geometric shapes (cube, sphere, torus, octahedron)
  - Rotating objects with smooth animations
  - Floating particles
  - Professional lighting with directional and ambient lights
  - Shadow rendering

- **Product Detail Scene**: Interactive 3D model
  - Rotating clothing representation
  - Mouse-controlled rotation
  - Responsive to viewport size

### 5. **Admin Features**

- **Product Management**:
  - View all products in table format
  - Add new products with image upload
  - Edit existing products
  - Delete products
  
- **Dashboard**:
  - Tab-based navigation
  - Product statistics
  - Local storage support for data persistence
  - Clean, organized interface

- **Image Management**:
  - Product image upload capability
  - SVG placeholder images for demo products

## 📁 File Structure

```
o and n/
├── index.html          # Home page
├── shop.html           # Shop/Products page
├── product.html        # Product detail page
├── about.html          # About page
├── contact.html        # Contact page
├── admin.html          # Admin dashboard
├── css/
│   └── style.css       # Complete styling (800+ lines)
├── js/
│   ├── main.js         # Main functionality & product data
│   ├── three-hero.js   # 3D hero scene
│   ├── product-3d.js   # 3D product detail scene
│   ├── admin.js        # Admin dashboard functionality
│   └── shop.js         # Shop page functionality
└── README.md           # This file
```

## 🎯 Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Dark | #0a0a0a | Background |
| Secondary Dark | #1a1a1a | Cards, Sections |
| Accent Gold | #d4af37 | Primary accent, Headlines |
| Light Gold | #e8c547 | Highlights |
| Text White | #ffffff | Primary text |
| Text Light | #e0e0e0 | Secondary text |
| Text Muted | #a0a0a0 | Tertiary text |
| Charcoal | #2d2d2d | Borders, Dark elements |

## 🚀 Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: 
  - CSS Variables for theme management
  - Flexbox & Grid layouts
  - Animations & Transitions
  - Gradient backgrounds
  - Backdrop filters (glassmorphism)
  
- **JavaScript**: 
  - DOM manipulation
  - Event handling
  - Three.js integration
  - Local storage
  - WhatsApp API integration

- **Three.js**: 3D graphics library for WebGL rendering

- **Google Fonts**: Inter font family

## 📱 Responsive Breakpoints

- **Desktop**: 1400px max-width
- **Tablet**: 768px breakpoint
- **Mobile**: 480px breakpoint

## 🔗 Integration Points

### WhatsApp Integration
- Contact form: `https://wa.me/254112854091`
- Product orders: `https://wa.me/254112854091?text=[Custom Message]`
- Phone number: 0112854091 (East Africa)

### Social Media Handles
- Instagram: @oandnfits
- TikTok: @oandnfits
- Twitter: @oandnfits

## 🎬 Animation Details

### Loading Screen
- Gold gradient logo with pulse glow effect
- Fades out after 2 seconds
- Smooth transition

### Hero Section
- 20 animated floating particles
- 3D geometric shapes rotating smoothly
- Parallax-like movement on mouse

### Product Cards
- Scale transform on hover
- 3D tilt effect
- Gold border highlight
- Shadow enhancement

### Buttons
- Color transition on hover
- Transform (translateY) effect
- Smooth box-shadow transition

## 💾 Data Management

### Products Database
```javascript
const products = [
    {
        id: number,
        name: string,
        category: string,
        price: number,
        image: string (SVG or URL)
    }
]
```

### Local Storage
- Stores admin products in browser
- Key: `o-n-fits-products`
- Persists across page refreshes

## 🔐 Security Considerations

- All product management is client-side for demo
- Image uploads are file inputs (no actual server upload in this version)
- WhatsApp links use standard API format
- No sensitive data stored locally

## 🎓 Learning Resources

### CSS Features Demonstrated
- CSS Custom Properties (Variables)
- Gradient backgrounds
- Backdrop filters
- Media queries for responsiveness
- Animation keyframes
- Transform properties
- Box shadows and text shadows

### JavaScript Features Demonstrated
- DOM selection and manipulation
- Event listeners
- Array methods (map, filter, forEach)
- Local storage API
- Object-oriented design
- Module pattern

### Three.js Features Demonstrated
- Scene setup
- Camera positioning
- Renderer configuration
- Geometry and material creation
- Lighting (ambient and directional)
- Animation loops
- Window resize handling
- Mouse interaction

## 📈 Performance Optimizations

- Lazy loading animations
- SVG placeholder images (small file size)
- Efficient CSS selectors
- Optimized Three.js scene
- No blocking JavaScript
- Smooth scrolling for better UX

## 🎨 Customization Guide

### Change Brand Color
Edit CSS variables in `:root` selector:
```css
--accent-gold: #d4af37; /* Change to your color */
```

### Add New Products
Add to `products` array in `js/main.js`:
```javascript
{
    id: 5,
    name: "Your Product",
    category: "category",
    price: 199,
    image: "url-or-svg"
}
```

### Modify WhatsApp Number
Replace `254112854091` throughout the codebase with your number (without +)

### Change Social Media Handles
Update links in HTML footer sections and contact page

## 🚀 Deployment

To deploy:
1. Upload all files to web server
2. Ensure .html files are at root directory
3. Keep css/ and js/ folders in relative paths
4. Test all links and WhatsApp integration
5. Optimize images before deployment

## 📞 Support

For questions or issues:
- WhatsApp: 0112854091
- Instagram: @oandnfits
- Email: Available through contact form

## 📄 License

© 2026 O & N FITS. All rights reserved.

---

**Created**: May 12, 2026  
**Version**: 1.0  
**Status**: Production Ready
