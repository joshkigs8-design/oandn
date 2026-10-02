export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  gallery: string[];
  sizes: string[];
  colors: Swatch[];
  isNew?: boolean;
  featured?: boolean;
  inStock?: boolean;
  description: string;
};

export type Category = { id?: string; slug: string; name: string; image: string };

export const categories: Category[] = [
  { slug: "hoodies", name: "Hoodies", image: "/images/catalog/on-real-45.jpeg" },
  { slug: "sweatshirts", name: "Sweatshirts", image: "/images/catalog/on-real-03.jpeg" },
  { slug: "bottoms", name: "Pants & Trousers", image: "/images/catalog/on-real-37.jpeg" },
  { slug: "shorts", name: "Shorts", image: "/images/catalog/on-real-18.jpeg" },
  { slug: "sets", name: "Co-ord Sets", image: "/images/catalog/on-real-11.jpeg" },
  { slug: "ladies", name: "Crop Tops", image: "/images/catalog/on-real-24.jpeg" },
  { slug: "t-shirts", name: "T-Shirts", image: "/images/catalog/on-real-15.jpeg" },
  { slug: "vests", name: "Vests", image: "/images/catalog/on-real-35.jpeg" },
  { slug: "outerwear", name: "Outerwear & Jackets", image: "/images/catalog/on-real-13.jpeg" },
  { slug: "accessories", name: "Beanies & Accessories", image: "/images/catalog/on-real-15.jpeg" },
];

const APPAREL = ["S", "M", "L", "XL", "XXL"];
const CROPTOP_SIZES = ["S", "M", "L", "XL"];
const ONE_SIZE = ["One Size"];

export type Swatch = { name: string; hex: string };

