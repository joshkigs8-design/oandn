import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchDialog } from "./SearchDialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Collections", to: "/collections" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { count, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-border/70 bg-ivory/85 backdrop-blur-md shadow-[var(--shadow-soft)]"
            : "border-b border-transparent bg-ivory/40 backdrop-blur-sm",
        )}
      >
        <nav
          aria-label="Main"
          className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_1fr] lg:px-10"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
          </div>

          <ul className="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  activeProps={{ "data-active": "true" }}
                  className="group relative text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase transition-colors duration-300 hover:text-foreground data-[active=true]:text-foreground"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full group-data-[active=true]:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2 lg:gap-3">
            {/* Quick Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search catalogue (Ctrl+K)"
              title="Search catalogue (Ctrl+K)"
              className="group flex size-10 cursor-pointer items-center justify-center text-foreground transition-colors hover:text-gold-deep"
            >
              <Search className="size-[18px]" strokeWidth={1.4} />
            </button>

            {/* Wishlist Link with Badge */}
            <Link
              to="/account"
              search={{ tab: "wishlist" }}
              aria-label={`Wishlist, ${wishlistCount} items`}
              title="Saved Wishlist"
              className="relative hidden size-10 place-items-center text-foreground transition-colors hover:text-gold-deep sm:grid"
            >
              <Heart className="size-[18px]" strokeWidth={1.4} />
              {wishlistCount > 0 ? (
                <span className="absolute top-1 right-0.5 grid size-[17px] place-items-center rounded-full bg-gold/90 text-[0.55rem] font-semibold text-primary-foreground">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            {/* Account Link */}
            <Link
              to="/account"
              aria-label="Account"
              title={userEmail ? `Signed in as ${userEmail}` : "Account"}
              className="relative hidden size-10 place-items-center text-foreground transition-colors hover:text-gold-deep sm:grid"
            >
              <User className="size-[18px]" strokeWidth={1.4} />
              {userEmail ? (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-gold ring-2 ring-background" />
              ) : null}
            </Link>

            {/* Shopping Bag with Count */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open shopping bag, ${count} items`}
              className="relative grid size-10 cursor-pointer place-items-center text-foreground transition-colors hover:text-gold-deep"
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.4} />
              <span className="absolute top-1 right-0.5 grid size-[18px] place-items-center rounded-full bg-[image:var(--gradient-gold)] text-[0.6rem] font-medium text-primary-foreground">
                {count}
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid size-10 cursor-pointer place-items-center text-foreground lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.4} />
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            menuOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div
            onClick={() => setMenuOpen(false)}
            className={cn(
              "absolute inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-500",
              menuOpen ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-[image:var(--gradient-ivory)] shadow-[var(--shadow-lift)] transition-transform duration-500 [transition-timing-function:var(--ease-lux)]",
              menuOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid size-10 cursor-pointer place-items-center text-foreground"
              >
                <X className="size-5" strokeWidth={1.4} />
              </button>
            </div>

            {/* Search in mobile drawer */}
            <div className="border-b border-border/50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex w-full items-center gap-3 border border-border/70 bg-card px-4 py-2.5 text-xs text-muted-foreground"
              >
                <Search className="size-4 text-gold" />
                <span>Search all pieces...</span>
              </button>
            </div>

            <ul className="flex flex-col px-6 py-4">
              {LINKS.map((link) => (
                <li key={link.to} className="border-b border-border/50 last:border-0">
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-4 font-serif text-2xl text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto space-y-3 border-t border-border/60 px-6 py-5">
              <Link
                to="/account"
                search={{ tab: "wishlist" }}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Heart className="size-4 text-gold" strokeWidth={1.4} /> Wishlist
                </span>
                {wishlistCount > 0 ? (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[0.6rem] text-gold-deep font-semibold">
                    {wishlistCount}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
              >
                <User className="size-4" strokeWidth={1.4} />{" "}
                {userEmail ? "My Account" : "Sign In / Register"}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
