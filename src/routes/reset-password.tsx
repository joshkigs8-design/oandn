import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordRedirect,
});

function ResetPasswordRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Preserve any auth tokens or hash parameters from Supabase email link
    const hash = window.location.hash;
    navigate({
      to: "/auth",
      search: { mode: "reset" },
      hash: hash.replace(/^#/, ""),
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <div className="inline-block size-6 animate-spin rounded-full border-2 border-gold-deep border-t-transparent" />
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Redirecting to secure password reset...
        </p>
      </div>
    </div>
  );
}
