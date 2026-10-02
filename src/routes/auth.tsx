import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldFlow } from "@/components/GoldFlow";
import { AuthMascot, type MascotState } from "@/components/AuthMascot";
import { Logo } from "@/components/Logo";
import { useServerFn } from "@tanstack/react-start";
import { registerCustomer, autoConfirmUser } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

const DESCRIPTION = "Sign in or register for your O&N account to track orders and checkout.";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { next?: string; mode?: AuthMode } => {
    const next = typeof search["next"] === "string" ? (search["next"] as string) : "";
    const rawMode = typeof search["mode"] === "string" ? (search["mode"] as string) : "";
    const mode = (["signin", "signup", "forgot", "reset"] as const).includes(rawMode as AuthMode)
      ? (rawMode as AuthMode)
      : undefined;
    return {
      ...(next.startsWith("/") && !next.startsWith("//") ? { next } : {}),
      ...(mode ? { mode } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Sign In / Register — O&N" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Sign In / Register — O&N" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const next = search.next;
  const isAdminLogin = next === "/admin";
  const initialMode: AuthMode = isAdminLogin
    ? search.mode === "forgot" || search.mode === "reset"
      ? search.mode
      : "signin"
    : (search.mode ?? (next === "/checkout" ? "signup" : "signin"));

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mood, setMood] = useState<"none" | "error" | "success">("none");
  const [forgotSent, setForgotSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const doRegister = useServerFn(registerCustomer);
  const doConfirm = useServerFn(autoConfirmUser);

  const mascotState: MascotState =
    mood === "error"
      ? "error"
      : mood === "success"
        ? "success"
        : focused === "password"
          ? showPassword || showConfirmPassword
            ? "passwordVisible"
            : "password"
          : focused === "email"
            ? "email"
            : "idle";

  const destination = async () => {
    if (next) return next;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return "/account";
    const isOwnerEmail =
      !!data.user.email &&
      ["oandnfits23@gmail.com", "joshkigs8@gmail.com"].includes(data.user.email.toLowerCase());
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    return isAdmin || isOwnerEmail ? "/admin" : "/account";
  };

  useEffect(() => {
    // Detect password recovery token in url hash
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token=")) {
        setMode("reset");
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
        toast.info("Password Recovery", {
          description: "Please enter your new password below.",
        });
      }
    });

    supabase.auth.getUser().then(async ({ data }) => {
      // If user is already logged in and not in password reset mode, navigate to destination
      if (data.user && mode !== "reset") {
        navigate({ to: await destination() });
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, next]);

  // Handle standard Sign In / Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMood("none");
    try {
      if (mode === "signup") {
        // 1. Create and auto-confirm customer on the server with email_confirm: true
        try {
          await doRegister({ data: { email: email.trim(), password } });
        } catch (serverErr) {
          console.warn("Server register fallback to standard signUp:", serverErr);
          const { error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
          });
          if (signUpError) throw signUpError;
        }

        // 2. Immediately sign in so customer gets a real session token right away
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;

        toast.success("Account created successfully!", {
          description: "Welcome to O&N FITS. Taking you to your destination...",
        });
      } else {
        // Sign in
        let loginResult = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        // If email was unconfirmed from a prior attempt, auto-confirm and retry!
        if (
          loginResult.error &&
          (loginResult.error.message.toLowerCase().includes("not confirmed") ||
            loginResult.error.message.toLowerCase().includes("email_not_confirmed"))
        ) {
          try {
            await doConfirm({ data: { email: email.trim() } });
            loginResult = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });
          } catch {
            // Keep original error
          }
        }

        if (loginResult.error) throw loginResult.error;
      }

      setMood("success");
      const to = await destination();
      setTimeout(() => navigate({ to }), 600);
    } catch (err) {
      setMood("error");
      setTimeout(() => setMood("none"), 1800);
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(
        msg === "Invalid login credentials"
          ? "Invalid email or password. Please verify your details or use Forgot Password."
          : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  // Handle Forgot Password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your account email address");
      return;
    }
    setBusy(true);
    setMood("none");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setMood("success");
      setForgotSent(true);
      toast.success("Password reset instructions sent!", {
        description: `Check ${email} for your secure reset link.`,
      });
    } catch (err) {
      setMood("error");
      setTimeout(() => setMood("none"), 1800);
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  // Handle Set New Password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    setMood("none");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMood("success");
      setResetSuccess(true);
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
      });
      setTimeout(() => {
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        setResetSuccess(false);
      }, 1800);
    } catch (err) {
      setMood("error");
      setTimeout(() => setMood("none"), 1800);
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next ? next : ""}`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: await destination() });
  };

  return (
    <section className="relative overflow-hidden bg-[image:var(--gradient-ivory)] py-16 lg:py-24">
      <GoldFlow className="opacity-40" />
      <div className="relative mx-auto w-full max-w-md px-5">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Notice banner when directed from checkout */}
        {next === "/checkout" && (
          <div className="mb-6 flex items-start gap-3 rounded border border-gold/40 bg-gold/10 p-3.5 text-xs text-foreground">
            <ShieldCheck className="size-4 shrink-0 text-gold-deep mt-0.5" />
            <div>
              <strong className="font-semibold block text-gold-deep">
                Customer Sign-Up Required
              </strong>
              <span>
                Please register or sign in to complete your checkout and enable live order tracking.
              </span>
            </div>
          </div>
        )}

        <p className="eyebrow text-center">
          {isAdminLogin
            ? "O&N Executive Suite"
            : mode === "signin"
              ? "Customer Portal"
              : mode === "signup"
                ? "New Customer Registration"
                : mode === "forgot"
                  ? "Account Recovery"
                  : "Security Update"}
        </p>

        <h1 className="mt-2 text-center font-serif text-3xl sm:text-4xl">
          {isAdminLogin
            ? "Administrator Login"
            : mode === "signin"
              ? "Welcome Back"
              : mode === "signup"
                ? "Create Your Account"
                : mode === "forgot"
                  ? "Forgot Password"
                  : "Set New Password"}
        </h1>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          {isAdminLogin
            ? "Secure administrative access. Only authorized executives may log in."
            : mode === "signin"
              ? "Sign in to track orders, manage your bag, or access your account."
              : mode === "signup"
                ? "Join O&N FITS for expedited checkout, real-time rider tracking, and receipts."
                : mode === "forgot"
                  ? "Enter your email address and we'll send you a password recovery link."
                  : "Enter your new password below to regain account access."}
        </p>

        <AuthMascot state={mascotState} className="mt-5" />

        {/* 1. SIGN IN & SIGN UP FORM */}
        {(mode === "signin" || mode === "signup") && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4 border border-border/70 bg-card p-6 sm:p-7 shadow-sm"
          >
            {/* Mode switch tabs (hidden for Admin) */}
            {!isAdminLogin && (
              <div className="grid grid-cols-2 gap-1 border-b border-border/70 pb-4 mb-2">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`pb-2 text-xs font-medium tracking-[0.16em] uppercase transition-colors ${
                    mode === "signin"
                      ? "border-b-2 border-gold-deep text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`pb-2 text-xs font-medium tracking-[0.16em] uppercase transition-colors ${
                    mode === "signup"
                      ? "border-b-2 border-gold-deep text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <label className="block">
              <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                Email Address
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused((f) => (f === "email" ? null : f))}
                placeholder="e.g. name@example.com"
                className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                  Password
                </span>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setForgotSent(false);
                    }}
                    className="cursor-pointer text-[0.68rem] tracking-[0.08em] text-gold-deep hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused((f) => (f === "password" ? null : f))}
                  placeholder="••••••••"
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

            <Button
              type="submit"
              variant="gold"
              size="luxlg"
              className="w-full mt-2"
              disabled={busy}
            >
              {busy
                ? "Processing…"
                : isAdminLogin
                  ? "Sign In to Admin Portal"
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
            </Button>

            {!isAdminLogin && (
              <Button
                type="button"
                variant="lux"
                size="luxlg"
                className="w-full"
                onClick={google}
                disabled={busy}
              >
                Continue with Google
              </Button>
            )}
          </form>
        )}

        {/* 2. FORGOT PASSWORD FORM */}
        {mode === "forgot" && (
          <form
            onSubmit={handleForgot}
            className="mt-8 space-y-4 border border-border/70 bg-card p-6 sm:p-7 shadow-sm"
          >
            {forgotSent ? (
              <div className="py-4 text-center space-y-3">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-gold/10 text-gold-deep">
                  <Mail className="size-6" />
                </div>
                <h3 className="font-serif text-lg">Check Your Email</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We sent recovery instructions to <strong className="text-foreground">{email}</strong>.
                  Click the link in the email to set a new password.
                </p>
                <Button
                  type="button"
                  variant="gold"
                  size="lux"
                  className="mt-4 w-full"
                  onClick={() => {
                    setMode("signin");
                    setForgotSent(false);
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-gold-deep mb-2">
                  <KeyRound className="size-4" />
                  <span>Enter your account email to receive a recovery link.</span>
                </div>

                <label className="block">
                  <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                    Account Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused((f) => (f === "email" ? null : f))}
                    placeholder="e.g. name@example.com"
                    className="mt-2 w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </label>

                <Button
                  type="submit"
                  variant="gold"
                  size="luxlg"
                  className="w-full mt-2"
                  disabled={busy}
                >
                  {busy ? "Sending Instructions…" : "Send Password Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="flex items-center justify-center gap-1.5 w-full cursor-pointer pt-3 text-center text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-gold-deep"
                >
                  <ArrowLeft className="size-3" />
                  <span>Back to Sign In</span>
                </button>
              </>
            )}
          </form>
        )}

        {/* 3. RESET PASSWORD FORM */}
        {mode === "reset" && (
          <form
            onSubmit={handleReset}
            className="mt-8 space-y-4 border border-border/70 bg-card p-6 sm:p-7 shadow-sm"
          >
            {resetSuccess ? (
              <div className="py-4 text-center space-y-3">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-gold/10 text-gold-deep">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="font-serif text-lg">Password Changed</h3>
                <p className="text-xs text-muted-foreground">
                  Your new password is now active. Redirecting to sign in…
                </p>
              </div>
            ) : (
              <>
                <label className="block">
                  <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                    New Password (min 6 characters)
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
                      placeholder="••••••••"
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

                <label className="block">
                  <span className="text-[0.62rem] tracking-[0.2em] text-muted-foreground uppercase">
                    Confirm New Password
                  </span>
                  <span className="relative mt-2 block">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused((f) => (f === "password" ? null : f))}
                      placeholder="••••••••"
                      className="w-full border border-border bg-background px-4 py-3 pr-12 text-sm outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-muted-foreground hover:text-gold-deep"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="size-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="gold"
                  size="luxlg"
                  className="w-full mt-2"
                  disabled={busy}
                >
                  {busy ? "Updating Password…" : "Save New Password"}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="flex items-center justify-center gap-1.5 w-full cursor-pointer pt-3 text-center text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-gold-deep"
                >
                  <ArrowLeft className="size-3" />
                  <span>Back to Sign In</span>
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
