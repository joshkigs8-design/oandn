import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Instagram,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GoldFlow } from "@/components/GoldFlow";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Watermark } from "@/components/Logo";
import { Newsletter } from "@/components/Newsletter";
import { EMAIL, PHONE, WHATSAPP_URL } from "@/components/Footer";
import { useProducts } from "@/lib/use-products";
import { useCategories } from "@/lib/use-categories";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "Discover O&N FITS — premium luxury streetwear handcrafted with precision in Nairobi, Kenya. Explore authentic hoodies, sweatpants, co-ord sets, and crop tops.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O&N FITS — Timeless Luxury Streetwear. Made in Kenya." },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "O&N FITS — Timeless Luxury Streetwear. Made in Kenya." },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/images/catalog/on-real-01.jpeg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const HERO_SLIDES = [
  {
    id: 1,
    title: "Plain Heavyweight Hoodie",
    subtitle: "420 GSM Brushed Loopback Fleece in Camel Beige",
    badge: "Official Capsule",
    price: "KES 3,000",
    image: "/images/catalog/on-real-45.jpeg",
    link: "/product/on-plain-hoodie-beige",
    btnText: "Shop Plain Hoodie",
  },
  {
    id: 2,
    title: "Royal Blue Co-ord Drop",
    subtitle: "Heavyweight Matching Hoodie & Sweatpants Set",
    badge: "New Arrival",
    price: "KES 6,000",
    image: "/images/catalog/on-real-11.jpeg",
    link: "/product/on-plain-two-piece-set",
    btnText: "Explore Co-ord Sets",
  },
  {
    id: 3,
    title: "Designed Buttoned Tearaway Pants",
    subtitle: "Functional Snap Button Seams in Golden Yellow",
    badge: "Streetwear Essential",
    price: "KES 3,500",
    image: "/images/catalog/on-real-37.jpeg",
    link: "/product/on-designed-buttoned-pants",
    btnText: "Shop Buttoned Pants",
  },
  {
    id: 4,
    title: "Forest Green Cropped Zip Jacket",
    subtitle: "Tailored High-Collar Zip-Up Fleece with Cinch Waist",
    badge: "Editorial Spotlight",
    price: "KES 3,000",
    image: "/images/catalog/on-real-05.jpeg",
    link: "/product/on-designed-cropped-zip-jacket",
    btnText: "Shop Cropped Jacket",
  },
];

const TRUST_PILLARS = [
  {
    Icon: Truck,
    title: "Nationwide Dispatch",
    copy: "Same-day Eldoret dispatch · Fast courier delivery across all 47 counties.",
  },
  {
    Icon: ShieldCheck,
    title: "420 GSM Heavyweight Cotton",
    copy: "Double-needle stitching and anti-pilling brushed loopback fleece.",
  },
  {
    Icon: Lock,
    title: "Lipa Na M-PESA Till 1673504",
    copy: "Seamless Buy Goods payment or confirm with owner before dispatch.",
  },
  {
    Icon: RotateCcw,
    title: "14-Day Exchanges",
    copy: "Hassle-free size swaps delivered directly to your doorstep.",
  },
];

const TESTIMONIALS = [
  {
    name: "Brian Kiprop",
    location: "Kilimani, Nairobi",
    quote:
      "The 420 GSM weight on the Plain Hoodie is phenomenal. Contends directly with international luxury streetwear brands, and delivery was under 3 hours in Nairobi.",
    rating: 5,
    piece: "O&N Plain Heavyweight Hoodie (Beige)",
  },
  {
    name: "Vanessa Wanjiku",
    location: "Nyali, Mombasa",
    quote:
      "Ordered the Forest Green Zip Jacket and shorts set on Tuesday, received them in Nyali on Wednesday afternoon. The tailored fit and tonal embroidery are pristine.",
    rating: 5,
    piece: "O&N Designed Cropped Zip Sweatshirt",
  },
  {
    name: "Kevin Omondi",
    location: "Milimani, Kisumu",
    quote:
      "M-Pesa STK checkout was seamless and the fabric thickness doesn't lose shape after repeated washing. O&N FITS is setting the standard for Kenyan streetwear.",
    rating: 5,
    piece: "O&N Designed Buttoned Tearaway Pants",
  },
];

