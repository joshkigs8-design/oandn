import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

export function Newsletter() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    // Subscription is stored once the Cloud backend is connected.
    toast.success("Almost there", {
      description: "Newsletter storage connects with the O&N backend.",
    });
  };

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-xl px-5 text-center">
        <h2 className="text-3xl lg:text-4xl">Stay in the O&amp;N Circle.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Be the first to discover new collections, exclusive drops and special offers.
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Enter your email
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            maxLength={255}
            className="h-14 flex-1 border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold"
          />
          <Button type="submit" variant="gold" size="luxlg">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
