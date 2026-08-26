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
import editorialModel from "@/assets/editorial-model.jpg";
import promoBanner from "@/assets/promo-banner.jpg";

const DESCRIPTION =
  "Discover O&N — premium luxury modern clothing handcrafted for timeless style and everyday confidence in Nairobi, Kenya.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O&N — Timeless Luxury Streetwear. Made in Kenya." },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "O&N — Timeless Luxury Streetwear. Made in Kenya." },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
      { property: "og:image", content: "/assets/editorial-model.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const HERO_SLIDES = [
  {
    id: 1,
    title: "Signature Cream Hoodie",
    subtitle: "420 GSM Brushed Loopback Fleece",
    badge: "Editorial Capsule",
    price: "KES 3,000",
    image: editorialModel,
    link: "/product/on-classic-hoodie",
    btnText: "Shop Signature Piece",
  },
  {
    id: 2,
    title: "Heavyweight Fleece Drops",
    subtitle: "Pre-shrunk Double Stitch Tailoring",
    badge: "New Arrival",
    price: "KES 3,000",
    image: "/assets/cat-hoodies.jpg",
    link: "/shop?category=hoodies",
    btnText: "Explore Hoodies",
  },
  {
    id: 3,
    title: "Structured Utility Overshirt",
    subtitle: "Washed Cotton Twill Layer in Camel",
    badge: "Outerwear Essential",
    price: "KES 4,000",
    image: "/assets/cat-outerwear.jpg",
    link: "/product/on-overshirt",
    btnText: "Shop Overshirt",
  },
];

const TRUST_PILLARS = [
  {
    Icon: Truck,
    title: "Nationwide Dispatch",
    copy: "Same-day Nairobi delivery · 1–2 days across all 47 counties.",
  },
  {
    Icon: ShieldCheck,
    title: "420 GSM Heavyweight Cotton",
    copy: "Double-needle stitching and anti-pilling brushed loopback fleece.",
  },
  {
    Icon: Lock,
    title: "Daraja M-Pesa & COD",
    copy: "Instant STK push or pay rider upon physical delivery.",
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
      "The 420 GSM weight on the Classic Hoodie is phenomenal. Easily contends with international luxury streetwear brands, and delivery was under 3 hours in Nairobi.",
    rating: 5,
    piece: "O&N Classic Hoodie (Cream)",
  },
  {
    name: "Vanessa Wanjiku",
    location: "Nyali, Mombasa",
    quote:
      "Ordered the Overshirt and Minimal Tee on Tuesday, received them in Nyali on Wednesday afternoon. The tailored fit and tonal gold embroidery are pristine.",
    rating: 5,
    piece: "O&N Overshirt (Camel)",
  },
  {
    name: "Kevin Omondi",
    location: "Milimani, Kisumu",
    quote:
      "M-Pesa STK checkout was seamless and the fabric thickness doesn’t lose shape after repeated washing. O&N is setting the standard for Kenyan apparel.",
    rating: 5,
    piece: "O&N Minimal Tee (Charcoal)",
  },
];