const LOOKBOOK_PIECES = [
  {
    tag: "@alex_maina",
    image: "/images/catalog/on-real-22.jpeg",
    caption: "Forest Green wide leg trousers & white crewneck",
    category: "Pants",
  },
  {
    tag: "@samuel.k",
    image: "/images/catalog/on-real-14.jpeg",
    caption: "Wavy two-tone split sweatshirt & lilac pants",
    category: "Sweatshirts",
  },
  {
    tag: "@chloe_n",
    image: "/images/catalog/on-real-33.jpeg",
    caption: "Safety orange cargo utility set in the atrium",
    category: "Sets",
  },
  {
    tag: "@nairobi_street",
    image: "/images/catalog/on-real-13.jpeg",
    caption: "Plush textured overcoat & ribbed fold-over beanie",
    category: "Outerwear",
  },
  {
    tag: "@fashion_ke",
    image: "/images/catalog/on-real-38.jpeg",
    caption: "Handcrafted yellow & black applique tracksuit",
    category: "Sets",
  },
  {
    tag: "@lifestyle_nbo",
    image: "/images/catalog/on-real-48.jpeg",
    caption: "Cropped zip jacket & flared contrast sweatpants",
    category: "Sweatshirts",
  },
];

function Index() {
  const products = useProducts();
  const categories = useCategories();
  const [activeCuratorTab, setActiveCuratorTab] = useState<string>("all");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Hero auto-slider
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const currentSlide = HERO_SLIDES[activeHeroSlide] ?? HERO_SLIDES[0]!;

  const nextHeroSlide = () => {
    setActiveHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevHeroSlide = () => {
    setActiveHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const curatedList = products
    .filter((p) => {
      if (activeCuratorTab === "all") return true;
      return p.category.toLowerCase() === activeCuratorTab.toLowerCase();
    })
    .slice(0, 12);

  return (
    <>
      {/* 1. HERO SECTION WITH 4-SLIDE REAL PHOTOGRAPHY CAROUSEL */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-ivory)]">
        <GoldFlow className="opacity-60" />
        <Watermark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[38vw] text-gold/[0.045] lg:text-[25vw] select-none pointer-events-none" />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-10 lg:pt-20 lg:pb-28">
          <div className="animate-rise max-w-2xl">
            {/* Origin & Atelier Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/80 px-3.5 py-1.5 backdrop-blur-sm shadow-sm">
              <span className="size-2 rounded-full bg-gold animate-pulse" />
              <span className="text-[0.68rem] font-semibold tracking-wider text-foreground uppercase">
                Official Campaign · Nairobi Atelier
              </span>
            </div>

            <h1 className="mt-6 font-serif text-[3.25rem] leading-[0.93] tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem]">
              Style That Speaks
              <br />
              <span className="text-gradient-gold italic">for Itself.</span>
            </h1>

            <span className="mt-7 block h-px w-24 bg-[image:var(--gradient-gold)]" />

            <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground">
              Timeless streetwear crafted with uncompromising quality. Heavyweight silhouettes,
              sculpted proportions, and effortless luxury made for Kenya and beyond.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button variant="gold" size="luxlg" asChild>
                <Link to="/shop">Shop Collection</Link>
              </Button>
              <Button variant="lux" size="luxlg" asChild>
                <Link to="/collections">View Lookbook</Link>
              </Button>
            </div>

            {/* Quick category shortcut pills */}
            <div className="mt-10 pt-6 border-t border-border/60">
              <span className="text-[0.62rem] uppercase tracking-widest text-muted-foreground font-semibold block">
                Explore Categories &amp; Drops
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { name: "Hoodies", slug: "hoodies" },
                  { name: "Pants", slug: "bottoms" },
                  { name: "Co-ord Sets", slug: "sets" },
                  { name: "Sweatshirts", slug: "sweatshirts" },
                  { name: "Crop Tops", slug: "ladies" },
                ].map((item) => (
                  <Link
                    key={item.slug}
                    to="/shop"
                    search={{ category: item.slug }}
                    className="border border-border/80 bg-background/80 px-3 py-1 text-xs text-foreground hover:border-gold hover:text-gold-deep transition-all duration-300 rounded-xs backdrop-blur-sm"
                  >
                    {item.name} &rarr;
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Hero Carousel with Real Photos */}
          <div
            className="animate-rise relative [animation-delay:180ms] group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative overflow-hidden rounded-xs border border-border/70 bg-card shadow-2xl">
              {/* Active Image with smooth cross-fade */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
                {HERO_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                      idx === activeHeroSlide
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0 pointer-events-none",
                    )}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      fetchPriority={idx === 0 ? "high" : "low"}
                      className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                  </div>
                ))}

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-gold backdrop-blur-md border border-gold/30">
                    <Sparkles className="size-3" /> {currentSlide.badge}
                  </span>
                </div>

                {/* Left / Right Carousel Arrow Buttons */}
                <div className="absolute inset-y-0 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={prevHeroSlide}
                    aria-label="Previous slide"
                    className="grid size-9 place-items-center rounded-full bg-card/85 text-foreground backdrop-blur-sm shadow-md transition-transform hover:scale-110 pointer-events-auto cursor-pointer opacity-80 group-hover:opacity-100 hover:text-gold-deep border border-border"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextHeroSlide}
                    aria-label="Next slide"
                    className="grid size-9 place-items-center rounded-full bg-card/85 text-foreground backdrop-blur-sm shadow-md transition-transform hover:scale-110 pointer-events-auto cursor-pointer opacity-80 group-hover:opacity-100 hover:text-gold-deep border border-border"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                {/* Bottom Floating Piece Card */}
                <div className="absolute bottom-4 left-4 right-4 z-20 rounded-xs border border-border/80 bg-card/95 p-4 backdrop-blur-md shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground font-serif">
                        {currentSlide.title}
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground truncate">
                        {currentSlide.subtitle}
                      </p>
                      <p className="mt-1 text-xs font-bold text-gold-deep">{currentSlide.price}</p>
                    </div>

                    <Link
                      to={currentSlide.link}
                      className="rounded-xs bg-gold px-3.5 py-2 text-[0.65rem] font-bold text-primary-foreground uppercase tracking-wider hover:bg-gold-deep transition-colors whitespace-nowrap shadow-sm shrink-0"
                    >
                      {currentSlide.btnText} &rarr;
                    </Link>
                  </div>

                  {/* Carousel Progress Indicators */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-border/60 pt-2.5">
                    {HERO_SLIDES.map((slide, i) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveHeroSlide(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                          i === activeHeroSlide ? "w-6 bg-gold" : "w-2 bg-muted hover:bg-gold/50",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / LOGISTICS STRIP */}
      <section className="border-y border-border/70 bg-card py-10 shadow-xs">
        <ul className="mx-auto grid max-w-[1400px] gap-6 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {TRUST_PILLARS.map(({ Icon, title, copy }, i) => (
            <Reveal as="li" key={title} delay={i * 60} className="flex items-start gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xs bg-gold/15 text-gold-deep border border-gold/30">
                <Icon className="size-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <h3 className="font-sans text-[0.72rem] tracking-[0.2em] text-foreground uppercase font-semibold">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 3. CATEGORIES VISUAL SHOWCASE */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Curated Collections" title="Shop by Category" />
          </Reveal>

          <ul className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat, i) => (
              <Reveal as="li" key={cat.slug} delay={i * 50}>
                <Link
                  to="/shop"
                  search={{ category: cat.slug }}
                  className="group block overflow-hidden rounded-xs border border-border/60 bg-card transition-all duration-500 hover:border-gold hover:shadow-[var(--shadow-lift)]"
                >
                  <div className="overflow-hidden bg-secondary">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      width={800}
                      height={1000}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-105"
                    />
                  </div>
                  <div className="px-3 py-4 text-center">
                    <h3 className="font-sans text-xs tracking-[0.14em] text-foreground uppercase font-medium">
                      {cat.name}
                    </h3>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[0.62rem] tracking-[0.18em] text-gold-deep uppercase font-semibold">
                      Explore Pieces
                      <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. DUAL VISUAL BANNERS: SIGNATURE STREETWEAR CAPSULES */}
      <section className="bg-[image:var(--gradient-ivory)] py-16 border-t border-border/70">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Visual Card 1: Sets & Hoodies */}
            <Reveal className="group relative overflow-hidden rounded-xs border border-border bg-card shadow-lg min-h-[440px] flex flex-col justify-end">
              <img
                src="/images/catalog/on-real-11.jpeg"
                alt="Co-ord sets and hoodies featuring royal blue heavy fleece uniform"
                loading="lazy"
                width={1200}
                height={1500}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
              <div className="relative z-10 p-8 sm:p-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-gold border border-gold/40 backdrop-blur-md">
                  Signature Capsule
                </span>
                <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-white font-normal">
                  Co-ord Sets &amp; Hoodies
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-200">
                  Heavyweight Hoodies &bull; Relaxed Pants &bull; Graphic Sweatshirts &bull; Matching Sets
                </p>
                <div className="mt-6">
                  <Button variant="gold" size="lux" asChild>
                    <Link to="/shop" search={{ category: "sets" }}>
                      Shop Sets &amp; Hoodies &rarr;
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            {/* Visual Card 2: Crop Tops & Contoured Fits */}
            <Reveal delay={100} className="group relative overflow-hidden rounded-xs border border-border bg-card shadow-lg min-h-[440px] flex flex-col justify-end">
              <img
                src="/images/catalog/on-real-24.jpeg"
                alt="Contoured fits featuring ribbed knit crop tops and tailored flared sweatpants"
                loading="lazy"
                width={1200}
                height={1500}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />
              <div className="relative z-10 p-8 sm:p-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-gold border border-gold/40 backdrop-blur-md">
                  Contoured Fits
                </span>
                <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-white font-normal">
                  Crop Tops &amp; Contoured Fits
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-200">
                  Ribbed Crop Tops &bull; Flared Sweatpants &bull; Cropped Zip Jackets &bull; Knit Vests
                </p>
                <div className="mt-6">
                  <Button variant="gold" size="lux" asChild>
                    <Link to="/shop" search={{ category: "ladies" }}>
                      Shop Crop Tops &rarr;
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. CURATOR'S INTERACTIVE LOOKBOOK / TABBED CATALOG */}
      <section className="bg-background py-20 lg:py-28 border-t border-border/70">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">The Wardrobe Foundation</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-5xl">Curated Essentials</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 border-b border-border/60 pb-2">
              {[
                { label: "All Pieces", id: "all" },
                { label: "Hoodies", id: "hoodies" },
                { label: "Pants", id: "bottoms" },
                { label: "Sweatshirts", id: "sweatshirts" },
                { label: "Co-ord Sets", id: "sets" },
                { label: "Crop Tops", id: "ladies" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCuratorTab(tab.id)}
                  className={cn(
                    "px-4 py-2 text-xs uppercase tracking-wider transition-all rounded-xs font-medium cursor-pointer whitespace-nowrap",
                    activeCuratorTab === tab.id
                      ? "bg-gold text-primary-foreground font-semibold shadow-xs"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {curatedList.map((p, i) => (
              <Reveal key={p.id} delay={(i % 6) * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Button variant="gold" size="luxlg" asChild>
              <Link to="/shop">View Full Collection ({products.length} Pieces) &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL SPLIT SHOWCASE WITH REAL PHOTOGRAPHY */}
      <section className="bg-background border-y border-border/70">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[700px] group">
            <img
              src="/images/catalog/on-real-01.jpeg"
              alt="O&N FITS editorial models on terrace wearing signature collection pieces"
              loading="lazy"
              width={1200}
              height={1504}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/15" />
          </div>

          <Reveal className="relative flex items-center overflow-hidden bg-[image:var(--gradient-ivory)] px-6 py-16 lg:px-20 lg:py-24">
            <GoldFlow className="opacity-50" />
            <div className="relative max-w-lg">
              <div className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold uppercase tracking-widest">
                <Sparkles className="size-3.5" /> Craftsmanship Spotlight
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight lg:text-5xl text-foreground">
                Tailored for the modern Kenyan lifestyle.
              </h2>
              <span className="mt-6 block h-px w-20 bg-gold" />
              <p className="mt-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
                Considered drop-shoulder proportions, pre-shrunk heavyweight fabrics and an authentic
                earth-toned palette. Each O&amp;N FITS piece is engineered to endure frequent rotation
                and feel softer with every wash.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 border-y border-border/70 py-6">
                <div>
                  <p className="font-serif text-2xl font-semibold text-gold-deep">420 GSM</p>
                  <p className="text-xs text-muted-foreground">Dense Combed Fleece</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-gold-deep">Nairobi</p>
                  <p className="text-xs text-muted-foreground">Designed &amp; Hand-Finished</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="gold" size="luxlg" asChild>
                  <Link to="/shop">Shop Signature Styles</Link>
                </Button>
                <Button variant="lux" size="luxlg" asChild>
                  <Link to="/about">Our Atelier Story</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. VERIFIED CLIENT TESTIMONIALS */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Community Voice" title="What Our Patrons Say" />
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={idx} delay={idx * 80}>
                <div className="flex h-full flex-col justify-between border border-border/70 bg-card p-8 rounded-xs shadow-xs hover:border-gold/60 transition-colors">
                  <div>
                    {/* 5 Stars */}
                    <div className="flex gap-1 text-gold">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="size-4 fill-gold" />
                      ))}
                    </div>
                    <blockquote className="mt-4 text-sm leading-relaxed text-foreground italic">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </div>

                  <div className="mt-8 border-t border-border/60 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.name}</p>
                        <p className="text-[0.68rem] text-muted-foreground">{t.location}</p>
                      </div>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-semibold text-emerald-700 dark:text-emerald-400">
                        Verified Buyer
                      </span>
                    </div>
                    <p className="mt-2 text-[0.65rem] text-gold-deep font-medium">{t.piece}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PROMOTIONAL VOUCHER BANNER WITH REAL PHOTO BACKGROUND */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[460px]">
          <img
            src="/images/catalog/on-real-07.jpeg"
            alt="O&N FITS outdoor photoshoot collection showcase"
            loading="lazy"
            width={1600}
            height={912}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/50 backdrop-blur-[2px]" />

          <Reveal className="relative mx-auto flex min-h-[460px] max-w-[1400px] items-center px-5 py-16 lg:px-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded bg-gold/20 px-3 py-1 text-xs font-semibold text-gold-deep">
                <Tag className="size-3.5" /> VIP Welcome Offer
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl text-foreground">
                Enjoy 10% Off Your First Order
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Use code <strong className="font-mono text-gold-deep font-bold">ONFITS10</strong> at
                checkout to unlock your exclusive introductory reduction on all items.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="gold" size="luxlg" asChild>
                  <Link to="/shop">Claim Discount &amp; Shop</Link>
                </Button>
                <Button variant="lux" size="luxlg" asChild>
                  <Link to="/collections">Browse Looks</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9. COMMUNITY LOOKBOOK / REAL PHOTOSHOOT GRID */}
      <section className="bg-background py-20 lg:py-24 border-t border-border/70">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Community &amp; Culture</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-5xl">Styled by You</h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold-deep hover:underline font-semibold"
            >
              <Instagram className="size-4" /> Follow @ONFITS
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {LOOKBOOK_PIECES.map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xs border border-border bg-card"
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-gold">
                    {item.tag}
                  </span>
                  <p className="text-[0.68rem] text-ivory font-medium mt-1 line-clamp-2">{item.caption}</p>
                  <Link
                    to="/shop"
                    className="mt-2 inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-wider text-gold hover:text-ivory transition-colors"
                  >
                    Shop Look &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION WITH REAL PHOTO BACKGROUND */}
      <section className="relative overflow-hidden border-t border-border/70">
        <div className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
          <img
            src="/images/catalog/on-real-31.jpeg"
            alt="O&N FITS models smiling in the mall campaign"
            loading="lazy"
            width={1600}
            height={900}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-ink/75 backdrop-blur-[2px]" />

          <Reveal className="relative z-10 mx-auto max-w-2xl px-5 py-16 text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/80 px-4 py-1.5 text-xs text-gold uppercase tracking-widest font-semibold backdrop-blur-md">
              Define Your Style
            </span>
            <h2 className="mt-4 font-serif text-4xl sm:text-6xl text-white font-normal">
              Find Your Next Look.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm sm:text-base text-gray-200">
              Explore our complete catalogue of handcrafted hoodies, custom pants, and luxury streetwear essentials.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button variant="gold" size="luxlg" asChild>
                <Link to="/shop">Shop O &amp; N FITS</Link>
              </Button>
              <Button variant="lux" size="luxlg" className="border-white/40 text-white hover:bg-white/10" asChild>
                <Link to="/collections">View Collections</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11. VIP CONCIERGE & CONTACT STRIP */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10">
        <Reveal className="border border-border/70 bg-card p-8 text-center sm:p-12 shadow-sm rounded-xs">
          <p className="eyebrow">Personal Assistance</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Questions on Sizing or Delivery?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Our Nairobi concierge team is on standby 7 days a week for instant assistance via
            WhatsApp, phone, or email.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-emerald-700 dark:text-emerald-400 font-semibold rounded-xs hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="size-4 text-emerald-600" /> Chat on WhatsApp
            </a>
            <a
              href={`tel:+254${PHONE.slice(1)}`}
              className="flex items-center gap-2 border border-border bg-background px-5 py-3 text-foreground font-semibold rounded-xs hover:border-gold transition-colors"
            >
              <Phone className="size-4 text-gold" /> {PHONE}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 border border-border bg-background px-5 py-3 text-foreground font-semibold rounded-xs hover:border-gold transition-colors"
            >
              <Mail className="size-4 text-gold" /> {EMAIL}
            </a>
          </div>
        </Reveal>
      </section>

      {/* 12. NEWSLETTER */}
      <Newsletter />
    </>
  );
}
