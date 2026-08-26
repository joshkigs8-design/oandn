import { createFileRoute } from "@tanstack/react-router";
import { GoldFlow } from "@/components/GoldFlow";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useProducts } from "@/lib/use-products";

const DESCRIPTION = "The newest O&N pieces — fresh drops in cream, camel and near-black.";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — O&N" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "New Arrivals — O&N" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/new-arrivals" },
    ],
    links: [{ rel: "canonical", href: "/new-arrivals" }],
  }),
  component: NewArrivals,
});

function NewArrivals() {
  const products = useProducts();
  const list = products.filter((p) => p.isNew);
  return (
    <>
      <header className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-16 lg:py-24">
        <GoldFlow className="opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
          <p className="eyebrow">Just landed</p>
          <h1 className="mt-4 font-serif text-5xl lg:text-7xl">New Arrivals</h1>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-5 gap-y-10 px-5 py-14 md:grid-cols-3 lg:px-10 xl:grid-cols-4">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 60}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
