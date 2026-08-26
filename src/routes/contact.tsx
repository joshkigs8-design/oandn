import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { GoldFlow } from "@/components/GoldFlow";
import { EMAIL, PHONE, WHATSAPP_URL } from "@/components/Footer";

const DESCRIPTION = "Get in touch with the O&N team about orders, sizing, returns or stockists.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — O&N" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Contact — O&N" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget).entries()));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    toast.error("Messaging is not connected yet", {
      description: `Email ${EMAIL} in the meantime.`,
    });
  };

  return (
    <>
      <header className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-16 lg:py-24">
        <GoldFlow className="opacity-50" />
        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
          <p className="eyebrow">We'd love to hear from you</p>
          <h1 className="mt-4 font-serif text-5xl lg:text-7xl">Contact</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 lg:grid-cols-[1fr_320px] lg:px-10 lg:py-20">
        <form onSubmit={onSubmit} noValidate className="space-y-6">
          {[
            { name: "name", label: "Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
          ].map((f) => (
            <div key={f.name}>
              <label
                htmlFor={f.name}
                className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
              >
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type}
                aria-invalid={!!errors[f.name]}
                className="mt-2 h-12 w-full border border-border bg-card px-4 text-sm outline-none focus:border-gold aria-[invalid=true]:border-destructive"
              />
              {errors[f.name] ? (
                <p className="mt-1.5 text-xs text-destructive">{errors[f.name]}</p>
              ) : null}
            </div>
          ))}
          <div>
            <label
              htmlFor="message"
              className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              maxLength={1000}
              aria-invalid={!!errors["message"]}
              className="mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold aria-[invalid=true]:border-destructive"
            />
            {errors["message"] ? (
              <p className="mt-1.5 text-xs text-destructive">{errors["message"]}</p>
            ) : null}
          </div>
          <Button type="submit" variant="gold" size="lux">
            Send Message
          </Button>
        </form>

        <aside className="space-y-5 border-t border-border/70 pt-8 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
          <p className="flex items-start gap-3 text-muted-foreground">
            <Mail className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
            <a href={`mailto:${EMAIL}`} className="hover:text-gold-deep">
              {EMAIL}
            </a>
          </p>
          <p className="flex items-start gap-3 text-muted-foreground">
            <Phone className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
            <a href={`tel:+254${PHONE.slice(1)}`} className="hover:text-gold-deep">
              {PHONE}
            </a>
          </p>
          <p className="flex items-start gap-3 text-muted-foreground">
            <Mail className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-deep"
            >
              Chat on WhatsApp
            </a>
          </p>
          <p className="flex items-start gap-3 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
            Nairobi, Kenya
          </p>
        </aside>
      </div>
    </>
  );
}
