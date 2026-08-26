export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  image: string;
  gallery: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  isNew?: boolean;
  featured?: boolean;
  inStock: boolean;
  description: string;
};

export type Category = { id?: string; slug: string; name: string; image: string };

export const categories: Category[] = [
  { slug: "hoodies", name: "Hoodies", image: "/assets/cat-hoodies.jpg" },
  { slug: "t-shirts", name: "T-Shirts", image: "/assets/cat-tshirts.jpg" },
  { slug: "accessories", name: "Accessories", image: "/assets/cat-accessories.jpg" },
  { slug: "bottoms", name: "Bottoms", image: "/assets/cat-bottoms.jpg" },
  { slug: "outerwear", name: "Outerwear", image: "/assets/cat-outerwear.jpg" },
];

const APPAREL = ["S", "M", "L", "XL", "XXL"];
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
  { name: "Light Blue", hex: "#A8CCE4" },
  { name: "Sky Blue", hex: "#7FB6DE" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Teal", hex: "#2E7D7B" },
  { name: "Sage", hex: "#A9BBA0" },
  { name: "Olive", hex: "#6B7248" },
  { name: "Forest", hex: "#2F4A38" },
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
const black = swatch("Black");
const camel = swatch("Camel");
const white = swatch("Off White");
const lightBlue = swatch("Light Blue");
const sage = swatch("Sage");
const blush = swatch("Blush Pink");
const navy = swatch("Navy");
const rust = swatch("Rust");
const lilac = swatch("Lilac");
const charcoal = swatch("Charcoal");
const olive = swatch("Olive");
const mustard = swatch("Mustard");
const burgundy = swatch("Burgundy");
const sand = swatch("Sand");
const mocha = swatch("Mocha");

/** Fallback catalog used for SSR / before the database responds. */
export const products: Product[] = [
  {
    id: "1",
    slug: "on-classic-hoodie",
    name: "O&N Classic Hoodie",
    price: 3000,
    category: "hoodies",
    image: "/assets/cat-hoodies.jpg",
    gallery: ["/assets/cat-hoodies.jpg", "/assets/prod-black-hoodie.jpg"],
    sizes: APPAREL,
    colors: [cream, black, lightBlue, sage, burgundy],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "Heavyweight brushed cotton fleece with a relaxed drop shoulder and tonal O&N embroidery. Built to soften with every wear.",
  },
  {
    id: "2",
    slug: "on-overshirt",
    name: "O&N Overshirt",
    price: 4000,
    category: "outerwear",
    image: "/assets/cat-outerwear.jpg",
    gallery: ["/assets/cat-outerwear.jpg"],
    sizes: APPAREL,
    colors: [camel, olive, charcoal, navy],
    isNew: true,
    inStock: true,
    description:
      "A transitional layer in washed cotton twill with utility pockets and a soft collar. Wear it open, wear it buttoned.",
  },
  {
    id: "3",
    slug: "on-minimal-tee",
    name: "O&N T-Shirt",
    price: 1000,
    category: "t-shirts",
    image: "/assets/cat-tshirts.jpg",
    gallery: ["/assets/cat-tshirts.jpg", "/assets/prod-white-tee.jpg"],
    sizes: APPAREL,
    colors: [cream, white, lightBlue, blush, sage, black],
    isNew: true,
    inStock: true,
    description:
      "A considered everyday tee in dense combed cotton, cut with a clean straight body and a structured collar that holds its shape.",
  },
  {
    id: "4",
    slug: "on-signature-cap",
    name: "O&N Cap",
    price: 500,
    category: "accessories",
    image: "/assets/cat-accessories.jpg",
    gallery: ["/assets/cat-accessories.jpg"],
    sizes: ONE_SIZE,
    colors: [black, camel, navy, rust],
    isNew: true,
    inStock: true,
    description:
      "Six-panel twill cap with a curved brim and fine gold monogram stitch. Adjustable strap for a precise fit.",
  },
  {
    id: "5",
    slug: "on-signature-beanie",
    name: "O&N Beanie",
    price: 500,
    category: "accessories",
    image: "/assets/prod-beanie.jpg",
    gallery: ["/assets/prod-beanie.jpg"],
    sizes: ONE_SIZE,
    colors: [black, charcoal, lilac, mustard],
    isNew: true,
    inStock: true,
    description: "Fine-gauge ribbed knit beanie with a folded cuff and discreet gold monogram.",
  },
  {
    id: "6",
    slug: "on-essential-hoodie",
    name: "O&N Essential Hoodie",
    price: 3500,
    category: "hoodies",
    image: "/assets/prod-black-hoodie.jpg",
    gallery: ["/assets/prod-black-hoodie.jpg", "/assets/cat-hoodies.jpg"],
    sizes: APPAREL,
    colors: [black, cream, navy, mocha, lightBlue],
    isNew: true,
    featured: true,
    inStock: true,
    description:
      "The essential in near-black. Oversized silhouette, double-lined hood and a weighty hand feel that drapes beautifully.",
  },
  {
    id: "7",
    slug: "on-relaxed-trousers",
    name: "O&N Relaxed Trousers",
    price: 2900,
    category: "bottoms",
    image: "/assets/cat-bottoms.jpg",
    gallery: ["/assets/cat-bottoms.jpg"],
    sizes: APPAREL,
    colors: [black, cream, camel, sand, olive],
    inStock: true,
    description:
      "Relaxed tapered trousers in a mid-weight loopback, finished with a covered elastic waist and clean side seams.",
  },
  {
    id: "8",
    slug: "on-boxy-tee-white",
    name: "O&N Boxy Tee",
    price: 2400,
    category: "t-shirts",
    image: "/assets/prod-white-tee.jpg",
    gallery: ["/assets/prod-white-tee.jpg"],
    sizes: APPAREL,
    colors: [white, cream, blush, lightBlue],
    inStock: false,
    description:
      "A boxy, slightly cropped cut in off-white. Heavier than it looks, softer than expected.",
  },
];

export const formatKES = (value: number) =>
  `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;

export const getProduct = (slug: string, list: Product[] = products) =>
  list.find((p) => p.slug === slug);
