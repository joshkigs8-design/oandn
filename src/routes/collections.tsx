import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { GoldFlow } from "@/components/GoldFlow";
import { Reveal } from "@/components/Reveal";
import { useCategories } from "@/lib/use-categories";

const DESCRIPTION = "Explore O&N collections — essentials, layers and accessories.";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — O&N" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Collections — O&N" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/collections" },
    ],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: Collections,
});

function Collections() {
  const categories = useCategories();
  return (
    <>
      <header className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-16 lg:py-24">
        <GoldFlow className="opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
          <p className="eyebrow">Curated by O&amp;N</p>
          <h1 className="mt-4 font-serif text-5xl lg:text-7xl">Collections</h1>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:px-10">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 70}>
            <Link
              to="/shop"
              search={{ category: c.slug }}
              className="group relative block overflow-hidden"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={800}
                height={1000}
                className="aspect-[3/4] w-full object-cover transition-transform duration-[900ms] [transition-timing-function:var(--ease-lux)] group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,oklch(0.97_0.015_85/0.94),transparent)] p-6">
                <h2 className="font-serif text-3xl text-foreground">{c.name}</h2>
                <span className="mt-2 inline-flex items-center gap-2 text-[0.62rem] tracking-[0.2em] text-gold-deep uppercase">
                  Explore
                  <ArrowRight
                    className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
