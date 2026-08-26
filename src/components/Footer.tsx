import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { Logo, Watermark } from "./Logo";

export const PHONE = "0112854091";
export const EMAIL = "oandnfits23@gmail.com";
export const WHATSAPP_URL = "https://wa.me/254112854091";

const socials = [
  { Icon: Instagram, label: "Instagram", href: "https://instagram.com/brand_oandfits" },
  { Icon: Music2, label: "TikTok", href: "https://www.tiktok.com/@oandfits" },
  { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/moryn.nyaga" },
  { Icon: MessageCircle, label: "WhatsApp", href: WHATSAPP_URL },
];

const shopLinks = [
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Collections", to: "/collections" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

const careLinks = ["Shipping", "Returns", "Size Guide", "FAQs"];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-[image:var(--gradient-ivory)]">
      <Watermark className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-[26vw] text-gold/[0.05]" />
      <div className="relative mx-auto max-w-[1400px] px-5 pt-16 pb-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="lg" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              O&amp;N FITS is a premium modern clothing label built around timeless design,
              confidence and effortless everyday style.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid size-10 place-items-center border border-border text-muted-foreground transition-all duration-500 hover:border-gold hover:text-gold-deep"
                >
                  <Icon className="size-4" strokeWidth={1.4} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Shop">
            <h3 className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase">Navigate</h3>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold-deep"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase">
              Customer Care
            </h3>
            <ul className="mt-5 space-y-3">
              {careLinks.map((l) => (
                <li key={l}>
                  <Link
                    to="/contact"
                    className="text-sm text-muted-foreground transition-colors hover:text-gold-deep"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[0.68rem] tracking-[0.24em] text-foreground uppercase">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
                <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-gold-deep">
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
                <a href="tel:+254112854091" className="transition-colors hover:text-gold-deep">
                  0112 854 091
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold-deep"
                >
                  Chat on WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.4} />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 sm:flex-row">
          <p className="text-xs tracking-wide text-muted-foreground">
            © 2026 O&amp;N FITS. All rights reserved.
          </p>
          <a
            href="https://codevanta.online"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-gold-deep"
          >
            Designed by Codevanta Ventures
          </a>
          <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
            Timeless Style. Made for You.
          </p>
        </div>
      </div>
    </footer>
  );
}
