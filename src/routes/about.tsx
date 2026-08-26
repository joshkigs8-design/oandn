import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { GoldFlow } from "@/components/GoldFlow";
import { Reveal } from "@/components/Reveal";
import { Watermark } from "@/components/Logo";
import editorialModel from "@/assets/editorial-model.jpg";

const DESCRIPTION =
  "O&N is built around timeless design, confidence and effortless style — premium modern clothing made in and for Kenya.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About O&N — More Than Clothing" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "About O&N — More Than Clothing" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <header className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-20 lg:py-28">
        <GoldFlow className="opacity-50" />
        <Watermark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[32vw] text-gold/[0.05]" />
        <div className="relative mx-auto max-w-2xl px-5 text-center">
          <p className="eyebrow">About O&amp;N</p>
          <h1 className="mt-5 font-serif text-5xl lg:text-7xl">More Than Clothing.</h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            O&amp;N is built around timeless design, confidence and effortless style. Every piece is
            created to become part of your everyday identity.
          </p>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        <Reveal>
          <img
            src={editorialModel}
            alt="An O&N piece worn in natural light"
            loading="lazy"
            width={1200}
            height={1504}
            className="w-full object-cover"
          />
        </Reveal>
        <Reveal delay={120} className="max-w-md">
          <h2 className="text-3xl lg:text-5xl">Made to be worn often.</h2>
          <span className="mt-6 block h-px w-16 bg-gold" />
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              We started O&amp;N with a simple frustration: everyday clothing rarely feels
              considered. So we build fewer pieces, in better fabrics, with proportions that hold
              their shape.
            </p>
            <p>
              Each drop is designed in Nairobi and made in small runs — cream, camel and near-black,
              finished with a discreet gold monogram. Nothing loud, nothing disposable.
            </p>
          </div>
          <Button variant="gold" size="lux" className="mt-8" asChild>
            <Link to="/shop">Shop the Collection</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
