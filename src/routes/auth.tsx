import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldFlow } from "@/components/GoldFlow";
import { AuthMascot, type MascotState } from "@/components/AuthMascot";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const DESCRIPTION = "Sign in to your O&N account to track orders and manage the store.";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = typeof search["next"] === "string" ? (search["next"] as string) : "";
    return next.startsWith("/") && !next.startsWith("//") ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign In — O&N" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Sign In — O&N" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mood, setMood] = useState<"none" | "error" | "success">("none");

  const mascotState: MascotState =
    mood === "error"
      ? "error"
      : mood === "success"
        ? "success"
        : focused === "password"
          ? showPassword
            ? "passwordVisible"
            : "password"
          : focused === "email"
            ? "email"
            : "idle";

  const destination = async () => {
    if (next) return next;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return "/account";
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    return isAdmin ? "/admin" : "/account";
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) navigate({ to: await destination() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMood("none");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setMood("success");
          toast.success("Check your email to confirm your account.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setMood("success");
      const to = await destination();
      setTimeout(() => navigate({ to }), 900);
    } catch (err) {
      setMood("error");
      setTimeout(() => setMood("none"), 1800);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: await destination() });
  };

  return (
    <section className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-20 lg:py-28">
      <GoldFlow className="opacity-40" />
      <div className="relative mx-auto w-full max-w-md px-5">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <p className="eyebrow text-center">O&amp;N Account</p>
        <h1 className="mt-4 text-center font-serif text-4xl lg:text-5xl">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <AuthMascot state={mascotState} className="mt-6" />
        <form onSubmit={submit} className="mt-10 space-y-4 border border-border/70 bg-card p-7">
          <label className="block">
            <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused((f) => (f === "email" ? null : f))}
              className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
              Password
            </span>
            <span className="relative mt-2 block">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused((f) => (f === "password" ? null : f))}
                className="w-full border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-gold"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-muted-foreground hover:text-gold-deep"
              >
                {showPassword ? (
                  <EyeOff className="size-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="size-4" strokeWidth={1.5} />
                )}
              </button>
            </span>
          </label>
          <Button type="submit" variant="gold" size="luxlg" className="w-full" disabled={busy}>
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
          <Button type="button" variant="lux" size="luxlg" className="w-full" onClick={google}>
            Continue with Google
          </Button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full cursor-pointer pt-2 text-center text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-gold-deep"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}