/** Master colour library — also powers the colour picker in the admin portal. */
export const swatchPalette: Swatch[] = [
  { name: "Cream", hex: "#EDE3D2" },
  { name: "Off White", hex: "#F7F4EE" },
  { name: "Sand", hex: "#DCC9AC" },
  { name: "Camel", hex: "#C29A6C" },
  { name: "Mocha", hex: "#7A5C43" },
  { name: "Chocolate", hex: "#4A3427" },
  { name: "Taupe", hex: "#B3A492" },
  { name: "Stone Grey", hex: "#9A9A93" },
  { name: "Charcoal", hex: "#3A3A3C" },
  { name: "Black", hex: "#141414" },
  { name: "Royal Blue", hex: "#1B3B6F" },
  { name: "Sky Blue", hex: "#7FB6DE" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Teal", hex: "#2E7D7B" },
  { name: "Sage", hex: "#A9BBA0" },
  { name: "Olive", hex: "#6B7248" },
  { name: "Forest Green", hex: "#2F4A38" },
  { name: "Blush Pink", hex: "#E7C3C1" },
  { name: "Rose", hex: "#C97F7F" },
  { name: "Burgundy", hex: "#5C1F2B" },
  { name: "Rust", hex: "#B25B34" },
  { name: "Mustard", hex: "#D2A03C" },
  { name: "Lilac", hex: "#C6B6DD" },
  { name: "Plum", hex: "#4B2E4E" },
];

export const findSwatch = (name: string) =>
  swatchPalette.find((s) => s.name.toLowerCase() === name.toLowerCase());

const swatch = (name: string): Swatch => findSwatch(name) ?? { name, hex: "#CCCCCC" };

const cream = swatch("Cream");
const offWhite = swatch("Off White");
const black = swatch("Black");
const camel = swatch("Camel");
const royalBlue = swatch("Royal Blue");
const forestGreen = swatch("Forest Green");
const mustard = swatch("Mustard");
const rust = swatch("Rust");
const lilac = swatch("Lilac");
const chocolate = swatch("Chocolate");
const charcoal = swatch("Charcoal");

/** Master O&N FITS Real Product Catalogue — All 48 Photos from the photoshoot mapped as products */
export const products: Product[] = [
  {
    id: "prod-01",
    slug: "on-plain-sweatpants-forest-green-terrace",
    name: "O&N Plain Wide-Leg Sweatpants — Forest Green (Terrace Edition)",
    price: 3000,
    category: "bottoms",
    image: "/images/catalog/on-real-01.jpeg",
    gallery: [
      "/images/catalog/on-real-01.jpeg",
      "/images/catalog/on-real-22.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Relaxed wide-leg loopback fleece sweatpants in rich forest green with covered elastic waistband and tonal embroidery.",
  },

  {
    id: "prod-02",
    slug: "on-designed-cargo-set-orange-atrium",
    name: "O&N Designed Utility Cargo Set — Safety Orange (Atrium Edition)",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-02.jpeg",
    gallery: [
      "/images/catalog/on-real-02.jpeg",
      "/images/catalog/on-real-33.jpeg",
      "/images/catalog/on-real-25.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "High-visibility two-piece streetwear set with cropped zip utility jacket and matching strap-accent cargo pants.",
  },

  {
    id: "prod-03",
    slug: "on-designed-sweatshirt-yellow-stairs",
    name: "O&N Designed Graphic Crewneck Sweatshirt — Vibrant Yellow",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-03.jpeg",
    gallery: [
      "/images/catalog/on-real-03.jpeg",
      "/images/catalog/on-real-30.jpeg",
      "/images/catalog/on-real-32.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Vibrant golden yellow crewneck sweatshirt showcasing cursive @ O&N FITS embroidery in contrasting red stitching.",
  },

  {
    id: "prod-04",
    slug: "on-designed-tearaway-pants-lounge",
    name: "O&N Designed Snap-Buttoned Tearaway Pants — Lounge Cut",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-04.jpeg",
    gallery: [
      "/images/catalog/on-real-04.jpeg",
      "/images/catalog/on-real-37.jpeg",
      "/images/catalog/on-real-08.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Yellow streetwear sweatpants featuring functional black snap buttons down outer side seams with relaxed lounge proportions.",
  },

  {
    id: "prod-05",
    slug: "on-designed-cropped-zip-jacket",
    name: "O&N Designed Cropped Zip Sweatshirt — Forest Green",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-05.jpeg",
    gallery: [
      "/images/catalog/on-real-05.jpeg",
      "/images/catalog/on-real-06.jpeg",
      "/images/catalog/on-real-23.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "High-collar full-zip cropped sweatshirt in heavyweight forest green fleece with elasticated cinch waistband.",
  },

  {
    id: "prod-06",
    slug: "on-fleece-sweat-shorts-green-terrace",
    name: "O&N Fleece Casual Sweat Shorts — Forest Green (Terrace Edition)",
    price: 2500,
    category: "shorts",
    image: "/images/catalog/on-real-06.jpeg",
    gallery: [
      "/images/catalog/on-real-06.jpeg",
      "/images/catalog/on-real-18.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Heavyweight brushed fleece casual shorts in forest green with deep utility pockets and gathered waistband.",
  },

  {
    id: "prod-07",
    slug: "on-plain-two-piece-uniform-beige",
    name: "O&N Plain Heavyweight 2-Piece Uniform Set — Camel Beige",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-07.jpeg",
    gallery: [
      "/images/catalog/on-real-07.jpeg",
      "/images/catalog/on-real-45.jpeg",
      "/images/catalog/on-real-43.jpeg",
    ],
    sizes: APPAREL,
    colors: [camel, cream],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "The master luxury uniform: Heavyweight 420 GSM Camel Beige Hoodie paired with matching relaxed sweatpants.",
  },

  {
    id: "prod-08",
    slug: "on-designed-tearaway-pants-runway",
    name: "O&N Designed Snap-Buttoned Tearaway Pants — Runway Edition",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-08.jpeg",
    gallery: [
      "/images/catalog/on-real-08.jpeg",
      "/images/catalog/on-real-37.jpeg",
      "/images/catalog/on-real-28.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Runway-cut yellow tearaway sweatpants with contrast black pocket accents and full outer leg snaps.",
  },

  {
    id: "prod-09",
    slug: "on-plush-overcoat-editorial",
    name: "O&N Plush Ribbed Longline Overcoat — Off-White (Editorial Edition)",
    price: 3500,
    category: "outerwear",
    image: "/images/catalog/on-real-09.jpeg",
    gallery: [
      "/images/catalog/on-real-09.jpeg",
      "/images/catalog/on-real-13.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Longline plush textured ribbed coat with deep oversized collar, tailored lapels, and insulating satin lining.",
  },

  {
    id: "prod-10",
    slug: "on-designed-cargo-pants-orange",
    name: "O&N Designed Utility Cargo Pants — Safety Orange",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-10.jpeg",
    gallery: [
      "/images/catalog/on-real-10.jpeg",
      "/images/catalog/on-real-26.jpeg",
      "/images/catalog/on-real-29.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Streetwear utility cargo sweatpants in high-visibility safety orange with dual contrast black patch pockets.",
  },

  {
    id: "prod-11",
    slug: "on-plain-hoodie-royal-blue",
    name: "O&N Plain Heavyweight Hoodie & Set — Royal Blue",
    price: 3000,
    category: "hoodies",
    image: "/images/catalog/on-real-11.jpeg",
    gallery: [
      "/images/catalog/on-real-11.jpeg",
    ],
    sizes: APPAREL,
    colors: [royalBlue],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Vibrant royal blue heavy fleece hoodie featuring braided white drawstrings, deep pouch pocket, and clean O&N embroidery.",
  },

  {
    id: "prod-12",
    slug: "on-designed-flared-pants",
    name: "O&N Designed Flared Contrast Pants — Forest Green & Off-White",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-12.jpeg",
    gallery: [
      "/images/catalog/on-real-12.jpeg",
      "/images/catalog/on-real-24.jpeg",
      "/images/catalog/on-real-35.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen, offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Tailored flared sweatpants crafted in rich forest green fleece with crisp off-white contrast side panels.",
  },

  {
    id: "prod-13",
    slug: "on-plush-overcoat",
    name: "O&N Plush Ribbed Longline Overcoat — Studio Edition",
    price: 3500,
    category: "outerwear",
    image: "/images/catalog/on-real-13.jpeg",
    gallery: [
      "/images/catalog/on-real-13.jpeg",
      "/images/catalog/on-real-15.jpeg",
      "/images/catalog/on-real-09.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Statement longline plush textured coat with deep drop shoulders and refined architectural drape.",
  },

  {
    id: "prod-14",
    slug: "on-designed-sweatshirt-purple-wave",
    name: "O&N Designed Wavy Two-Tone Sweatshirt — Lilac & Off-White",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-14.jpeg",
    gallery: [
      "/images/catalog/on-real-14.jpeg",
      "/images/catalog/on-real-19.jpeg",
    ],
    sizes: APPAREL,
    colors: [lilac, offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Artisanal cut-and-sew wavy split crewneck sweatshirt in pastel lilac and pure white with chest branding.",
  },

  {
    id: "prod-15",
    slug: "on-designed-graphic-tshirt",
    name: "O&N Designed Heavyweight Streetwear T-Shirt — Black",
    price: 2000,
    category: "t-shirts",
    image: "/images/catalog/on-real-15.jpeg",
    gallery: [
      "/images/catalog/on-real-15.jpeg",
      "/images/catalog/on-real-16.jpeg",
    ],
    sizes: APPAREL,
    colors: [black, offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Heavyweight 260 GSM combed cotton luxury streetwear tee with high-density embroidered O&N FITS artwork.",
  },

  {
    id: "prod-16",
    slug: "on-ladies-crop-top-black",
    name: "O&N Baby Tee Crop Top — Black",
    price: 1000,
    category: "ladies",
    image: "/images/catalog/on-real-16.jpeg",
    gallery: [
      "/images/catalog/on-real-16.jpeg",
      "/images/catalog/on-real-15.jpeg",
    ],
    sizes: CROPTOP_SIZES,
    colors: [black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Form-fitting short-sleeve baby tee in dense stretch cotton jersey with embroidered O&N FITS center chest logo.",
  },

  {
    id: "prod-17",
    slug: "on-plain-sweatpants-black",
    name: "O&N Plain Heavyweight Sweatpants — Pitch Black",
    price: 3000,
    category: "bottoms",
    image: "/images/catalog/on-real-17.jpeg",
    gallery: [
      "/images/catalog/on-real-17.jpeg",
      "/images/catalog/on-real-15.jpeg",
    ],
    sizes: APPAREL,
    colors: [black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Essential heavyweight black sweatpants featuring discreet O&N FITS insignia and ultra-soft brushed fleece interior.",
  },

  {
    id: "prod-18",
    slug: "on-fleece-sweat-shorts-green",
    name: "O&N Fleece Casual Sweat Shorts — Forest Green",
    price: 2500,
    category: "shorts",
    image: "/images/catalog/on-real-18.jpeg",
    gallery: [
      "/images/catalog/on-real-18.jpeg",
      "/images/catalog/on-real-06.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Heavyweight brushed fleece casual shorts in forest green with deep utility pockets and gathered waistband.",
  },

  {
    id: "prod-19",
    slug: "on-designed-sweatshirt-pastel-wave",
    name: "O&N Designed Wavy Cut-and-Sew Sweatshirt — Pastel Wave",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-19.jpeg",
    gallery: [
      "/images/catalog/on-real-19.jpeg",
      "/images/catalog/on-real-14.jpeg",
    ],
    sizes: APPAREL,
    colors: [lilac, offWhite],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Custom organic wavy curve two-tone sweatshirt in soft lilac fleece and crisp white fleece.",
  },

  {
    id: "prod-20",
    slug: "on-plain-sweatshirt-white",
    name: "O&N Plain Crewneck Loopback Sweatshirt — Optic White",
    price: 2500,
    category: "sweatshirts",
    image: "/images/catalog/on-real-20.jpeg",
    gallery: [
      "/images/catalog/on-real-20.jpeg",
      "/images/catalog/on-real-21.jpeg",
      "/images/catalog/on-real-48.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Timeless crewneck sweatshirt in optic white 420 GSM loopback cotton fleece with ribbed collar, cuffs, and hem.",
  },

  {
    id: "prod-21",
    slug: "on-designed-side-stripe-pants",
    name: "O&N Designed Side-Stripe Sweatpants — Optic White & Green",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-21.jpeg",
    gallery: [
      "/images/catalog/on-real-21.jpeg",
      "/images/catalog/on-real-20.jpeg",
      "/images/catalog/on-real-36.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite, forestGreen],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Clean optic white loopback sweatpants featuring a vertical forest green athletic side stripe along the outer seam.",
  },

  {
    id: "prod-22",
    slug: "on-plain-sweatpants-forest-green",
    name: "O&N Plain Relaxed Wide-Leg Sweatpants — Forest Green",
    price: 3000,
    category: "bottoms",
    image: "/images/catalog/on-real-22.jpeg",
    gallery: [
      "/images/catalog/on-real-22.jpeg",
      "/images/catalog/on-real-01.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Relaxed wide-leg fleece sweatpants in deep forest green with covered elastic waistband and flat drawstrings.",
  },

  {
    id: "prod-23",
    slug: "on-designed-cropped-zip-terrace",
    name: "O&N Designed Cropped Zip Sweatshirt — Terrace Edition",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-23.jpeg",
    gallery: [
      "/images/catalog/on-real-23.jpeg",
      "/images/catalog/on-real-05.jpeg",
    ],
    sizes: APPAREL,
    colors: [forestGreen],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "High-collar full-zip cropped fleece in forest green with silver zipper and white chest embroidery.",
  },

  {
    id: "prod-24",
    slug: "on-ladies-ribbed-crop-top-white",
    name: "O&N Ribbed High-Neck Tank Crop Top — Off-White",
    price: 1000,
    category: "ladies",
    image: "/images/catalog/on-real-24.jpeg",
    gallery: [
      "/images/catalog/on-real-24.jpeg",
      "/images/catalog/on-real-35.jpeg",
      "/images/catalog/on-real-44.jpeg",
    ],
    sizes: CROPTOP_SIZES,
    colors: [offWhite],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "High-neck sleeveless ribbed knit crop top in off-white featuring embroidered O&N FITS signature at chest.",
  },

  {
    id: "prod-25",
    slug: "on-designed-cargo-set-orange-street",
    name: "O&N Designed Utility Cargo Two-Piece Set — Street Edition",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-25.jpeg",
    gallery: [
      "/images/catalog/on-real-25.jpeg",
      "/images/catalog/on-real-33.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Full two-piece matching set in safety orange featuring cropped zip jacket and cargo strap utility pants.",
  },

  {
    id: "prod-26",
    slug: "on-designed-cargo-pants-strap",
    name: "O&N Designed Utility Cargo Pants — Pocket & Strap Edition",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-26.jpeg",
    gallery: [
      "/images/catalog/on-real-26.jpeg",
      "/images/catalog/on-real-10.jpeg",
      "/images/catalog/on-real-33.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Orange cargo sweatpants with functional contrast black utility flap pockets and woven straps.",
  },

  {
    id: "prod-27",
    slug: "on-designed-utility-jacket-orange",
    name: "O&N Designed Utility Cropped Jacket — High-Collar Safety Orange",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-27.jpeg",
    gallery: [
      "/images/catalog/on-real-27.jpeg",
      "/images/catalog/on-real-34.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "High-visibility safety orange cropped utility jacket with structured mock collar and full zip closure.",
  },

  {
    id: "prod-28",
    slug: "on-designed-tearaway-pants-highrise",
    name: "O&N Designed Snap-Buttoned Tearaway Pants — High-Rise Edition",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-28.jpeg",
    gallery: [
      "/images/catalog/on-real-28.jpeg",
      "/images/catalog/on-real-37.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Vibrant yellow tearaway pants with functional outer leg snap buttons and relaxed high-rise silhouette.",
  },

  {
    id: "prod-29",
    slug: "on-designed-cargo-pants-urban",
    name: "O&N Designed Utility Cargo Pants — Urban Edition",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-29.jpeg",
    gallery: [
      "/images/catalog/on-real-29.jpeg",
      "/images/catalog/on-real-10.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Streetwear cargo pants in safety orange with black pocket accents and relaxed athletic drape.",
  },

  {
    id: "prod-30",
    slug: "on-designed-sweatshirt-yellow-escalator",
    name: "O&N Designed Graphic Sweatshirt — Escalator Edition",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-30.jpeg",
    gallery: [
      "/images/catalog/on-real-30.jpeg",
      "/images/catalog/on-real-03.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Golden yellow crewneck sweatshirt with embroidered O&N script logo across chest in contrasting red stitch.",
  },

  {
    id: "prod-31",
    slug: "on-designed-streetwear-duo-atrium",
    name: "O&N Designed Graphic Streetwear Duo — Atrium Edition",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-31.jpeg",
    gallery: [
      "/images/catalog/on-real-31.jpeg",
      "/images/catalog/on-real-03.jpeg",
      "/images/catalog/on-real-37.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Signature two-piece yellow streetwear uniform combining graphic crewneck sweatshirt with buttoned tearaway pants.",
  },

  {
    id: "prod-32",
    slug: "on-designed-sweatshirt-yellow-gold",
    name: "O&N Designed Graphic Crewneck Sweatshirt — Gold Embroidered",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-32.jpeg",
    gallery: [
      "/images/catalog/on-real-32.jpeg",
      "/images/catalog/on-real-03.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Heavyweight pre-shrunk fleece crewneck in warm yellow with cursive @ O&N FITS embroidery.",
  },

  {
    id: "prod-33",
    slug: "on-designed-cargo-set-orange",
    name: "O&N Designed Utility Cargo Two-Piece Set — Safety Orange",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-33.jpeg",
    gallery: [
      "/images/catalog/on-real-33.jpeg",
      "/images/catalog/on-real-10.jpeg",
      "/images/catalog/on-real-25.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "High-impact two-piece matching set with orange cropped zip jacket and cargo strap utility pants.",
  },

  {
    id: "prod-34",
    slug: "on-designed-utility-jacket-zip",
    name: "O&N Designed Utility Cropped Jacket — Front Zip Edition",
    price: 3000,
    category: "sweatshirts",
    image: "/images/catalog/on-real-34.jpeg",
    gallery: [
      "/images/catalog/on-real-34.jpeg",
      "/images/catalog/on-real-27.jpeg",
    ],
    sizes: APPAREL,
    colors: [rust, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Cropped utility jacket in safety orange with silver-tone zip closure and contrast black pocket detailing.",
  },

  {
    id: "prod-35",
    slug: "on-ribbed-sleeveless-vest",
    name: "O&N Ribbed Sleeveless Knit Vest — Off-White",
    price: 1500,
    category: "vests",
    image: "/images/catalog/on-real-35.jpeg",
    gallery: [
      "/images/catalog/on-real-35.jpeg",
      "/images/catalog/on-real-24.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite, black, camel],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Premium ribbed sleeveless knit vest with structured neckline and tonal O&N embroidery.",
  },

  {
    id: "prod-36",
    slug: "on-designed-side-stripe-pants-ground",
    name: "O&N Designed Athletic Side-Stripe Sweatpants — Grounds Edition",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-36.jpeg",
    gallery: [
      "/images/catalog/on-real-36.jpeg",
      "/images/catalog/on-real-20.jpeg",
      "/images/catalog/on-real-21.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite, forestGreen],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Optic white loopback cotton sweatpants with bold vertical green athletic side stripe along outer seams.",
  },

  {
    id: "prod-37",
    slug: "on-designed-buttoned-pants",
    name: "O&N Designed Snap-Buttoned Tearaway Pants — Vibrant Yellow",
    price: 3500,
    category: "bottoms",
    image: "/images/catalog/on-real-37.jpeg",
    gallery: [
      "/images/catalog/on-real-37.jpeg",
      "/images/catalog/on-real-08.jpeg",
      "/images/catalog/on-real-03.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Vibrant yellow streetwear sweatpants featuring functional black snap buttons down outer side seams.",
  },

  {
    id: "prod-38",
    slug: "on-designed-applique-track-set",
    name: "O&N Designed Applique Runway Tracksuit Set — Yellow & Black",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-38.jpeg",
    gallery: [
      "/images/catalog/on-real-38.jpeg",
      "/images/catalog/on-real-41.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Avant-garde runway two-piece tracksuit featuring handcrafted black wave leaf applique motifs.",
  },

  {
    id: "prod-39",
    slug: "on-ladies-crop-top-beige",
    name: "O&N Ribbed Tee Crop Top — Camel Beige",
    price: 1000,
    category: "ladies",
    image: "/images/catalog/on-real-39.jpeg",
    gallery: [
      "/images/catalog/on-real-39.jpeg",
      "/images/catalog/on-real-40.jpeg",
      "/images/catalog/on-real-07.jpeg",
    ],
    sizes: CROPTOP_SIZES,
    colors: [camel],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Short-sleeve ribbed crop top in soft camel beige with tonal O&N FITS chest embroidery and tailored round neck.",
  },

  {
    id: "prod-40",
    slug: "on-designed-hoodie",
    name: "O&N Designed Heavyweight Statement Hoodie — Camel Beige",
    price: 3500,
    category: "hoodies",
    image: "/images/catalog/on-real-40.jpeg",
    gallery: [
      "/images/catalog/on-real-40.jpeg",
      "/images/catalog/on-real-47.jpeg",
    ],
    sizes: APPAREL,
    colors: [camel, charcoal],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Elevated statement hoodie featuring custom designer proportions, deep pouch pocket, and tonal O&N FITS crest detailing.",
  },

  {
    id: "prod-41",
    slug: "on-designed-applique-tracksuit-back",
    name: "O&N Designed Applique Wave Tracksuit — Back Profile Edition",
    price: 6000,
    category: "sets",
    image: "/images/catalog/on-real-41.jpeg",
    gallery: [
      "/images/catalog/on-real-41.jpeg",
      "/images/catalog/on-real-38.jpeg",
    ],
    sizes: APPAREL,
    colors: [mustard, black],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Full-zip runway jacket and trousers with handcrafted organic wave applique paneling along arms and legs.",
  },

  {
    id: "prod-42",
    slug: "on-plain-hoodie-rooftop",
    name: "O&N Plain Heavyweight Hoodie — Rooftop Camel",
    price: 3000,
    category: "hoodies",
    image: "/images/catalog/on-real-42.jpeg",
    gallery: [
      "/images/catalog/on-real-42.jpeg",
      "/images/catalog/on-real-45.jpeg",
    ],
    sizes: APPAREL,
    colors: [camel, cream],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "420 GSM loopback cotton fleece hoodie in warm camel beige with double-lined hood and drop-shoulder cut.",
  },

  {
    id: "prod-43",
    slug: "on-plain-sweatpants-beige",
    name: "O&N Plain Relaxed Sweatpants — Camel Beige",
    price: 3000,
    category: "bottoms",
    image: "/images/catalog/on-real-43.jpeg",
    gallery: [
      "/images/catalog/on-real-43.jpeg",
      "/images/catalog/on-real-39.jpeg",
      "/images/catalog/on-real-07.jpeg",
    ],
    sizes: APPAREL,
    colors: [camel, cream],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Everyday luxury sweatpants in solid camel beige loopback fleece with covered elastic waist and deep pockets.",
  },

  {
    id: "prod-44",
    slug: "on-ladies-crop-top-white-studio",
    name: "O&N Ribbed High-Neck Crop Top — Studio White",
    price: 1000,
    category: "ladies",
    image: "/images/catalog/on-real-44.jpeg",
    gallery: [
      "/images/catalog/on-real-44.jpeg",
      "/images/catalog/on-real-24.jpeg",
    ],
    sizes: CROPTOP_SIZES,
    colors: [offWhite],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "High-neck sleeveless ribbed knit crop top in pure white with breathable stretch and embroidered logo.",
  },

  {
    id: "prod-45",
    slug: "on-plain-hoodie-beige",
    name: "O&N Plain Heavyweight Hoodie — Camel Beige",
    price: 3000,
    category: "hoodies",
    image: "/images/catalog/on-real-45.jpeg",
    gallery: [
      "/images/catalog/on-real-45.jpeg",
      "/images/catalog/on-real-42.jpeg",
      "/images/catalog/on-real-47.jpeg",
    ],
    sizes: APPAREL,
    colors: [camel, cream],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Master 420 GSM brushed loopback fleece hoodie in warm camel beige. Drop shoulder cut with tonal embroidery.",
  },

  {
    id: "prod-46",
    slug: "on-ladies-crop-top-white-pair",
    name: "O&N Ribbed High-Neck Tank Crop Top — Flared Pair",
    price: 1000,
    category: "ladies",
    image: "/images/catalog/on-real-46.jpeg",
    gallery: [
      "/images/catalog/on-real-46.jpeg",
      "/images/catalog/on-real-24.jpeg",
      "/images/catalog/on-real-12.jpeg",
    ],
    sizes: CROPTOP_SIZES,
    colors: [offWhite],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Off-white ribbed knit high-neck crop top with embroidered signature logo, styled with flared bottoms.",
  },

  {
    id: "prod-47",
    slug: "on-designed-hoodie-architectural",
    name: "O&N Designed Heavyweight Statement Hoodie — Architectural Cut",
    price: 3500,
    category: "hoodies",
    image: "/images/catalog/on-real-47.jpeg",
    gallery: [
      "/images/catalog/on-real-47.jpeg",
      "/images/catalog/on-real-40.jpeg",
    ],
    sizes: APPAREL,
    colors: [camel, charcoal],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Designer statement hoodie in camel beige featuring structured drop shoulder drape and custom tonal crest.",
  },

  {
    id: "prod-48",
    slug: "on-plain-sweatshirt-white-grounds",
    name: "O&N Plain Crewneck Loopback Sweatshirt — Optic White Grounds",
    price: 2500,
    category: "sweatshirts",
    image: "/images/catalog/on-real-48.jpeg",
    gallery: [
      "/images/catalog/on-real-48.jpeg",
      "/images/catalog/on-real-20.jpeg",
      "/images/catalog/on-real-06.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Optic white 420 GSM loopback cotton crewneck sweatshirt with ribbed collar, cuffs, and hem.",
  },

  {
    id: "prod-49",
    slug: "on-signature-ribbed-beanie",
    name: "O&N Signature Ribbed Beanie — Fold-Over Crown",
    price: 600,
    category: "accessories",
    image: "/images/catalog/on-real-15.jpeg",
    gallery: [
      "/images/catalog/on-real-15.jpeg",
      "/images/catalog/on-real-17.jpeg",
      "/images/catalog/on-real-13.jpeg",
    ],
    sizes: ONE_SIZE,
    colors: [black, chocolate],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "100% fine-gauge rib knit fold-over beanie engineered for warmth and a tailored streetwear crown.",
  },

  {
    id: "prod-50",
    slug: "on-basic-tshirt",
    name: "O&N Basic Everyday T-Shirt — Pure Combed Cotton",
    price: 1000,
    category: "t-shirts",
    image: "/images/catalog/on-real-24.jpeg",
    gallery: [
      "/images/catalog/on-real-24.jpeg",
      "/images/catalog/on-real-15.jpeg",
    ],
    sizes: APPAREL,
    colors: [offWhite, black, camel],
    isNew: true,
    featured: false,
    inStock: true,
    description:
      "Clean everyday essential tee in breathable combed cotton jersey with a straight body and structured collar.",
  },
];

/** Backward-compatibility alias map for legacy demo slugs */
export const LEGACY_SLUG_MAP: Record<string, string> = {
  "on-classic-hoodie": "on-plain-hoodie-beige",
  "on-essential-hoodie": "on-designed-hoodie",
  "on-overshirt": "on-plush-overcoat",
  "on-minimal-tee": "on-basic-tshirt",
  "on-signature-cap": "on-signature-ribbed-beanie",
  "on-signature-beanie": "on-signature-ribbed-beanie",
  "on-relaxed-trousers": "on-plain-sweatpants-beige",
  "on-boxy-tee-white": "on-designed-graphic-tshirt",
};

export function getProduct(slug: string): Product | undefined {
  const direct = products.find((p) => p.slug === slug);
  if (direct) return direct;
  const remappedSlug = LEGACY_SLUG_MAP[slug];
  if (remappedSlug) {
    return products.find((p) => p.slug === remappedSlug);
  }
  return undefined;
}

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function getCategoryProducts(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