const LOOKBOOK_PIECES = [
  {
    tag: "@alex_maina",
    image: "/assets/cat-hoodies.jpg",
    caption: "Layered Cream Hoodie with utility cargo",
    category: "Hoodies",
  },
  {
    tag: "@samuel.k",
    image: "/assets/cat-outerwear.jpg",
    caption: "Structured Camel Overshirt in Westlands",
    category: "Outerwear",
  },
  {
    tag: "@chloe_n",
    image: "/assets/cat-tshirts.jpg",
    caption: "Oversized Minimal Tee styled relaxed",
    category: "T-Shirts",
  },
  {
    tag: "/assets/cat-accessories.jpg",
    image: "/assets/cat-accessories.jpg",
    caption: "Embroidered Gold Emblem Cap",
    category: "Caps",
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
    .slice(0, 6);

  return (
    <>
      {/* 1. HERO SECTION WITH 3-SLIDE CAROUSEL */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-ivory)]">
        <GoldFlow className="opacity-60" />
        <Watermark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[38vw] text-gold/[0.045] lg:text-[25vw] select-none pointer-events-none" />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-10 lg:pt-20 lg:pb-28">
          <div className="animate-rise max-w-2xl">
            {/* Origin & Atelier Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/80 px-3.5 py-1.5 backdrop-blur-sm shadow-sm">
              <span className="size-2 rounded-full bg-gold animate-pulse" />
              <span className="text-[0.68rem] font-semibold tracking-wider text-foreground uppercase">
                New Season Release · Nairobi Atelier
              </span>
            </div>

            <h1 className="mt-6 font-serif text-[3.25rem] leading-[0.93] tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem]">
              Timeless Style.
              <br />
              Made for <span className="text-gradient-gold italic">You.</span>
            </h1>

            <span className="mt-7 block h-px w-24 bg-[image:var(--gradient-gold)]" />

            <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground">
              Heavyweight essentials engineered from 420 GSM combed loopback fleece, tailored
              proportions, and refined tonal gold detailing.
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
                  { name: "T-Shirts", slug: "t-shirts" },
                  { name: "Outerwear", slug: "outerwear" },
                  { name: "Caps & Beanies", slug: "accessories" },
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

          {/* Right Column: Interactive 3-Slide Hero Carousel */}
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
                      <p className="text-[0.68rem] text-muted-foreground">
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

          <ul className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat, i) => (
              <Reveal as="li" key={cat.slug} delay={i * 70}>
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

      {/* 4. CURATOR'S INTERACTIVE LOOKBOOK / TABBED CATALOG */}
      <section className="bg-[image:var(--gradient-ivory)] py-20 lg:py-28 border-t border-border/70">
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
                { label: "T-Shirts", id: "t-shirts" },
                { label: "Outerwear", id: "outerwear" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCuratorTab(tab.id)}
                  className={cn(
                    "px-4 py-2 text-xs uppercase tracking-wider transition-all rounded-xs font-medium cursor-pointer",
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
              <Link to="/shop">View Full Catalog &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL SPLIT SHOWCASE */}
      <section className="bg-background border-y border-border/70">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[700px] group">
            <img
              src={editorialModel}
              alt="Model wearing the O&N cream hoodie and cap"
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
                Considered drop-shoulder proportions, pre-shrunk heavyweight fabrics and a versatile
                earth-toned palette. Each O&amp;N piece is engineered to endure frequent rotation
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

      {/* 6. VERIFIED CLIENT TESTIMONIALS */}
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

      {/* 7. PROMOTIONAL VOUCHER BANNER */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[440px]">
          <img
            src={promoBanner}
            alt="Folded O&N essentials in cream and beige"
            loading="lazy"
            width={1600}
            height={912}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />

          <Reveal className="relative mx-auto flex min-h-[440px] max-w-[1400px] items-center px-5 py-16 lg:px-10">
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

      {/* 8. COMMUNITY LOOKBOOK / INSTAGRAM GRID */}
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

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
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
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gold">
                    {item.tag}
                  </span>
                  <p className="text-xs text-ivory font-medium mt-1">{item.caption}</p>
                  <Link
                    to="/shop"
                    className="mt-3 inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-gold hover:text-ivory transition-colors"
                  >
                    Shop This Style &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. VIP CONCIERGE & CONTACT STRIP */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10">
        <Reveal className="border border-border/70 bg-card p-8 text-center sm:p-12 shadow-sm rounded-xs">
          <p className="eyebrow">Personal Assistance</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Questions on Sizing or Delivery?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Our Nairobi concierge team is on standby 7 days a week for instant assistance via
            WhatsApp, phone, or email.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
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

      {/* 10. NEWSLETTER */}
      <Newsletter />
    </>
  );
}
